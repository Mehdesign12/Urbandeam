import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.urbandeam.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/fr/success', '/en/success'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
