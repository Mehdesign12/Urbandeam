import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('ud_admin_session')
  return session?.value === 'authenticated'
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, price_paid, download_count, download_limit,
        product_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data })
}
