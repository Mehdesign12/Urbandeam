'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/shop/CartContext'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD'] as const

export default function Navbar({ locale }: { locale: string }) {
  const pathname = usePathname()
  const { itemCount, openCart } = useCart()
  const [currency, setCurrency] = useState('USD')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const currencyRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLinks = [
    { href: `/${locale}`, label: locale === 'fr' ? 'Accueil' : 'Home' },
    { href: `/${locale}/products`, label: locale === 'fr' ? 'Tous les produits' : 'All Products' },
    { href: `/${locale}/contact`, label: 'Contact' },
  ]

  const isActive = (href: string) => pathname === href || (href.includes('/products') && pathname.includes('/products'))

  return (
    <>
      <header className="ud-nav">
        <div className="ud-nav__inner">

          {/* ── Logo ── */}
          <Link href={`/${locale}`} className="ud-nav__logo">
            <Image
              src="https://flyhmbookyqckgjotihg.supabase.co/storage/v1/object/public/Logo/urban-deam-logo-long-pngc.png"
              alt="Urbandeam"
              width={140}
              height={36}
              style={{ objectFit: 'contain', height: '32px', width: 'auto' }}
              priority
            />
          </Link>

          {/* ── Nav links ── */}
          <nav className="ud-nav__links">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`ud-nav__link${isActive(href) ? ' ud-nav__link--active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right icons ── */}
          <div className="ud-nav__right">

            {/* Currency */}
            <div ref={currencyRef} style={{ position: 'relative' }}>
              <button
                className="ud-nav__currency"
                onClick={() => setCurrencyOpen(!currencyOpen)}
              >
                {currency}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {currencyOpen && (
                <div className="ud-dropdown">
                  {CURRENCIES.map(c => (
                    <button
                      key={c}
                      className={`ud-dropdown__item${c === currency ? ' ud-dropdown__item--active' : ''}`}
                      onClick={() => { setCurrency(c); setCurrencyOpen(false) }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <Link href={`/${locale}/products`} className="ud-nav__icon" aria-label="Rechercher">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </Link>

            {/* Account */}
            <div ref={accountRef} style={{ position: 'relative' }}>
              <button
                className="ud-nav__icon"
                aria-label="Mon compte"
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              {accountOpen && (
                <div className="ud-account-dropdown">
                  <p className="ud-account-dropdown__title">Account</p>
                  <Link href={`/${locale}/account`} className="ud-account-dropdown__btn ud-account-dropdown__btn--black">
                    {locale === 'fr' ? 'Se connecter' : 'Sign in'}
                  </Link>
                  <div className="ud-account-dropdown__grid">
                    <Link href={`/${locale}/account/orders`} className="ud-account-dropdown__small">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                      </svg>
                      {locale === 'fr' ? 'Commandes' : 'Orders'}
                    </Link>
                    <Link href={`/${locale}/account`} className="ud-account-dropdown__small">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              className="ud-nav__icon ud-nav__cart"
              aria-label="Panier"
              onClick={openCart}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className="ud-nav__cart-badge">{itemCount}</span>
              )}
            </button>

            {/* Mobile burger */}
            <button
              className="ud-nav__burger"
              onClick={() => setMobileOpen(!mobileOpen)}
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

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="ud-nav__mobile">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="ud-nav__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <style>{`
        .ud-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fff;
          border-bottom: 1px solid #E5E5E5;
        }
        .ud-nav__inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .ud-nav__logo { display: flex; align-items: center; flex-shrink: 0; text-decoration: none; }
        .ud-nav__links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .ud-nav__link {
          font-size: 14px;
          font-weight: 400;
          color: #0A0A0A;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: background 0.12s;
        }
        .ud-nav__link:hover { background: #F5F5F5; }
        .ud-nav__link--active { font-weight: 500; }

        .ud-nav__right { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .ud-nav__currency {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 500; color: #0A0A0A;
          background: transparent; border: none; cursor: pointer;
          padding: 6px 10px; border-radius: 6px;
          font-family: inherit; transition: background 0.12s;
        }
        .ud-nav__currency:hover { background: #F5F5F5; }
        .ud-nav__icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 6px;
          color: #0A0A0A; text-decoration: none;
          background: transparent; border: none; cursor: pointer;
          transition: background 0.12s; position: relative;
        }
        .ud-nav__icon:hover { background: #F5F5F5; }
        .ud-nav__cart { position: relative; }
        .ud-nav__cart-badge {
          position: absolute; top: 2px; right: 2px;
          background: #0A0A0A; color: white;
          border-radius: 50%; width: 16px; height: 16px;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none; border: 2px solid white;
        }
        .ud-nav__burger {
          display: none; align-items: center; justify-content: center;
          width: 36px; height: 36px; background: transparent;
          border: none; cursor: pointer; color: #0A0A0A; border-radius: 6px;
        }
        .ud-nav__burger:hover { background: #F5F5F5; }

        /* Dropdown currency */
        .ud-dropdown {
          position: absolute; top: calc(100% + 4px); right: 0;
          background: white; border: 1px solid #E5E5E5;
          border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          min-width: 90px; overflow: hidden; z-index: 200;
        }
        .ud-dropdown__item {
          display: block; width: 100%; text-align: left;
          padding: 9px 16px; font-size: 13px; font-weight: 400;
          color: #0A0A0A; background: transparent; border: none;
          cursor: pointer; font-family: inherit; transition: background 0.1s;
        }
        .ud-dropdown__item:hover { background: #F5F5F5; }
        .ud-dropdown__item--active { font-weight: 600; }

        /* Account dropdown */
        .ud-account-dropdown {
          position: absolute; top: calc(100% + 8px); right: -8px;
          background: white; border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          padding: 20px; width: 280px; z-index: 200;
        }
        .ud-account-dropdown__title {
          font-size: 18px; font-weight: 600; color: #0A0A0A;
          margin-bottom: 16px;
        }
        .ud-account-dropdown__btn {
          display: block; width: 100%; text-align: center;
          padding: 14px; border-radius: 10px; font-size: 15px;
          font-weight: 600; text-decoration: none; margin-bottom: 10px;
          transition: opacity 0.15s;
        }
        .ud-account-dropdown__btn--black {
          background: #0A0A0A; color: white;
        }
        .ud-account-dropdown__btn--black:hover { opacity: 0.85; }
        .ud-account-dropdown__grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .ud-account-dropdown__small {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 8px;
          padding: 16px 12px; border-radius: 10px;
          border: 1px solid #E5E5E5; font-size: 13px; font-weight: 500;
          color: #0A0A0A; text-decoration: none; transition: background 0.12s;
        }
        .ud-account-dropdown__small:hover { background: #F5F5F5; }

        /* Mobile */
        .ud-nav__mobile {
          background: white; border-top: 1px solid #E5E5E5;
          padding: 12px 24px 16px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .ud-nav__mobile-link {
          display: block; padding: 12px 8px;
          font-size: 15px; font-weight: 500; color: #0A0A0A;
          text-decoration: none; border-bottom: 1px solid #F0F0F0;
          transition: color 0.12s;
        }
        .ud-nav__mobile-link:last-child { border-bottom: none; }
        .ud-nav__mobile-link:hover { color: #555; }

        @media (max-width: 768px) {
          .ud-nav__links { display: none !important; }
          .ud-nav__burger { display: flex !important; }
          .ud-nav__inner { gap: 8px; padding: 0 16px; }
        }
      `}</style>
    </>
  )
}
