import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Locales supportées
  locales: ['fr', 'en'],

  // Locale par défaut (FR — marché principal)
  defaultLocale: 'fr',

  // Préfixe dans l'URL : 'as-needed' = /fr masqué, /en visible
  localePrefix: 'as-needed',
})
