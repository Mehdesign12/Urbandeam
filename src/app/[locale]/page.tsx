import { createAdminClient } from '@/lib/supabase/server'
import type { Product } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/shop/ProductGrid'
import Link from 'next/link'

type Props = {
  params: Promise<{ locale: string }>
}

async function getProducts(): Promise<Product[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
  if (error) { console.error(error); return [] }
  return data ?? []
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const products = await getProducts()
  const popular = products.slice(0, 4)

  const categories = [
    {
      key: 'excel',
      emoji: '📊',
      labelFr: 'Excel',
      labelEn: 'Excel',
      descFr: 'Tableaux de bord, budgets, trackers — prêts à l\'emploi',
      descEn: 'Dashboards, budgets, trackers — ready to use',
      count: products.filter(p => p.category === 'excel').length,
    },
    {
      key: 'notion',
      emoji: '📋',
      labelFr: 'Notion',
      labelEn: 'Notion',
      descFr: 'Systèmes de productivité et d\'organisation complets',
      descEn: 'Complete productivity and organization systems',
      count: products.filter(p => p.category === 'notion').length,
    },
    {
      key: 'pdf',
      emoji: '📄',
      labelFr: 'PDF',
      labelEn: 'PDF',
      descFr: 'Guides pratiques et planners à imprimer',
      descEn: 'Practical guides and printable planners',
      count: products.filter(p => p.category === 'pdf').length,
    },
  ]

  const isFr = locale === 'fr'

  return (
    <>
      <Navbar locale={locale} />

      <main>
        {/* ═══════════════════════════════════════
            HERO
        ═══════════════════════════════════════ */}
        <section style={{
          background: 'var(--color-black)',
          color: 'white',
          padding: '90px 0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Cercle décoratif */}
          <div style={{
            position: 'absolute',
            right: '-120px',
            top: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 60px' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '12px',
              color: '#9CA3AF',
              marginBottom: '28px',
              letterSpacing: '0.02em',
            }}>
              <span style={{ color: 'var(--color-success)', fontSize: '10px' }}>●</span>
              {isFr ? '3 nouveaux templates disponibles' : '3 new templates available'}
            </div>

            {/* H1 */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(40px, 6vw, 64px)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '20px',
              maxWidth: '680px',
            }}>
              {isFr
                ? <>Développe ton<br /><span style={{ color: '#6B7280' }}>plein potentiel</span></>
                : <>Unlock your<br /><span style={{ color: '#6B7280' }}>full potential</span></>
              }
            </h1>

            <p style={{
              fontSize: '17px',
              color: '#9CA3AF',
              maxWidth: '520px',
              lineHeight: 1.6,
              marginBottom: '36px',
            }}>
              {isFr
                ? 'Des templates Excel, Notion et PDF conçus pour gérer ton budget, booster ta productivité et atteindre tes objectifs.'
                : 'Excel, Notion and PDF templates designed to manage your budget, boost productivity and reach your goals.'
              }
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href={`/${locale}/products`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'white',
                color: 'var(--color-black)',
                padding: '13px 26px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 150ms',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                {isFr ? 'Voir les produits' : 'Browse products'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            {/* Social proof */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '48px',
              paddingTop: '40px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px',
              color: '#6B7280',
            }}>
              <span style={{
                width: '18px', height: '18px',
                background: 'var(--color-success)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 700,
                flexShrink: 0,
              }}>✓</span>
              {isFr ? 'Paiement sécurisé · Téléchargement immédiat · Support inclus' : 'Secure payment · Instant download · Support included'}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            POPULAIRES
        ═══════════════════════════════════════ */}
        <section style={{ padding: 'var(--spacing-6xl) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <p className="section-label">{isFr ? 'Notre sélection' : 'Our selection'}</p>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}>
                  {isFr ? 'Les plus populaires' : 'Most popular'}
                </h2>
              </div>
              <Link href={`/${locale}/products`} style={{
                fontSize: '13px',
                color: 'var(--color-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-black)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-secondary)'}
              >
                {isFr ? 'Tout voir' : 'View all'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <ProductGrid products={popular} locale={locale} columns={4} priorityCount={4} />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CATÉGORIES
        ═══════════════════════════════════════ */}
        <section style={{ padding: 'var(--spacing-6xl) 0', borderBottom: '1px solid var(--color-gray-100)', background: 'var(--color-gray-50)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 60px' }}>
            <div style={{ marginBottom: '32px' }}>
              <p className="section-label">{isFr ? 'Nos formats' : 'Our formats'}</p>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}>
                {isFr ? 'Parcourir par catégorie' : 'Browse by category'}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }} className="category-grid">
              {categories.map(cat => (
                <Link key={cat.key} href={`/${locale}/products?cat=${cat.key}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '28px',
                    cursor: 'pointer',
                    transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--color-black)'
                    el.style.boxShadow = 'var(--shadow-md)'
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--color-border)'
                    el.style.boxShadow = 'none'
                    el.style.transform = 'translateY(0)'
                  }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{cat.emoji}</div>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '18px',
                      marginBottom: '6px',
                      color: 'var(--color-black)',
                    }}>
                      {isFr ? cat.labelFr : cat.labelEn}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                      {isFr ? cat.descFr : cat.descEn}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {cat.count} {isFr ? (cat.count > 1 ? 'produits' : 'produit') : (cat.count > 1 ? 'products' : 'product')}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TOUS LES PRODUITS
        ═══════════════════════════════════════ */}
        {products.length > 4 && (
          <section style={{ padding: 'var(--spacing-6xl) 0' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 60px' }}>
              <div style={{ marginBottom: '32px' }}>
                <p className="section-label">{isFr ? 'Catalogue complet' : 'Full catalog'}</p>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}>
                  {isFr ? 'Tous nos produits' : 'All our products'}
                </h2>
              </div>
              <ProductGrid products={products} locale={locale} columns={4} priorityCount={0} />
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            CTA FINAL
        ═══════════════════════════════════════ */}
        <section style={{
          background: 'var(--color-black)',
          color: 'white',
          padding: '80px 0',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '36px',
              letterSpacing: '-0.03em',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}>
              {isFr ? 'Prêt(e) à passer à l\'action ?' : 'Ready to take action?'}
            </h2>
            <p style={{ fontSize: '15px', color: '#9CA3AF', marginBottom: '32px', lineHeight: 1.6 }}>
              {isFr
                ? 'Télécharge ton premier template et commence ton parcours dès aujourd\'hui.'
                : 'Download your first template and start your journey today.'
              }
            </p>
            <Link href={`/${locale}/products`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              color: 'var(--color-black)',
              padding: '14px 28px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
              transition: 'opacity 150ms',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              {isFr ? 'Découvrir les templates' : 'Explore templates'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer locale={locale} />

      <style>{`
        @media (max-width: 768px) {
          .category-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
