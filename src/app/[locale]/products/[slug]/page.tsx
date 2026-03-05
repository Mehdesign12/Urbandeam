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

              {/* Bouton Add to cart */}
              <BuyButton
                productId={product.id}
                locale={locale}
                label={isFr ? 'Acheter maintenant' : 'Buy now'}
              />

              {/* More payment options */}
              <p style={{ textAlign: 'center', marginTop: '12px' }}>
                <Link href={`/${locale}/checkout`} style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'underline' }}>
                  {isFr ? "Plus d'options de paiement" : 'More payment options'}
                </Link>
              </p>

              {/* Promo / info */}
              <div className="ud-detail__promo-box">
                {isFr
                  ? `Achetez 2 produits ou plus et économisez 20%.`
                  : 'Buy two or more products and get 20% off.'
                }
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
        imageUrl={product.image_url}
        locale={locale}
        label={isFr ? 'Ajouter au panier' : 'Add to cart'}
      />

      <Footer locale={locale} />

      <style>{`
        .ud-detail {
          max-width: 1280px; margin: 0 auto;
          padding: 40px 24px 60px;
        }
        .ud-detail__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
          margin-bottom: 64px;
        }
        .ud-detail__info { position: sticky; top: 80px; }
        .ud-detail__title {
          font-size: 24px; font-weight: 700; color: #0A0A0A;
          line-height: 1.3; margin-bottom: 12px;
          font-family: var(--font-heading); letter-spacing: -0.02em;
        }
        .ud-detail__price-row {
          display: flex; align-items: baseline; gap: 10px;
          margin-bottom: 20px;
        }
        .ud-detail__price { font-size: 20px; font-weight: 500; color: #0A0A0A; }
        .ud-detail__price-original { font-size: 16px; color: #9CA3AF; text-decoration: line-through; }
        .ud-detail__badge-sale {
          font-size: 11px; font-weight: 700;
          background: #FEF3C7; color: #92400E;
          padding: 3px 8px; border-radius: 4px;
        }
        .ud-detail__bundle {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; background: #F9FAFB;
          border: 1px solid #E5E7EB; border-radius: 10px;
          margin-bottom: 20px;
        }
        .ud-detail__bundle-img {
          width: 48px; height: 48px; border-radius: 6px;
          background: #E5E7EB; flex-shrink: 0;
          overflow: hidden; position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .ud-detail__bundle-title { font-size: 13px; font-weight: 600; color: #0A0A0A; }
        .ud-detail__bundle-sub { font-size: 12px; color: #6B7280; margin-top: 2px; }
        .ud-detail__promo-box {
          margin: 16px 0; padding: 12px 16px;
          background: #F9FAFB; border: 1px solid #E5E7EB;
          border-radius: 8px; font-size: 13px; color: #374151;
          text-align: center;
        }
        .ud-detail__desc-section { margin: 20px 0; }
        .ud-detail__benefits {
          list-style: none; display: flex; flex-direction: column; gap: 8px;
          padding-top: 16px; border-top: 1px solid #F0F0F0;
        }
        .ud-detail__benefit-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #374151;
        }
        .ud-detail__faq {
          padding-top: 60px; border-top: 1px solid #F0F0F0;
          max-width: 720px;
        }
        .ud-detail__section-title {
          font-size: 22px; font-weight: 700; color: #0A0A0A;
          letter-spacing: -0.02em; margin-bottom: 28px;
          font-family: var(--font-heading);
        }
        .ud-detail__related {
          background: #F9FAFB; padding: 60px 0;
          border-top: 1px solid #E5E7EB;
        }
        .ud-detail__related-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
        }

        @media (max-width: 900px) {
          .ud-detail__grid { grid-template-columns: 1fr; gap: 32px; }
          .ud-detail__info { position: static; }
        }
        @media (max-width: 640px) {
          .ud-detail { padding: 24px 16px 80px; }
        }
      `}</style>
    </>
  )
}
