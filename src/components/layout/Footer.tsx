'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer({ locale }: { locale: string }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const year = new Date().getFullYear()
  const isFr = locale === 'fr'

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  const footerLinks = [
    { href: `/${locale}`, label: isFr ? 'Accueil' : 'Home' },
    { href: `/${locale}/products`, label: isFr ? 'Tous les produits' : 'All Products' },
    { href: `/${locale}/contact`, label: 'Contact' },
    { href: `/${locale}/account`, label: isFr ? 'Mon compte' : 'My account' },
  ]

  const legalLinks = [
    { href: `/${locale}/terms`, label: isFr ? 'CGV' : 'Terms & Conditions' },
    { href: `/${locale}/privacy`, label: isFr ? 'Confidentialité' : 'Privacy Policy' },
    { href: `/${locale}/refund`, label: isFr ? 'Remboursements' : 'Refund Policy' },
    { href: `/${locale}/legal-notice`, label: isFr ? 'Mentions légales' : 'Legal Notice' },
    { href: `/${locale}/terms-of-use`, label: isFr ? 'Conditions d\'utilisation' : 'Terms of Use' },
  ]

  return (
    <footer className="ud-footer">
      {/* ── Main ── */}
      <div className="ud-footer__inner">
        {/* Col 1 — Logo + Newsletter */}
        <div className="ud-footer__col ud-footer__col--wide">
          <Link href={`/${locale}`} style={{ display: 'inline-block', marginBottom: '16px' }}>
            <Image
              src="https://flyhmbookyqckgjotihg.supabase.co/storage/v1/object/public/Logo/urban-deam-logo-long-png.png"
              alt="Urbandeam"
              width={160}
              height={40}
              style={{ objectFit: 'contain', height: '34px', width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
          </Link>
          <p className="ud-footer__tagline">
            {isFr
              ? 'Templates Excel, Notion et PDF pour ton développement personnel.'
              : 'Excel, Notion and PDF templates for your personal development.'
            }
          </p>

          {subscribed ? (
            <div className="ud-footer__subscribed">
              <span>✓</span>
              {isFr ? 'Merci ! Vous êtes inscrit(e).' : "Thanks! You're subscribed."}
            </div>
          ) : (
            <>
              <p className="ud-footer__newsletter-label">
                {isFr ? 'Rejoindre la newsletter' : 'Join the newsletter'}
              </p>
              <form onSubmit={handleNewsletter} className="ud-footer__form">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isFr ? 'ton@email.com' : 'your@email.com'}
                  required
                  className="ud-footer__input"
                />
                <button type="submit" className="ud-footer__submit">→</button>
              </form>
            </>
          )}
        </div>

        {/* Col 2 — Liens */}
        <div className="ud-footer__col">
          <p className="ud-footer__col-title">{isFr ? 'Liens utiles' : 'Quick links'}</p>
          <ul className="ud-footer__list">
            {footerLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="ud-footer__link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Légal */}
        <div className="ud-footer__col">
          <p className="ud-footer__col-title">{isFr ? 'Légal' : 'Legal'}</p>
          <ul className="ud-footer__list">
            {legalLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="ud-footer__link">{label}</Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '28px' }}>
            <p className="ud-footer__col-title">{isFr ? 'Paiement sécurisé' : 'Secure payment'}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              {['Stripe', 'Visa', 'MC'].map(b => (
                <span key={b} style={{
                  padding: '4px 8px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#9CA3AF',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="ud-footer__bottom">
        <span>© {year} Urbandeam. {isFr ? 'Tous droits réservés.' : 'All rights reserved.'}</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/fr" className="ud-footer__lang">{isFr ? '🇫🇷 Français' : '🇫🇷 FR'}</Link>
          <Link href="/en" className="ud-footer__lang">{isFr ? '🇬🇧 English' : '🇬🇧 EN'}</Link>
        </div>
      </div>

      <style>{`
        .ud-footer {
          background: #0A0A0A;
          color: #9CA3AF;
        }
        .ud-footer__inner {
          max-width: 1280px; margin: 0 auto;
          padding: 64px 24px 48px;
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr;
          gap: 64px;
        }
        .ud-footer__col {}
        .ud-footer__col--wide {}
        .ud-footer__tagline {
          font-size: 13px; color: #6B7280;
          line-height: 1.7; margin-bottom: 24px;
          max-width: 300px;
        }
        .ud-footer__newsletter-label {
          font-size: 12px; font-weight: 600; color: white;
          margin-bottom: 10px; text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ud-footer__form { display: flex; gap: 8px; }
        .ud-footer__input {
          flex: 1; padding: 10px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; font-size: 13px;
          color: white; font-family: inherit; outline: none;
          min-width: 0; transition: border-color 0.15s;
        }
        .ud-footer__input:focus { border-color: rgba(255,255,255,0.3); }
        .ud-footer__input::placeholder { color: #4B5563; }
        .ud-footer__submit {
          padding: 10px 18px; background: white;
          color: #0A0A0A; border: none; border-radius: 8px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          flex-shrink: 0; transition: opacity 0.15s;
        }
        .ud-footer__submit:hover { opacity: 0.85; }
        .ud-footer__subscribed {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #10B981;
        }
        .ud-footer__col-title {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #9CA3AF; margin-bottom: 16px;
        }
        .ud-footer__list {
          list-style: none;
          display: flex; flex-direction: column; gap: 12px;
        }
        .ud-footer__link {
          font-size: 13px; color: #6B7280;
          text-decoration: none; transition: color 0.15s;
        }
        .ud-footer__link:hover { color: white; }
        .ud-footer__bottom {
          max-width: 1280px; margin: 0 auto;
          padding: 20px 24px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex; justify-content: space-between;
          align-items: center; font-size: 12px; color: #4B5563;
        }
        .ud-footer__lang {
          font-size: 12px; color: #4B5563;
          text-decoration: none; transition: color 0.15s;
        }
        .ud-footer__lang:hover { color: white; }

        @media (max-width: 900px) {
          .ud-footer__inner { grid-template-columns: 1fr 1fr; gap: 40px; padding: 48px 24px 40px; }
          .ud-footer__col--wide { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .ud-footer__inner { grid-template-columns: 1fr; gap: 32px; }
          .ud-footer__bottom { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>
    </footer>
  )
}
