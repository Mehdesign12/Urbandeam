import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'
import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'
import { createAdminClient } from '@/lib/supabase/server'

async function getCategories() {
  const supabase = createAdminClient()
  const { data } = await supabase.from('categories').select('id,slug,name,color').order('position', { ascending: true })
  return (data ?? []).map((c: { slug: string; name: Record<string, string>; color: string }) => ({
    value: c.slug,
    label: c.name?.fr ?? c.slug,
    color: c.color,
  }))
}

export default async function NewProductPage() {
  await requireAdmin()
  const categories = await getCategories()

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
          <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>Nouveau produit</span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '28px' }}>
          Créer un produit
        </h1>

        <ProductForm mode="create" categories={categories} />
      </div>
    </AdminShell>
  )
}
