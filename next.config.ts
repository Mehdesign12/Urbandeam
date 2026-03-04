import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// next-intl v3 : chemin depuis la racine du projet
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.com',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
