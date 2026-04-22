import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  const supabase = createAdminClient()

  const { data: cats } = await supabase.from('categories').select('slug,name,color').order('position', { ascending: true })
  const categories = (cats ?? []).map((c: { slug: string; name: Record<string, string>; color: string }) => ({
    value: c.slug,
    label: c.name?.fr ?? c.slug,
    color: c.color,
  }))

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  const title = (product.title as Record<string, string>)
  const desc  = (product.description as Record<string, string>)

  const initialData = {
    slug:           product.slug,
    title_fr:       title?.fr  ?? '',
    title_en:       title?.en  ?? '',
    description_fr: desc?.fr   ?? '',
    description_en: desc?.en   ?? '',
    price:          String((product.price ?? 0) / 100),
    price_original: product.price_original ? String(product.price_original / 100) : '',
    category:       product.category ?? 'pdf',
    image_url:      product.image_url ?? '',
    gallery_urls:   Array.isArray(product.gallery_urls) ? product.gallery_urls : [],
    file_path:      product.file_path ?? '',
    is_published:   product.is_published ?? false,
    sort_order:     String(product.sort_order ?? 0),
  }

  return (
    <AdminShell>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#A3A3A3', textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Produits
          </Link>
          <span style={{ color: '#E5E5E5' }}>/</span>
          <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>
            {title?.fr ?? product.slug}
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '28px' }}>
          Éditer le produit
        </h1>

        <ProductForm mode="edit" productId={id} initialData={initialData} categories={categories} />
      </div>
    </AdminShell>
  )
}
