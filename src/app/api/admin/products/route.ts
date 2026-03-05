import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('ud_admin_session')
  return session?.value === 'authenticated'
}

// GET /api/admin/products — liste tous les produits
export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data })
}

// POST /api/admin/products — créer un produit
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const {
    slug, title_fr, title_en, description_fr, description_en,
    price, price_original, category, image_url, file_path,
    is_published, sort_order,
  } = body

  // Validation
  if (!slug || !title_fr || !price) {
    return NextResponse.json({ error: 'Champs obligatoires manquants (slug, title_fr, price)' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Vérifier slug unique
  const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).single()
  if (existing) return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 })

  const { data, error } = await supabase
    .from('products')
    .insert({
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      title: { fr: title_fr, en: title_en ?? title_fr },
      description: { fr: description_fr ?? '', en: description_en ?? '' },
      price: Math.round(Number(price) * 100), // € → centimes
      price_original: price_original ? Math.round(Number(price_original) * 100) : null,
      category: category ?? 'pdf',
      image_url: image_url ?? null,
      file_path: file_path ?? null,
      is_published: is_published ?? false,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data }, { status: 201 })
}
