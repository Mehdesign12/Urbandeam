import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Appliquer next-intl UNIQUEMENT aux routes publiques
    // Exclure : api, _next, _vercel, fichiers statiques, ET /admin
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
  ],
}
