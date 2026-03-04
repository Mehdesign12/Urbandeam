'use client'

import { useState } from 'react'
import { useCart } from './CartContext'

type CartProduct = {
  id: string
  slug: string
  title: string
  price: number
  image_url?: string | null
}

type Props = {
  productId: string
  locale: string
  label: string
  product?: CartProduct
}

export default function BuyButton({ productId, locale, label, product }: Props) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleClick = () => {
    if (product) {
      addItem({ ...product, locale })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`ud-buy-btn${added ? ' ud-buy-btn--added' : ''}`}
    >
      {added ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {locale === 'fr' ? 'Ajouté !' : 'Added!'}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {label}
        </>
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
          transition: opacity 0.15s, background 0.15s;
          margin-bottom: 0;
        }
        .ud-buy-btn:hover { opacity: 0.85; }
        .ud-buy-btn--added { background: #10B981; }
      `}</style>
    </button>
  )
}
