import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/reviews?product_id=... — liste publique des avis publiés d'un produit
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')

  if (!productId) {
    return NextResponse.json({ error: 'product_id requis' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, author_name, is_verified, rating, title, text, photo_url, review_date')
    .eq('product_id', productId)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('review_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
}
