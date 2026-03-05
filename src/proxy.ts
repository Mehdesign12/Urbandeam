import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Exclure : api, _next, _vercel, fichiers statiques ET tout le préfixe /admin
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
  ],
}
