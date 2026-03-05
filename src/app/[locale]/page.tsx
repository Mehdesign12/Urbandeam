import { createAdminClient } from '@/lib/supabase/server'
import type { Product } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/shop/ProductGrid'
import Link from 'next/link'
import { WarpBackground } from '@/components/ui/WarpBackground'

type Props = {
  params: Promise<{ locale: string }>
}

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
    if (error) { console.error('Supabase error:', error); return [] }
    return data ?? []
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return []
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const products = await getProducts()
  const popular = products.slice(0, 4)
  // On affiche max 4 produits populaires en grille 4 colonnes sur desktop

  const categories = [
    {
      key: 'excel',
      emoji: '📊',
      labelFr: 'Excel',
      labelEn: 'Excel',
      descFr: "Tableaux de bord, budgets, trackers — prêts à l'emploi",
      descEn: 'Dashboards, budgets, trackers — ready to use',
      count: products.filter(p => p.category === 'excel').length,
    },
    {
      key: 'notion',
      emoji: '📋',
      labelFr: 'Notion',
      labelEn: 'Notion',
      descFr: "Systèmes de productivité et d'organisation complets",
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
            HERO — WarpBackground (Magic UI)
        ═══════════════════════════════════════ */}
        <WarpBackground
          beamsPerSide={3}
          beamSize={5}
          beamDuration={16}
          beamDelayMax={12}
          beamDelayMin={3}
          perspective={120}
          gridColor="rgba(0,0,0,0.06)"
          className="ud-hero"
        >
          <div className="ud-container ud-hero__content">

            {/* Bloc texte — rectangle blanc avec bordure gris claire */}
            <div className="ud-hero__card">

              <div className="ud-hero__badge">
                <span className="ud-hero__dot">●</span>
                {isFr ? '3 nouveaux templates disponibles' : '3 new templates available'}
              </div>

              <h1 className="ud-hero__title">
                {isFr
                  ? <>{`Développe ton`}<br /><span className="ud-hero__title--accent">{`plein potentiel`}</span></>
                  : <>Unlock your<br /><span className="ud-hero__title--accent">full potential</span></>
                }
              </h1>

              <p className="ud-hero__desc">
                {isFr
                  ? "Des templates Excel, Notion et PDF conçus pour gérer ton budget, booster ta productivité et atteindre tes objectifs."
                  : 'Excel, Notion and PDF templates designed to manage your budget, boost productivity and reach your goals.'
                }
              </p>

              <div className="ud-hero__ctas">
                <Link href={`/${locale}/products`} className="ud-hero__btn">
                  {isFr ? 'Voir les produits' : 'Browse products'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              <div className="ud-hero__proof">
                <span className="ud-hero__check">✓</span>
                {isFr ? 'Paiement sécurisé · Téléchargement immédiat · Support inclus' : 'Secure payment · Instant download · Support included'}
              </div>

            </div>
          </div>
        </WarpBackground>

        {/* ═══════════════════════════════════════
            POPULAIRES
        ═══════════════════════════════════════ */}
        <section className="ud-section ud-section--border">
          <div className="ud-container">
            <div className="ud-section__header">
              <div>
                <p className="section-label">{isFr ? 'Notre sélection' : 'Our selection'}</p>
                <h2 className="ud-section__title">
                  {isFr ? 'Les plus populaires' : 'Most popular'}
                </h2>
              </div>
              <Link href={`/${locale}/products`} className="ud-link-arrow">
                {isFr ? 'Tout voir' : 'View all'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <ProductGrid products={popular} locale={locale} columns={4} priorityCount={4} cardSize="large" />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CATÉGORIES
        ═══════════════════════════════════════ */}
        <section className="ud-section ud-section--border ud-section--gray">
          <div className="ud-container">
            <div style={{ marginBottom: '32px' }}>
              <p className="section-label">{isFr ? 'Nos formats' : 'Our formats'}</p>
              <h2 className="ud-section__title">
                {isFr ? 'Parcourir par catégorie' : 'Browse by category'}
              </h2>
            </div>

            <div className="ud-category-grid">
              {categories.map(cat => (
                <Link key={cat.key} href={`/${locale}/products?cat=${cat.key}`} className="ud-category-card">
                  <div className="ud-category-card__emoji">{cat.emoji}</div>
                  <div className="ud-category-card__title">
                    {isFr ? cat.labelFr : cat.labelEn}
                  </div>
                  <div className="ud-category-card__desc">
                    {isFr ? cat.descFr : cat.descEn}
                  </div>
                  <div className="ud-category-card__count">
                    {cat.count} {isFr ? (cat.count > 1 ? 'produits' : 'produit') : (cat.count > 1 ? 'products' : 'product')}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
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
          <section className="ud-section">
            <div className="ud-container">
              <div style={{ marginBottom: '32px' }}>
                <p className="section-label">{isFr ? 'Catalogue complet' : 'Full catalog'}</p>
                <h2 className="ud-section__title">
                  {isFr ? 'Tous nos produits' : 'All our products'}
                </h2>
              </div>
              <ProductGrid products={products} locale={locale} columns={4} priorityCount={0} cardSize="large" />
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            CTA FINAL
        ═══════════════════════════════════════ */}
        <section className="ud-cta">
          <div className="ud-cta__inner">
            <h2 className="ud-cta__title">
              {isFr ? "Prêt(e) à passer à l'action ?" : 'Ready to take action?'}
            </h2>
            <p className="ud-cta__desc">
              {isFr
                ? "Télécharge ton premier template et commence ton parcours dès aujourd'hui."
                : 'Download your first template and start your journey today.'
              }
            </p>
            <Link href={`/${locale}/products`} className="ud-btn-primary">
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
        /* ══════════════════════════════════════
           CONTAINER — mobile-first
        ══════════════════════════════════════ */
        .ud-container {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 16px;
        }
        @media (min-width: 480px)  { .ud-container { padding: 0 20px; } }
        @media (min-width: 768px)  { .ud-container { padding: 0 32px; } }
        @media (min-width: 1024px) { .ud-container { padding: 0 48px; } }

        /* ── HERO ── */
        /* WarpBackground gère position:relative + overflow:hidden */
        .ud-hero {
          background: #ffffff !important;
          width: 100%;
        }
        /* Padding via ud-hero__content */
        .ud-hero__content {
          padding-top: 48px;
          padding-bottom: 48px;
        }
        @media (min-width: 768px) {
          .ud-hero__content { padding-top: 72px; padding-bottom: 72px; }
        }

        /* ── Card texte — rectangle blanc, bordure gris clair ── */
        .ud-hero__card {
          display: inline-block;
          background: #ffffff;
          border: 1.5px solid #D1D5DB;
          border-radius: 14px;
          padding: 32px 36px 28px;
          max-width: 560px;
          box-shadow: 0 1px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03);
        }
        @media (max-width: 640px) {
          .ud-hero__card { padding: 24px 20px 20px; max-width: 100%; width: 100%; }
        }

        /* ── Badge ── */
        .ud-hero__badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #F9FAFB; border: 1px solid #E5E7EB;
          border-radius: 20px; padding: 4px 12px;
          font-size: 11px; color: #9CA3AF;
          margin-bottom: 18px; letter-spacing: 0.03em;
          font-family: 'Montserrat', 'Roboto', system-ui, sans-serif;
          font-weight: 500; text-transform: uppercase;
        }
        .ud-hero__dot { color: #9CA3AF; font-size: 8px; }

        /* ── Titre — Montserrat, simple, minimaliste ── */
        .ud-hero__title {
          font-family: 'Montserrat', 'Roboto', system-ui, sans-serif;
          font-weight: 700;
          font-size: clamp(24px, 4.5vw, 44px);
          letter-spacing: -0.01em;
          line-height: 1.15;
          color: #374151;
          margin-bottom: 14px;
        }
        @media (min-width: 768px) { .ud-hero__title { margin-bottom: 16px; } }
        .ud-hero__title--accent { color: #9CA3AF; font-weight: 400; }

        /* ── Description ── */
        .ud-hero__desc {
          font-family: 'Montserrat', 'Roboto', system-ui, sans-serif;
          font-size: 13.5px;
          color: #9CA3AF;
          line-height: 1.7;
          margin-bottom: 24px;
          font-weight: 400;
        }
        @media (min-width: 768px) { .ud-hero__desc { font-size: 14.5px; margin-bottom: 28px; } }

        /* ── CTA ── */
        .ud-hero__ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .ud-hero__btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #F3F4F6; color: #374151;
          padding: 11px 20px; border-radius: 8px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          font-family: 'Montserrat', 'Roboto', system-ui, sans-serif;
          letter-spacing: 0.02em;
          transition: background 200ms, border-color 200ms;
          border: 1.5px solid #D1D5DB;
        }
        .ud-hero__btn:hover { background: #E9EBEE; border-color: #C4C9D0; }
        .ud-hero__btn:active { transform: scale(0.99); }

        /* ── Preuve ── */
        .ud-hero__proof {
          display: flex; align-items: center; gap: 8px;
          margin-top: 22px; padding-top: 20px;
          border-top: 1px solid #F3F4F6;
          font-size: 11px; color: #C4C9D0;
          font-family: 'Montserrat', 'Roboto', system-ui, sans-serif;
          letter-spacing: 0.02em;
        }
        .ud-hero__check {
          width: 16px; height: 16px; background: #D1D5DB;
          border-radius: 50%; display: inline-flex; align-items: center;
          justify-content: center; color: white; font-size: 8px;
          font-weight: 700; flex-shrink: 0;
        }

        /* ud-btn-primary (section CTA finale — style gris clair) */
        .ud-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #F3F4F6; color: #374151;
          padding: 12px 22px; border-radius: 8px;
          font-size: 13.5px; font-weight: 600; text-decoration: none;
          font-family: 'Montserrat', 'Roboto', var(--font-sans), sans-serif;
          letter-spacing: 0.02em;
          border: 1.5px solid #D1D5DB;
          transition: background 200ms, border-color 200ms;
        }
        .ud-btn-primary:hover { background: #E9EBEE; border-color: #C4C9D0; }

        /* ── SECTIONS ── */
        .ud-section { padding: 48px 0; }
        @media (min-width: 768px) { .ud-section { padding: var(--spacing-6xl) 0; } }
        .ud-section--border { border-bottom: 1px solid var(--color-gray-100); }
        .ud-section--gray { background: var(--color-gray-50); }
        .ud-section__header {
          display: flex; flex-direction: column; align-items: flex-start;
          gap: 12px; margin-bottom: 24px;
        }
        @media (min-width: 640px) {
          .ud-section__header { flex-direction: row; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        }
        .ud-section__title {
          font-family: var(--font-heading); font-size: 22px;
          font-weight: 700; letter-spacing: -0.02em;
        }
        @media (min-width: 768px) { .ud-section__title { font-size: 28px; } }
        .section-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--color-muted); margin-bottom: 6px;
        }
        .ud-link-arrow {
          font-size: 13px; color: var(--color-secondary); text-decoration: none;
          display: flex; align-items: center; gap: 4px; transition: color 0.15s;
          white-space: nowrap;
        }
        .ud-link-arrow:hover { color: var(--color-black); }

        /* ── CATEGORIES ── */
        .ud-category-grid {
          display: grid; grid-template-columns: 1fr; gap: 12px;
        }
        @media (min-width: 480px) { .ud-category-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 768px) { .ud-category-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }

        .ud-category-card {
          display: block; text-decoration: none; background: white;
          border: 1px solid var(--color-border); border-radius: 12px;
          padding: 20px; cursor: pointer;
          transition: border-color 200ms, box-shadow 200ms, transform 200ms;
        }
        @media (min-width: 768px) { .ud-category-card { padding: 28px; } }
        .ud-category-card:hover {
          border-color: var(--color-black); box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .ud-category-card__emoji { font-size: 28px; margin-bottom: 10px; }
        @media (min-width: 768px) { .ud-category-card__emoji { font-size: 36px; margin-bottom: 12px; } }
        .ud-category-card__title {
          font-family: var(--font-heading); font-weight: 700;
          font-size: 16px; margin-bottom: 5px; color: var(--color-black);
        }
        @media (min-width: 768px) { .ud-category-card__title { font-size: 18px; } }
        .ud-category-card__desc {
          font-size: 12px; color: var(--color-secondary);
          margin-bottom: 12px; line-height: 1.5;
        }
        @media (min-width: 768px) { .ud-category-card__desc { font-size: 13px; margin-bottom: 16px; } }
        .ud-category-card__count {
          font-size: 12px; color: var(--color-muted);
          display: flex; align-items: center; gap: 4px;
        }

        /* ── CTA FINAL ── fond blanc, ton gris ── */
        .ud-cta { background: #F9FAFB; color: #374151; padding: 60px 0; text-align: center; border-top: 1px solid #E5E7EB; }
        @media (min-width: 768px) { .ud-cta { padding: 80px 0; } }
        .ud-cta__inner { max-width: 560px; margin: 0 auto; padding: 0 20px; }
        @media (min-width: 768px) { .ud-cta__inner { padding: 0 60px; } }
        .ud-cta__title {
          font-family: 'Montserrat', 'Roboto', var(--font-heading), sans-serif; font-weight: 700;
          font-size: clamp(22px, 4vw, 32px);
          letter-spacing: -0.01em; margin-bottom: 14px; line-height: 1.2;
          color: #374151;
        }
        .ud-cta__desc { font-size: 14px; color: #9CA3AF; margin-bottom: 28px; line-height: 1.6;
          font-family: 'Montserrat', 'Roboto', system-ui, sans-serif;
        }
        @media (min-width: 768px) { .ud-cta__desc { font-size: 15px; margin-bottom: 32px; } }
      `}</style>
    </>
  )
}
