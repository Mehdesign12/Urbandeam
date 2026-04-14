import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PixelPurchase from '@/components/pixel/PixelPurchase'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ session_id?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Commande confirmée – Urban Deam' : 'Order confirmed – Urban Deam',
    robots: { index: false },
  }
}

async function SuccessContent({
  locale,
  sessionId,
}: {
  locale: string
  sessionId?: string
}) {
  const fr = locale === 'fr'

  // Récupérer la session Stripe pour afficher les détails
  let customerEmail = ''
  let productTitle = ''
  let purchaseValue = 0
  let purchaseCurrency = 'EUR'
  let purchaseProductId = ''

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
      })
      customerEmail = session.customer_details?.email ?? session.customer_email ?? ''
      productTitle =
        session.line_items?.data?.[0]?.description ??
        session.line_items?.data?.[0]?.price?.product?.toString() ??
        ''

      // Données pour le pixel Purchase
      purchaseValue = (session.amount_total ?? 0) / 100
      purchaseCurrency = (session.currency ?? 'eur').toUpperCase()
      purchaseProductId = session.metadata?.product_id ?? ''

      // Essayer de récupérer le nom du produit depuis Supabase via metadata
      const productSlug = session.metadata?.product_slug
      if (productSlug) {
        try {
          const supabase = createAdminClient()
          const { data } = await supabase
            .from('products')
            .select('title')
            .eq('slug', productSlug)
            .single()
          if (data?.title) {
            const t = data.title as Record<string, string>
            productTitle = t[locale] ?? t['fr'] ?? productTitle
          }
        } catch {
          // Garder le titre Stripe si Supabase échoue
        }
      }
    } catch {
      // Si la session est invalide, on affiche quand même la page de succès
    }
  }

  return (
    <>
      {purchaseValue > 0 && (
        <PixelPurchase
          contentIds={purchaseProductId ? [purchaseProductId] : []}
          value={purchaseValue}
          currency={purchaseCurrency}
        />
      )}
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Icône succès */}
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '50%',
          background: '#DCFCE7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        {/* Titre */}
        <h1 style={{
          fontSize: '26px', fontWeight: 700,
          color: '#0A0A0A', marginBottom: '12px',
          lineHeight: 1.3,
        }}>
          {fr ? 'Merci pour votre commande !' : 'Thank you for your order!'}
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontSize: '15px', color: '#6B7280',
          lineHeight: 1.6, marginBottom: productTitle || customerEmail ? '24px' : '32px',
        }}>
          {fr
            ? 'Votre paiement a bien été reçu. Vous recevrez un e-mail de confirmation avec votre lien de téléchargement.'
            : 'Your payment was received. You will get a confirmation email with your download link shortly.'}
        </p>

        {/* Détails de commande */}
        {(productTitle || customerEmail) && (
          <div style={{
            background: '#F9FAFB',
            borderRadius: '12px',
            padding: '20px 24px',
            textAlign: 'left',
            marginBottom: '32px',
          }}>
            {productTitle && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: customerEmail ? '12px' : 0 }}>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{fr ? 'Produit' : 'Product'}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A', maxWidth: '240px', textAlign: 'right' }}>{productTitle}</span>
              </div>
            )}
            {customerEmail && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>E-mail</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>{customerEmail}</span>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Link
            href={`/${locale}/products`}
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#0A0A0A',
              color: 'white',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            {fr ? 'Continuer mes achats' : 'Continue shopping'}
          </Link>

          <Link
            href={`/${locale}`}
            style={{
              fontSize: '13px',
              color: '#6B7280',
              textDecoration: 'none',
            }}
          >
            {fr ? '← Retour à l\u2019accueil' : '← Back to home'}
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}

export default async function SuccessPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { session_id } = await searchParams

  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound()
  }

  return (
    <>
      <Navbar locale={locale} />
      <Suspense
        fallback={
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'ud-spin 0.8s linear infinite' }} />
          </div>
        }
      >
        <SuccessContent locale={locale} sessionId={session_id} />
      </Suspense>
      <Footer locale={locale} />
      <style>{`
        @keyframes ud-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
