'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

const CURRENCIES = ['EUR', 'USD', 'GBP'] as const

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [currency, setCurrency] = useState<string>('EUR')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/products`, label: t('products') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      height: '56px',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 60px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
      }}>

        {/* ── Logo ── */}
        <Link href={`/${locale}`} style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '18px',
          letterSpacing: '-0.03em',
          color: 'var(--color-black)',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          Urban<span style={{ color: 'var(--color-muted)' }}>dream</span>
        </Link>

        {/* ── Nav links (desktop) ── */}
        <nav style={{ display: 'flex', gap: '4px', flex: 1 }} className="nav-desktop">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontSize: '13px',
              fontWeight: 500,
              color: isActive(href) ? 'var(--color-black)' : 'var(--color-secondary)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'color 0.15s, background 0.15s',
              background: isActive(href) ? 'var(--color-gray-50)' : 'transparent',
            }}
            onMouseEnter={e => {
              if (!isActive(href)) {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-black)'
                ;(e.currentTarget as HTMLElement).style.background = 'var(--color-gray-50)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive(href)) {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-secondary)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }
            }}>
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right icons ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

          {/* Currency selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '6px',
                fontFamily: 'var(--font-sans)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-gray-50)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {currency}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5 }}>
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {currencyOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                minWidth: '80px',
                overflow: 'hidden',
                zIndex: 100,
              }}>
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => { setCurrency(c); setCurrencyOpen(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: c === currency ? 600 : 400,
                      color: c === currency ? 'var(--color-black)' : 'var(--color-secondary)',
                      background: c === currency ? 'var(--color-gray-50)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-gray-50)')}
                    onMouseLeave={e => (e.currentTarget.style.background = c === currency ? 'var(--color-gray-50)' : 'transparent')}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <NavIconBtn href={`/${locale}/products`} label="Rechercher">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </NavIconBtn>

          {/* Account */}
          <NavIconBtn href={`/${locale}/account`} label="Mon compte">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </NavIconBtn>

          {/* Cart */}
          <div style={{ position: 'relative' }}>
            <NavIconBtn href={`/${locale}/cart`} label="Panier">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </NavIconBtn>
            {/* Badge compteur panier */}
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: 'var(--color-black)',
              color: 'white',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              fontSize: '8px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}>0</span>
          </div>

          {/* Mobile burger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              padding: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-black)',
            }}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid var(--color-border)',
          padding: '16px 24px',
        }} className="nav-mobile">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                fontSize: '15px',
                fontWeight: 500,
                color: isActive(href) ? 'var(--color-black)' : 'var(--color-secondary)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--color-gray-100)',
              }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}

function NavIconBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      color: 'var(--color-secondary)',
      textDecoration: 'none',
      transition: 'background 0.15s, color 0.15s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.background = 'var(--color-gray-50)'
      ;(e.currentTarget as HTMLElement).style.color = 'var(--color-black)'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.background = 'transparent'
      ;(e.currentTarget as HTMLElement).style.color = 'var(--color-secondary)'
    }}>
      {children}
    </Link>
  )
}
