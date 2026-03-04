import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'fr': '/fr',
        'en': '/en',
      },
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Valider la locale
  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound()
  }

  // Récupérer les messages de traduction
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
