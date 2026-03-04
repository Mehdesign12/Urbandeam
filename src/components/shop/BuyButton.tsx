'use client'

import { useState } from 'react'

type Props = {
  productId: string
  locale: string
  label: string
}

export default function BuyButton({ productId, locale, label }: Props) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    try {
      // Phase 3 : appel API Stripe checkout
      // Pour l'instant, placeholder
      alert(locale === 'fr'
        ? 'Paiement Stripe disponible en Phase 3 !'
        : 'Stripe payment coming in Phase 3!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      style={{
        width: '100%',
        padding: '15px 24px',
        background: loading ? 'var(--color-secondary)' : 'var(--color-black)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: loading ? 'wait' : 'pointer',
        letterSpacing: '-0.01em',
        transition: 'opacity 150ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
    >
      {loading ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {locale === 'fr' ? 'Chargement...' : 'Loading...'}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          {label}
        </>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
