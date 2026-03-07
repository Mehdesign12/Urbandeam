import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('ud_admin_session')
  return session?.value === 'authenticated'
}

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/admin/products/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
  return NextResponse.json({ product: data })
}

// PUT /api/admin/products/[id] — mettre à jour
export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const {
    slug, title_fr, title_en, description_fr, description_en,
    price, price_original, category, image_url, file_path,
    is_published, sort_order,
  } = body

  const supabase = createAdminClient()

  // Vérifier slug unique (sauf soi-même)
  if (slug) {
    const { data: existing } = await supabase
      .from('products').select('id').eq('slug', slug).neq('id', id).single()
    if (existing) return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (slug !== undefined)             updateData.slug = slug.toLowerCase().replace(/\s+/g, '-')
  if (title_fr !== undefined)         updateData.title = { fr: title_fr, en: title_en ?? title_fr }
  if (description_fr !== undefined)   updateData.description = { fr: description_fr, en: description_en ?? '' }
  if (price !== undefined)            updateData.price = Math.round(Number(price) * 100)
  if (price_original !== undefined)   updateData.price_original = price_original ? Math.round(Number(price_original) * 100) : null
  if (category !== undefined)         updateData.category = category
  if (image_url !== undefined)        updateData.image_url = image_url
  if (file_path !== undefined)        updateData.file_path = file_path
  if (is_published !== undefined)     updateData.is_published = is_published
  if (sort_order !== undefined)       updateData.sort_order = sort_order

  const { data, error } = await supabase
    .from('products').update(updateData).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[DELETE product] SUPABASE_SERVICE_ROLE_KEY manquant')
    return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
  }

  const supabase = createAdminClient()

  // 1. Récupérer les infos du produit (image + fichier) avant suppression
  const { data: product, error: fetchError } = await supabase
    .from('products').select('image_url, file_path').eq('id', id).single()

  if (fetchError) {
    console.error('[DELETE product] fetch error:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // 2. Supprimer les order_items liés (FK constraint order_items_product_id_fkey)
  const { error: itemsError } = await supabase
    .from('order_items').delete().eq('product_id', id)

  if (itemsError) {
    console.error('[DELETE product] order_items delete error:', itemsError)
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // 3. Supprimer le produit en base
  const { error: deleteError } = await supabase.from('products').delete().eq('id', id)
  if (deleteError) {
    console.error('[DELETE product] delete error:', deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // 4. Nettoyer les fichiers Supabase Storage (best effort, ne bloque pas)
  if (product) {
    try {
      if (product.image_url) {
        const imageKey = product.image_url.split('/storage/v1/object/public/products/')[1]
        if (imageKey) await supabase.storage.from('products').remove([imageKey])
      }
      if (product.file_path) {
        const fileKey = product.file_path.split('/storage/v1/object/public/products/')[1]
          ?? product.file_path.replace(/^.*products\//, '')
        if (fileKey) await supabase.storage.from('products').remove([fileKey])
      }
    } catch (storageErr) {
      console.warn('[DELETE product] storage cleanup error (non-fatal):', storageErr)
    }
  }

  return NextResponse.json({ success: true })
}
