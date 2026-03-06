import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

const BASE = 'https://www.urbandeam.com'
const LOCALES = ['fr', 'en']

const STATIC_PAGES = [
  '',               // homepage
  '/products',
  '/categories/excel',
  '/categories/notion',
  '/categories/pdf',
]

const LEGAL_PAGES = [
  '/legal-notice',
  '/privacy',
  '/refund',
  '/terms',
  '/terms-of-use',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  const entries: MetadataRoute.Sitemap = []

  // Root redirect (x-default)
  entries.push({
    url: BASE,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  })

  // Static pages pour chaque locale
  for (const locale of LOCALES) {
    const prefix = locale === 'fr' ? '/fr' : '/en'

    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${BASE}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'weekly',
        priority: page === '' ? 0.9 : 0.8,
      })
    }

    // Pages légales (priorité basse)
    for (const page of LEGAL_PAGES) {
      entries.push({
        url: `${BASE}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.2,
      })
    }

    // Pages produits dynamiques
    for (const product of products ?? []) {
      entries.push({
        url: `${BASE}${prefix}/products/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.85,
      })
    }
  }

  return entries
}
