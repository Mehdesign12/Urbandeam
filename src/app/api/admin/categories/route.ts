import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get('ud_admin_session')?.value === 'authenticated'
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data })
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { slug, name_fr, name_en, color, position } = await req.json()

  if (!slug || !name_fr) {
    return NextResponse.json({ error: 'slug et name_fr sont requis' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).single()
  if (existing) return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 })

  const { data: maxPos } = await supabase
    .from('categories').select('position').order('position', { ascending: false }).limit(1).single()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      name: { fr: name_fr, en: name_en || name_fr },
      color: color || '#6B7280',
      position: position ?? ((maxPos?.position ?? -1) + 1),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ category: data }, { status: 201 })
}
