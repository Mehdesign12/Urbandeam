import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exclure les routes API et les fichiers statiques
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Appliquer le middleware i18n
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Matcher pour next-intl : toutes les routes sauf API et statiques
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
    '/',
  ],
}
