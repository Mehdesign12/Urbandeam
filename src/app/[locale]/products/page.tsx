import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import type { Product, ProductCategory } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/shop/ProductGrid'
import CatalogFilters from '@/components/shop/CatalogFilters'
import SortSelect from '@/components/shop/SortSelect'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string; sort?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Tous nos produits — Urbandeam' : 'All Products — Urbandeam',
    description: locale === 'fr'
      ? 'Templates Excel, PDF et Notion pour le développement personnel, la productivité et la gestion financière.'
      : 'Excel, PDF and Notion templates for personal development, productivity and financial management.',
  }
}

async function getProducts(category?: string, sort?: string): Promise<Product[]> {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_published', true)

    if (category && ['excel', 'pdf', 'notion'].includes(category)) {
      query = query.eq('category', category as ProductCategory)
    }

    switch (sort) {
      case 'price_asc':  query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'newest':     query = query.order('created_at', { ascending: false }); break
      default:           query = query.order('sort_order', { ascending: true }); break
    }

    const { data, error } = await query
    if (error) { console.error('Supabase error:', error); return [] }
    return data ?? []
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return []
  }
}

const SORT_OPTIONS = {
  fr: [
    { value: 'popular',    label: 'Les plus populaires' },
    { value: 'newest',     label: 'Les plus récents' },
    { value: 'price_asc',  label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
  ],
  en: [
    { value: 'popular',    label: 'Most popular' },
    { value: 'newest',     label: 'Newest' },
    { value: 'price_asc',  label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
  ],
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { cat, sort } = await searchParams
  const isFr = locale === 'fr'

  const products = await getProducts(cat, sort)
  const sortOptions = SORT_OPTIONS[locale as 'fr' | 'en'] ?? SORT_OPTIONS.fr

  const CATEGORIES = [
    { value: '',       label: isFr ? 'Tous' : 'All' },
    { value: 'excel',  label: 'Excel' },
    { value: 'notion', label: 'Notion' },
    { value: 'pdf',    label: 'PDF' },
  ]

  return (
    <>
      <Navbar locale={locale} />

      <main>
        {/* ── Header page ── */}
        <div style={{
          background: 'var(--color-gray-50)',
          borderBottom: '1px solid var(--color-border)',
          padding: '40px 0 32px',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 60px' }}>
            {/* Breadcrumb */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--color-muted)',
              marginBottom: '16px',
            }}>
              <span>{isFr ? 'Accueil' : 'Home'}</span>
              <span>/</span>
              <span style={{ color: 'var(--color-black)' }}>{isFr ? 'Produits' : 'Products'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '28px',
                  letterSpacing: '-0.02em',
                  marginBottom: '4px',
                }}>
                  {cat
                    ? CATEGORIES.find(c => c.value === cat)?.label
                    : (isFr ? 'Tous les produits' : 'All products')
                  }
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>
                  {products.length} {isFr
                    ? (products.length > 1 ? 'produits' : 'produit')
                    : (products.length > 1 ? 'products' : 'product')
                  }
                </p>
              </div>

              {/* SortSelect — Client Component, nécessite Suspense */}
              <Suspense fallback={
                <div style={{
                  padding: '8px 32px 8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: 'white',
                  color: 'var(--color-muted)',
                  minWidth: '160px',
                }}>
                  {isFr ? 'Tri...' : 'Sort...'}
                </div>
              }>
                <SortSelect options={sortOptions} activeSort={sort ?? 'popular'} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ── Filtres + Grille ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 60px 80px' }}>
          {/* CatalogFilters — Client Component avec useSearchParams, nécessite Suspense */}
          <Suspense fallback={
            <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
              {CATEGORIES.map(c => (
                <div key={c.value} style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  border: '1px solid var(--color-border)',
                  background: 'white',
                  color: 'var(--color-muted)',
                }}>
                  {c.label}
                </div>
              ))}
            </div>
          }>
            <CatalogFilters categories={CATEGORIES} activeCategory={cat ?? ''} locale={locale} />
          </Suspense>

          <ProductGrid products={products} locale={locale} columns={4} priorityCount={4} />
        </div>
      </main>

      <Footer locale={locale} />

      <style>{`
        @media (max-width: 768px) {
          .ud-container { padding: 0 20px; }
        }
      `}</style>
    </>
  )
}
