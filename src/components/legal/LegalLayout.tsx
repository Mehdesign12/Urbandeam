import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

type LegalPage = {
  slug: string
  label: string
}

const PAGES: LegalPage[] = [
  { slug: 'terms',          label: 'Terms & Conditions' },
  { slug: 'privacy',        label: 'Privacy Policy' },
  { slug: 'refund',         label: 'Refund Policy' },
  { slug: 'legal-notice',   label: 'Legal Notice' },
  { slug: 'terms-of-use',   label: 'Terms of Use' },
]

type Props = {
  locale: string
  current: string
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalLayout({ locale, current, title, lastUpdated, children }: Props) {
  return (
    <>
      <Navbar locale={locale} />

      <div className="ud-legal__wrapper">
        {/* Sidebar navigation */}
        <aside className="ud-legal__sidebar">
          <p className="ud-legal__sidebar-title">Legal</p>
          <nav>
            <ul className="ud-legal__nav">
              {PAGES.map(({ slug, label }) => (
                <li key={slug}>
                  <Link
                    href={`/${locale}/${slug}`}
                    className={`ud-legal__nav-link${current === slug ? ' ud-legal__nav-link--active' : ''}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="ud-legal__content">
          <div className="ud-legal__header">
            <p className="ud-legal__updated">Last updated: {lastUpdated}</p>
            <h1 className="ud-legal__title">{title}</h1>
          </div>

          <div className="ud-legal__body">
            {children}
          </div>
        </main>
      </div>

      <Footer locale={locale} />

      <style>{`
        .ud-legal__wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 64px;
          align-items: start;
        }

        /* ── Sidebar ── */
        .ud-legal__sidebar {
          position: sticky;
          top: 88px;
        }
        .ud-legal__sidebar-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9CA3AF;
          margin-bottom: 14px;
        }
        .ud-legal__nav { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .ud-legal__nav-link {
          display: block;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          color: #6B7280;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          font-weight: 500;
        }
        .ud-legal__nav-link:hover { background: #F3F4F6; color: #0A0A0A; }
        .ud-legal__nav-link--active {
          background: #F3F4F6;
          color: #0A0A0A;
          font-weight: 600;
        }

        /* ── Content ── */
        .ud-legal__header {
          margin-bottom: 36px;
          padding-bottom: 28px;
          border-bottom: 1px solid #F0F0F0;
        }
        .ud-legal__updated {
          font-size: 12px;
          color: #9CA3AF;
          margin-bottom: 8px;
        }
        .ud-legal__title {
          font-size: 28px;
          font-weight: 700;
          color: #0A0A0A;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        /* ── Prose ── */
        .ud-legal__body { color: #374151; line-height: 1.75; }
        .ud-legal__body h2 {
          font-size: 17px;
          font-weight: 700;
          color: #0A0A0A;
          margin: 36px 0 12px;
          padding-top: 8px;
          border-top: 1px solid #F0F0F0;
        }
        .ud-legal__body h2:first-child { border-top: none; margin-top: 0; }
        .ud-legal__body h3 {
          font-size: 14px;
          font-weight: 700;
          color: #0A0A0A;
          margin: 20px 0 8px;
        }
        .ud-legal__body p { font-size: 14px; margin-bottom: 14px; }
        .ud-legal__body ul, .ud-legal__body ol {
          font-size: 14px;
          padding-left: 20px;
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ud-legal__body a { color: #0A0A0A; text-decoration: underline; }
        .ud-legal__body strong { color: #0A0A0A; font-weight: 600; }
        .ud-legal__body .ud-legal__highlight {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 16px 18px;
          margin: 16px 0;
          font-size: 13px;
        }
        .ud-legal__body .ud-legal__highlight p { margin: 0; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ud-legal__wrapper {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 32px 16px 60px;
          }
          .ud-legal__sidebar { position: static; }
          .ud-legal__nav { flex-direction: row; flex-wrap: wrap; gap: 6px; }
          .ud-legal__nav-link { padding: 6px 10px; font-size: 12px; }
          .ud-legal__title { font-size: 22px; }
        }
      `}</style>
    </>
  )
}
