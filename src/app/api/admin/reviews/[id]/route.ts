import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('ud_admin_session')
  return session?.value === 'authenticated'
}

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/admin/reviews/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*, product:products(id, slug, title)')
    .eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })
  return NextResponse.json({ review: data })
}

// PUT /api/admin/reviews/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const {
    product_id, author_name, is_verified, rating,
    title, text, photo_url, review_date,
    is_published, sort_order,
  } = body

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (product_id   !== undefined) updateData.product_id   = product_id
  if (author_name  !== undefined) updateData.author_name  = author_name
  if (is_verified  !== undefined) updateData.is_verified  = is_verified
  if (rating       !== undefined) {
    const r = Number(rating)
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: 'rating doit être un entier entre 1 et 5' }, { status: 400 })
    }
    updateData.rating = r
  }
  if (title        !== undefined) updateData.title        = title
  if (text         !== undefined) updateData.text         = text
  if (photo_url    !== undefined) updateData.photo_url    = photo_url
  if (review_date  !== undefined) updateData.review_date  = review_date
  if (is_published !== undefined) updateData.is_published = is_published
  if (sort_order   !== undefined) updateData.sort_order   = sort_order

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('product_reviews').update(updateData).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ review: data })
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params

  const supabase = createAdminClient()

  // Récupérer l'avis pour nettoyer la photo du storage
  const { data: review } = await supabase
    .from('product_reviews').select('photo_url').eq('id', id).single()

  const { error } = await supabase.from('product_reviews').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Best effort : supprimer la photo si hébergée sur Supabase Storage
  if (review?.photo_url) {
    try {
      const key = review.photo_url.split('/storage/v1/object/public/product-images/')[1]
      if (key) await supabase.storage.from('product-images').remove([key])
    } catch (e) {
      console.warn('[DELETE review] storage cleanup error (non-fatal):', e)
    }
  }

  return NextResponse.json({ success: true })
}
