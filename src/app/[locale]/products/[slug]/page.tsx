import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import type { Product } from '@/types'
import { getLocalizedField, getPriceDisplay, CATEGORY_LABELS } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/shop/ProductGrid'
import BuyButton from '@/components/shop/BuyButton'
import FaqAccordion from '@/components/shop/FaqAccordion'
import ProductGallery from '@/components/shop/ProductGallery'
import StickyAddToCart from '@/components/shop/StickyAddToCart'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products').select('*')
      .eq('slug', slug).eq('is_published', true).single()
    if (error) return null
    return data
  } catch { return null }
}

async function getRelatedProducts(category: string, excludeSlug: string): Promise<Product[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('products').select('*')
      .eq('is_published', true).eq('category', category)
      .neq('slug', excludeSlug).order('sort_order').limit(4)
    return data ?? []
  } catch { return [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Produit introuvable' }
  const title = getLocalizedField(product.title, locale as 'fr' | 'en')
  const description = getLocalizedField(product.description, locale as 'fr' | 'en')
  return {
    title: `${title} — Urbandeam`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | Urbandeam`,
      description: description.slice(0, 160),
      images: product.image_url ? [product.image_url] : [],
    },
  }
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

  // Simuler plusieurs images (en prod, stocker dans un tableau JSONB)
  const images = product.image_url
    ? [product.image_url, product.image_url, product.image_url]
    : []

  const faqItems = isFr ? [
    { q: 'Comment je reçois mon fichier ?', a: "Dès que votre paiement est confirmé, vous recevez un email avec le lien de téléchargement. Le fichier est aussi disponible dans votre espace client." },
    { q: 'Combien de fois puis-je télécharger ?', a: "Vous pouvez télécharger votre achat jusqu'à 5 fois, valable pendant 30 jours après l'achat." },
    { q: 'Compatible avec quelle version ?', a: 'Les templates Excel sont compatibles avec Microsoft Excel 2016+ et Google Sheets. Les templates Notion nécessitent un compte Notion (gratuit).' },
    { q: 'Puis-je être remboursé(e) ?', a: "Les produits digitaux étant livrés immédiatement, les remboursements sont soumis à notre politique SAV. Contactez-nous dans les 48h si vous rencontrez un problème." },
  ] : [
    { q: 'How do I receive my file?', a: 'As soon as your payment is confirmed, you receive an email with the download link.' },
    { q: 'How many times can I download?', a: 'You can download your purchase up to 5 times, valid for 30 days after purchase.' },
    { q: 'Which version is it compatible with?', a: 'Excel templates are compatible with Microsoft Excel 2016+ and Google Sheets. Notion templates require a Notion account (free).' },
    { q: 'Can I get a refund?', a: 'As digital products are delivered immediately, refunds are subject to our support policy. Contact us within 48h if you encounter an issue.' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image: product.image_url ?? undefined,
    brand: { '@type': 'Brand', name: 'Urbandeam' },
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <Navbar locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ background: '#FFFFFF' }}>
        <div className="ud-detail">

          {/* ── Layout 2 colonnes ── */}
          <div className="ud-detail__grid">

            {/* ── Galerie images ── */}
            <ProductGallery images={images} title={title} />

            {/* ── Infos produit ── */}
            <div className="ud-detail__info">

              {/* Titre */}
              <h1 className="ud-detail__title">{title}</h1>

              {/* Prix */}
              <div className="ud-detail__price-row">
                <span className="ud-detail__price">{price.full}</span>
                {price.isOnSale && price.originalFull && (
                  <span className="ud-detail__price-original">{price.originalFull}</span>
                )}
                {price.isOnSale && (
                  <span className="ud-detail__badge-sale">
                    {isFr ? 'PROMO' : 'SALE'} -{price.discountPercent}%
                  </span>
                )}
              </div>

              {/* Bundle upsell */}
              {related.length > 0 && (
                <div className="ud-detail__bundle">
                  <div className="ud-detail__bundle-img">
                    {related[0].image_url ? (
                      <Image src={related[0].image_url} alt="" fill style={{ objectFit: 'cover' }} sizes="48px" />
                    ) : <span style={{ fontSize: '24px' }}>📦</span>}
                  </div>
                  <div>
                    <p className="ud-detail__bundle-title">
                      {isFr ? 'Le bundle complet →' : 'The bundle →'}
                    </p>
                    <p className="ud-detail__bundle-sub">
                      {isFr ? 'Économisez en achetant le bundle.' : 'Save money and buy the bundle.'}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Social proof / urgence ── */}
              <div className="ud-detail__social-proof">
                <div className="ud-detail__stars">
                  {'★★★★★'.split('').map((s, i) => <span key={i} className="ud-detail__star">{s}</span>)}
                  <span className="ud-detail__rating">4.8</span>
                  <span className="ud-detail__reviews">({isFr ? '127 avis' : '127 reviews'})</span>
                </div>
                <div className="ud-detail__proof-badges">
                  <span className="ud-detail__proof-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {isFr ? '127 acheteurs ce mois' : '127 buyers this month'}
                  </span>
                  <span className="ud-detail__proof-badge ud-detail__proof-badge--hot">
                    🔥 {isFr ? 'Populaire cette semaine' : 'Trending this week'}
                  </span>
                </div>
              </div>

              {/* Bouton Add to cart */}
              <BuyButton
                productId={product.id}
                locale={locale}
                label={isFr ? 'Acheter maintenant' : 'Buy now'}
              />

              {/* ── Bloc garantie ── */}
              <div className="ud-detail__trust">
                <div className="ud-detail__trust-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>{isFr ? 'Satisfait ou remboursé 30 jours' : '30-day money-back guarantee'}</span>
                </div>
                <div className="ud-detail__trust-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <span>{isFr ? 'Téléchargement immédiat' : 'Instant download'}</span>
                </div>
                <div className="ud-detail__trust-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>{isFr ? 'Paiement 100% sécurisé' : '100% secure payment'}</span>
                </div>
                <div className="ud-detail__trust-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span>{isFr ? 'Support inclus' : 'Support included'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="ud-detail__desc-section">
                {description.split('\n').map((p, i) => (
                  <p key={i} style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, marginBottom: '12px' }}>{p}</p>
                ))}
              </div>

              {/* Avantages */}
              <ul className="ud-detail__benefits">
                {(isFr ? [
                  'Accès immédiat après paiement',
                  '5 téléchargements — valables 30 jours',
                  'Compatible Excel 2016+, Google Sheets & Notion',
                  'Support email inclus',
                  'Mises à jour gratuites',
                ] : [
                  'Immediate access after payment',
                  '5 downloads — valid for 30 days',
                  'Compatible with Excel 2016+, Google Sheets & Notion',
                  'Email support included',
                  'Free lifetime updates',
                ]).map(item => (
                  <li key={item} className="ud-detail__benefit-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="ud-detail__faq">
            <h2 className="ud-detail__section-title">
              {isFr ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
            <FaqAccordion items={faqItems} />
          </div>
        </div>

        {/* ── You may also like ── */}
        {related.length > 0 && (
          <section className="ud-detail__related">
            <div className="ud-detail__related-inner">
              <h2 className="ud-detail__section-title" style={{ marginBottom: '24px' }}>
                {isFr ? 'Vous aimerez aussi' : 'You may also like'}
              </h2>
              <ProductGrid products={related} locale={locale} columns={4} priorityCount={0} />
            </div>
          </section>
        )}
      </main>

      {/* ── Sticky bar ── */}
      <StickyAddToCart
        productId={product.id}
        slug={product.slug}
        title={title}
        price={price.full}
        priceRaw={product.price}
        priceOriginal={price.isOnSale ? price.originalFull : null}
        isOnSale={price.isOnSale}
        imageUrl={product.image_url}
        locale={locale}
        label={isFr ? 'Acheter maintenant' : 'Buy now'}
      />

      <Footer locale={locale} />

      <style>{`
        .ud-detail {
          max-width: 1280px; margin: 0 auto;
          padding: 24px 16px 80px;
        }
        @media (min-width: 640px) { .ud-detail { padding: 32px 24px 80px; } }
        @media (min-width: 1024px) { .ud-detail { padding: 40px 40px 60px; } }

        .ud-detail__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
          margin-bottom: 48px;
        }
        @media (min-width: 900px) {
          .ud-detail__grid {
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            margin-bottom: 64px;
          }
        }
        .ud-detail__info { position: static; }
        @media (min-width: 900px) { .ud-detail__info { position: sticky; top: 80px; } }

        .ud-detail__title {
          font-size: 22px; font-weight: 700; color: #0A0A0A;
          line-height: 1.3; margin-bottom: 10px;
          font-family: var(--font-heading); letter-spacing: -0.02em;
        }
        @media (min-width: 768px) { .ud-detail__title { font-size: 26px; } }

        .ud-detail__price-row {
          display: flex; align-items: baseline; gap: 10px;
          margin-bottom: 16px; flex-wrap: wrap;
        }
        @media (min-width: 768px) { .ud-detail__price-row { margin-bottom: 20px; } }
        .ud-detail__price { font-size: 20px; font-weight: 500; color: #0A0A0A; }
        .ud-detail__price-original { font-size: 16px; color: #9CA3AF; text-decoration: line-through; }
        .ud-detail__badge-sale {
          font-size: 11px; font-weight: 700;
          background: #FEF3C7; color: #92400E;
          padding: 3px 8px; border-radius: 4px;
        }

        /* ── Social proof ── */
        .ud-detail__social-proof {
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 18px; padding-bottom: 18px;
          border-bottom: 1px solid #F0F0F0;
        }
        .ud-detail__stars {
          display: flex; align-items: center; gap: 4px;
        }
        .ud-detail__star { color: #F59E0B; font-size: 14px; }
        .ud-detail__rating {
          font-size: 14px; font-weight: 700; color: #0A0A0A; margin-left: 2px;
        }
        .ud-detail__reviews { font-size: 13px; color: #6B7280; }
        .ud-detail__proof-badges {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .ud-detail__proof-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11.5px; font-weight: 500; color: #374151;
          background: #F3F4F6; border: 1px solid #E5E7EB;
          padding: 3px 9px; border-radius: 20px;
        }
        .ud-detail__proof-badge--hot {
          background: #FFF7ED; border-color: #FED7AA; color: #92400E;
        }

        /* ── Bloc garantie ── */
        .ud-detail__trust {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-top: 16px;
          padding: 14px 16px;
          background: #F9FAFB; border: 1px solid #E5E7EB;
          border-radius: 12px;
        }
        .ud-detail__trust-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #374151; font-weight: 500;
          line-height: 1.4;
        }
        @media (max-width: 480px) {
          .ud-detail__trust { grid-template-columns: 1fr; gap: 8px; }
        }
        .ud-detail__bundle {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; background: #F9FAFB;
          border: 1px solid #E5E7EB; border-radius: 10px;
          margin-bottom: 16px;
        }
        .ud-detail__bundle-img {
          width: 44px; height: 44px; border-radius: 6px;
          background: #E5E7EB; flex-shrink: 0;
          overflow: hidden; position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .ud-detail__bundle-title { font-size: 13px; font-weight: 600; color: #0A0A0A; }
        .ud-detail__bundle-sub { font-size: 12px; color: #6B7280; margin-top: 2px; }
        .ud-detail__promo-box {
          margin: 12px 0; padding: 10px 14px;
          background: #F9FAFB; border: 1px solid #E5E7EB;
          border-radius: 8px; font-size: 13px; color: #374151;
          text-align: center;
        }
        .ud-detail__desc-section { margin: 16px 0; }
        .ud-detail__benefits {
          list-style: none; display: flex; flex-direction: column; gap: 8px;
          padding-top: 14px; border-top: 1px solid #F0F0F0;
        }
        .ud-detail__benefit-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #374151;
        }
        .ud-detail__faq {
          padding-top: 48px; border-top: 1px solid #F0F0F0;
          max-width: 720px;
        }
        @media (min-width: 768px) { .ud-detail__faq { padding-top: 60px; } }
        .ud-detail__section-title {
          font-size: 20px; font-weight: 700; color: #0A0A0A;
          letter-spacing: -0.02em; margin-bottom: 20px;
          font-family: var(--font-heading);
        }
        @media (min-width: 768px) { .ud-detail__section-title { font-size: 22px; margin-bottom: 28px; } }
        .ud-detail__related {
          background: #F9FAFB; padding: 48px 0;
          border-top: 1px solid #E5E7EB;
        }
        @media (min-width: 768px) { .ud-detail__related { padding: 60px 0; } }
        .ud-detail__related-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 16px;
        }
        @media (min-width: 640px) { .ud-detail__related-inner { padding: 0 24px; } }
      `}</style>
    </>
  )
}
