'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const year = new Date().getFullYear()

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  const footerLinks = [
    { href: `/${locale}`, label: t('links_title') === 'Liens utiles' ? 'Accueil' : 'Home' },
    { href: `/${locale}/products`, label: locale === 'fr' ? 'Produits' : 'Products' },
    { href: `/${locale}/contact`, label: t('contact') },
    { href: `/${locale}/account`, label: locale === 'fr' ? 'Mon compte' : 'My account' },
  ]

  const legalLinks = [
    { href: `/${locale}/privacy`, label: t('privacy') },
    { href: `/${locale}/terms`, label: t('terms') },
  ]

  return (
    <footer style={{ background: 'var(--color-footer)', color: '#9CA3AF' }}>

      {/* ── Social proof band ── */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '16px 60px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#9CA3AF',
        }}>
          <span style={{
            width: '20px', height: '20px',
            background: 'var(--color-success)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}>✓</span>
          {locale === 'fr'
            ? 'Fabriqué pour votre développement personnel — Paiement 100% sécurisé via Stripe'
            : 'Crafted for your personal development — 100% secure payment via Stripe'
          }
        </div>
      </div>

      {/* ── Main footer ── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 60px 40px',
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr',
        gap: '60px',
      }} className="footer-grid">

        {/* Col 1 — Newsletter + Logo */}
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '20px',
            letterSpacing: '-0.03em',
            color: 'white',
            marginBottom: '8px',
          }}>
            Urban<span style={{ color: '#6B7280' }}>dream</span>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', lineHeight: 1.6 }}>
            {t('tagline').replace('❤️', '♥')}
          </p>

          <p style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
            {t('newsletter_title')}
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
            {t('newsletter_subtitle')}
          </p>

          {subscribed ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--color-success)',
            }}>
              <span>✓</span>
              {locale === 'fr' ? 'Merci ! Vous êtes inscrit(e).' : 'Thanks! You\'re subscribed.'}
            </div>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('newsletter_placeholder')}
                required
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  minWidth: 0,
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.3)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <button type="submit" style={{
                padding: '10px 16px',
                background: 'white',
                color: 'var(--color-black)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                flexShrink: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >→</button>
            </form>
          )}
        </div>

        {/* Col 2 — Liens */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '16px' }}>
            {t('links_title')}
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {footerLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Légal */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '16px' }}>
            {t('legal_title')}
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {legalLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Payment badges */}
          <div style={{ marginTop: '32px' }}>
            <p style={{ fontSize: '11px', color: '#4B5563', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {locale === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Stripe badge */}
              <div style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#9CA3AF',
                fontWeight: 600,
              }}>
                Stripe
              </div>
              <div style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#9CA3AF',
                fontWeight: 600,
              }}>
                SSL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '20px 60px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#4B5563',
      }} className="footer-bottom">
        <span>{t('copyright').replace('{year}', String(year))}</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>🇫🇷 FR</span>
          <span>·</span>
          <Link href="/en" style={{ color: '#4B5563', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
          >EN</Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 40px 24px 32px !important; }
          .footer-bottom { flex-direction: column; gap: 8px; padding: 16px 24px !important; }
        }
      `}</style>
    </footer>
  )
}
