'use client'

import { useState } from 'react'

type Props = {
  productId: string
  locale: string
  label: string
}

export default function BuyButton({ productId, locale, label }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, locale }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Erreur inconnue')
        setLoading(false)
      }
    } catch {
      setError('Erreur réseau, veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="ud-buy-btn"
      >
        {loading ? (
          <>
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: 'ud-spin 0.8s linear infinite' }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {locale === 'fr' ? 'Redirection…' : 'Redirecting…'}
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {label}
          </>
        )}
      </button>

      {error && (
        <p style={{
          marginTop: '10px', fontSize: '13px', color: '#EF4444',
          textAlign: 'center'
        }}>
          {error}
        </p>
      )}

      <style>{`
        .ud-buy-btn {
          width: 100%;
          padding: 15px 24px;
          background: #0A0A0A;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s;
        }
        .ud-buy-btn:hover:not(:disabled) { opacity: 0.85; }
        .ud-buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes ud-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
