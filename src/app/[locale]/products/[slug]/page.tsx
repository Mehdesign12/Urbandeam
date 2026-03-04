import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import type { Product } from '@/types'
import { getLocalizedField, getPriceDisplay, CATEGORY_LABELS } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/shop/ProductGrid'
import BuyButton from '@/components/shop/BuyButton'
import FaqAccordion from '@/components/shop/FaqAccordion'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) return null
  return data
}

async function getRelatedProducts(category: string, excludeSlug: string): Promise<Product[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('sort_order')
    .limit(4)
  return data ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Produit introuvable' }

  const title = getLocalizedField(product.title, locale as 'fr' | 'en')
  const description = getLocalizedField(product.description, locale as 'fr' | 'en')
  const price = getPriceDisplay(product.price, product.price_original)
  const category = CATEGORY_LABELS[product.category] ?? product.category

  return {
    title: `${title} — Template ${category} | Urbandeam`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | Urbandeam`,
      description: description.slice(0, 160),
      images: product.image_url ? [product.image_url] : [],
    },
    // Schema.org Product via JSON-LD (ajouté dans le composant)
    other: {
      'product:price:amount': String(product.price / 100),
      'product:price:currency': 'EUR',
    },
  }
}

const CATEGORY_EMOJI: Record<string, string> = {
  excel: '📊', notion: '📋', pdf: '📄',
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  const isFr = locale === 'fr'

  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, slug)
  const title = getLocalizedField(product.title, locale as 'fr' | 'en')
  const description = getLocalizedField(product.description, locale as 'fr' | 'en')
  const price = getPriceDisplay(product.price, product.price_original)
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category

  // FAQ selon locale
  const faqItems = isFr ? [
    { q: 'Comment je reçois mon fichier ?', a: 'Dès que votre paiement est confirmé, vous recevez un email avec le lien de téléchargement. Le fichier est aussi disponible dans votre espace client.' },
    { q: 'Combien de fois puis-je télécharger ?', a: 'Vous pouvez télécharger votre achat jusqu\'à 5 fois, valable pendant 30 jours après l\'achat.' },
    { q: 'Compatible avec quelle version ?', a: 'Les templates Excel sont compatibles avec Microsoft Excel 2016+ et Google Sheets. Les templates Notion nécessitent un compte Notion (gratuit).' },
    { q: 'Puis-je être remboursé(e) ?', a: 'Les produits digitaux étant livrés immédiatement, les remboursements sont soumis à notre politique SAV. Contactez-nous dans les 48h si vous rencontrez un problème.' },
  ] : [
    { q: 'How do I receive my file?', a: 'As soon as your payment is confirmed, you receive an email with the download link. The file is also available in your account area.' },
    { q: 'How many times can I download?', a: 'You can download your purchase up to 5 times, valid for 30 days after purchase.' },
    { q: 'Which version is it compatible with?', a: 'Excel templates are compatible with Microsoft Excel 2016+ and Google Sheets. Notion templates require a Notion account (free).' },
    { q: 'Can I get a refund?', a: 'As digital products are delivered immediately, refunds are subject to our support policy. Contact us within 48h if you encounter an issue.' },
  ]

  // JSON-LD Schema.org Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: product.image_url ?? undefined,
    brand: { '@type': 'Brand', name: 'Urbandeam' },
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Urbandeam' },
    },
  }

  return (
    <>
      <Navbar locale={locale} />

      {/* JSON-LD Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        {/* ── Breadcrumb ── */}
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '20px 60px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--color-muted)',
        }}>
          <Link href={`/${locale}`} style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-black)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
          >{isFr ? 'Accueil' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${locale}/products`} style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-black)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
          >{isFr ? 'Produits' : 'Products'}</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-black)' }}>{title}</span>
        </div>

        {/* ── Produit principal ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 60px 80px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'start',
          }} className="product-detail-grid">

            {/* ── Image ── */}
            <div>
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '100%',
                background: 'var(--color-card-bg)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
              }}>
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                ) : (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '100px',
                  }}>
                    {CATEGORY_EMOJI[product.category] ?? '📦'}
                  </div>
                )}
              </div>

              {/* Trust signals sous l'image */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginTop: '20px',
                padding: '16px 20px',
                background: 'var(--color-gray-50)',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
              }} className="trust-grid">
                {[
                  { icon: '⚡', text: isFr ? 'Téléchargement immédiat' : 'Instant download' },
                  { icon: '🔒', text: isFr ? 'Paiement sécurisé' : 'Secure payment' },
                  { icon: '📥', text: isFr ? '5 téléchargements' : '5 downloads' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-secondary)', flex: 1 }}>
                    <span style={{ fontSize: '14px' }}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Infos + Achat ── */}
            <div style={{ position: 'sticky', top: '76px' }}>
              {/* Badge catégorie */}
              <div style={{ marginBottom: '12px' }}>
                <span className={`badge badge-${product.category}`}>{categoryLabel}</span>
                {price.isOnSale && (
                  <span className="badge badge-sale" style={{ marginLeft: '6px' }}>
                    {isFr ? 'PROMO' : 'SALE'} -{price.discountPercent}%
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(24px, 3vw, 32px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: '16px',
              }}>
                {title}
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '15px',
                color: 'var(--color-secondary)',
                lineHeight: 1.7,
                marginBottom: '28px',
              }}>
                {description}
              </p>

              {/* Prix */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                marginBottom: '24px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '36px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-black)',
                }}>
                  {price.full}
                </span>
                {price.isOnSale && price.originalFull && (
                  <span style={{
                    fontSize: '18px',
                    color: 'var(--color-muted)',
                    textDecoration: 'line-through',
                  }}>
                    {price.originalFull}
                  </span>
                )}
              </div>

              {/* Bouton Acheter */}
              <BuyButton
                productId={product.id}
                locale={locale}
                label={isFr ? `Acheter maintenant — ${price.full}` : `Buy now — ${price.full}`}
              />

              {/* Séparateur */}
              <div style={{ borderTop: '1px solid var(--color-gray-100)', margin: '24px 0' }} />

              {/* Liste des avantages */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(isFr ? [
                  'Accès immédiat après paiement',
                  'Fichier téléchargeable 5 fois — valable 30 jours',
                  'Compatible Excel 2016+, Google Sheets et Notion',
                  'Support par email inclus',
                  'Mises à jour gratuites à vie',
                ] : [
                  'Immediate access after payment',
                  'Downloadable 5 times — valid for 30 days',
                  'Compatible with Excel 2016+, Google Sheets and Notion',
                  'Email support included',
                  'Free lifetime updates',
                ]).map(item => (
                  <li key={item} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: 'var(--color-secondary)',
                  }}>
                    <span style={{
                      width: '18px', height: '18px',
                      background: 'var(--color-success-bg)',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div style={{ marginTop: '80px', borderTop: '1px solid var(--color-gray-100)', paddingTop: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '24px',
              letterSpacing: '-0.02em',
              marginBottom: '32px',
            }}>
              {isFr ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
            <FaqAccordion items={faqItems} />
          </div>
        </div>

        {/* ── Produits liés ── */}
        {related.length > 0 && (
          <section style={{
            background: 'var(--color-gray-50)',
            borderTop: '1px solid var(--color-border)',
            padding: '60px 0',
          }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 60px' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '22px',
                letterSpacing: '-0.02em',
                marginBottom: '24px',
              }}>
                {isFr ? 'Vous aimerez aussi' : 'You might also like'}
              </h2>
              <ProductGrid products={related} locale={locale} columns={4} priorityCount={0} />
            </div>
          </section>
        )}
      </main>

      <Footer locale={locale} />

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .trust-grid { flex-direction: column; gap: 10px !important; }
        }
      `}</style>
    </>
  )
}
