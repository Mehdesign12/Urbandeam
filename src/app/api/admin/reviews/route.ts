import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('ud_admin_session')
  return session?.value === 'authenticated'
}

// GET /api/admin/reviews — liste tous les avis (avec infos produit)
export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*, product:products(id, slug, title)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data })
}

// POST /api/admin/reviews — créer un avis
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const {
    product_id, author_name, is_verified, rating,
    title, text, photo_url, review_date,
    is_published, sort_order,
  } = body

  if (!product_id || !author_name || !rating) {
    return NextResponse.json({ error: 'Champs obligatoires : product_id, author_name, rating' }, { status: 400 })
  }

  const ratingInt = Number(rating)
  if (!Number.isInteger(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    return NextResponse.json({ error: 'rating doit être un entier entre 1 et 5' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id,
      author_name,
      is_verified: is_verified ?? true,
      rating: ratingInt,
      title: title ?? null,
      text: text ?? null,
      photo_url: photo_url ?? null,
      review_date: review_date ?? new Date().toISOString().slice(0, 10),
      is_published: is_published ?? true,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ review: data }, { status: 201 })
}
