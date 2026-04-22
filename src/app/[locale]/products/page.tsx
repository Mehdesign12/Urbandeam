import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/shop/ProductGrid'
import CatalogFilters from '@/components/shop/CatalogFilters'
import SortSelect from '@/components/shop/SortSelect'
import GridToggle from '@/components/shop/GridToggle'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string; sort?: string; view?: string }>
}

const BASE_URL = 'https://www.urbandeam.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale === 'fr'
  const canonical = `${BASE_URL}/${locale}/products`
  return {
    title: isFr ? 'Tous nos templates — Urbandeam' : 'All Templates — Urbandeam',
    description: isFr
      ? 'Parcourez tous nos templates Excel, PDF et Notion pour le développement personnel, la productivité et la gestion financière. Téléchargement immédiat.'
      : 'Browse all our Excel, PDF and Notion templates for personal development, productivity and financial management. Instant download.',
    alternates: {
      canonical,
      languages: {
        'fr': `${BASE_URL}/fr/products`,
        'en': `${BASE_URL}/en/products`,
        'x-default': `${BASE_URL}/fr/products`,
      },
    },
    openGraph: {
      title: isFr ? 'Tous nos templates | Urbandeam' : 'All Templates | Urbandeam',
      description: isFr
        ? 'Templates Excel, PDF et Notion pour booster votre productivité.'
        : 'Excel, PDF and Notion templates to boost your productivity.',
      url: canonical,
      type: 'website',
      siteName: 'Urbandeam',
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Urbandeam Templates' }],
    },
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true })
    return data ?? []
  } catch { return [] }
}

async function getProducts(category?: string, sort?: string): Promise<Product[]> {
  try {
    const supabase = createAdminClient()
    let query = supabase.from('products').select('*').eq('is_published', true)
    if (category) {
      query = query.eq('category', category)
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
    { value: 'popular',    label: 'Populaires' },
    { value: 'newest',     label: 'Plus récents' },
    { value: 'price_asc',  label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
  ],
  en: [
    { value: 'popular',    label: 'Popular' },
    { value: 'newest',     label: 'Newest' },
    { value: 'price_asc',  label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
  ],
}

const FILTER_OPTIONS = {
  fr: [
    { label: 'Disponibilité', options: ['Tous les produits', 'En stock'] },
    { label: 'Prix', options: ['Tous les prix', 'Moins de $10', '$10 - $20', 'Plus de $20'] },
  ],
  en: [
    { label: 'Availability', options: ['All products', 'In stock'] },
    { label: 'Price', options: ['All prices', 'Under $10', '$10 - $20', 'Over $20'] },
  ],
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { cat, sort } = await searchParams
  const isFr = locale === 'fr'

  const [products, categories] = await Promise.all([
    getProducts(cat, sort),
    getCategories(),
  ])
  const sortOptions = SORT_OPTIONS[locale as 'fr' | 'en'] ?? SORT_OPTIONS.fr
  const filterOptions = FILTER_OPTIONS[locale as 'fr' | 'en'] ?? FILTER_OPTIONS.fr
  const catOptions = categories.map(c => ({
    value: c.slug,
    label: (c.name as Record<string, string>)[locale] ?? (c.name as Record<string, string>).fr ?? c.slug,
  }))

  return (
    <>
      <Navbar locale={locale} />

      <main style={{ background: '#FFFFFF', minHeight: '80vh' }}>
        <div className="ud-catalog">

          {/* ── Titre de page ── */}
          <h1 className="ud-catalog__title">
            {isFr ? 'Produits' : 'Products'}
          </h1>

          {/* ── Barre filtres ── */}
          <div className="ud-catalog__toolbar">
            {/* Gauche — Availability + Price */}
            <Suspense fallback={
              <div style={{ display: 'flex', gap: '8px' }}>
                {filterOptions.map(f => (
                  <div key={f.label} className="ud-catalog__filter-btn">{f.label}</div>
                ))}
              </div>
            }>
              <CatalogFilters
                categories={catOptions}
                activeCategory={cat ?? ''}
                locale={locale}
                filterOptions={filterOptions}
              />
            </Suspense>

            {/* Droite — count + Sort + grid toggle */}
            <div className="ud-catalog__toolbar-right">
              <span className="ud-catalog__count">
                {products.length} {isFr ? 'article' : 'item'}{products.length > 1 ? 's' : ''}
              </span>
              <Suspense fallback={
                <div className="ud-catalog__filter-btn">
                  {isFr ? 'Tri ↓' : 'Sort ↓'}
                </div>
              }>
                <SortSelect options={sortOptions} activeSort={sort ?? 'popular'} variant="inline" />
              </Suspense>
              <Suspense fallback={null}>
                <GridToggle />
              </Suspense>
            </div>
          </div>

          {/* ── Grille ── */}
          <div style={{ marginTop: '24px' }}>
            <ProductGrid products={products} locale={locale} columns={4} priorityCount={8} />
          </div>
        </div>
      </main>

      <Footer locale={locale} />

      <style>{`
        .ud-catalog {
          max-width: 1280px; margin: 0 auto;
          padding: 24px 16px 60px;
        }
        @media (min-width: 640px) { .ud-catalog { padding: 32px 24px 80px; } }
        @media (min-width: 1024px) { .ud-catalog { padding: 40px 40px 80px; } }

        .ud-catalog__title {
          font-size: 24px; font-weight: 700; color: #0A0A0A;
          margin-bottom: 20px;
          font-family: var(--font-heading);
          letter-spacing: -0.02em;
        }
        @media (min-width: 768px) { .ud-catalog__title { font-size: 28px; margin-bottom: 28px; } }

        .ud-catalog__toolbar {
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 16px;
          border-bottom: 1px solid #EFEFEF;
          flex-wrap: wrap;
        }
        @media (min-width: 640px) { .ud-catalog__toolbar { gap: 16px; padding-bottom: 20px; } }

        .ud-catalog__toolbar-right {
          display: flex; align-items: center; gap: 8px;
          margin-left: auto;
        }
        @media (min-width: 640px) { .ud-catalog__toolbar-right { gap: 12px; } }

        .ud-catalog__count {
          font-size: 12px; color: #6B7280;
          white-space: nowrap;
        }
        @media (min-width: 640px) { .ud-catalog__count { font-size: 13px; } }

        .ud-catalog__filter-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border: 1px solid #E5E5E5;
          border-radius: 6px; font-size: 12px; color: #0A0A0A;
          background: white; cursor: pointer;
          font-family: inherit; transition: border-color 0.12s;
        }
        @media (min-width: 640px) { .ud-catalog__filter-btn { font-size: 13px; padding: 7px 14px; } }
        .ud-catalog__filter-btn:hover { border-color: #0A0A0A; }
      `}</style>
    </>
  )
}
