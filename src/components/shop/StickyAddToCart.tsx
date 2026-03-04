'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from './CartContext'

type Props = {
  productId: string
  slug: string
  title: string
  price: string
  priceRaw: number
  imageUrl?: string | null
  locale: string
  label: string
}

export default function StickyAddToCart({ productId, slug, title, price, priceRaw, imageUrl, locale, label }: Props) {
  const [visible, setVisible] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAdd = () => {
    addItem({ id: productId, slug, title, price: priceRaw, image_url: imageUrl, locale })
  }

  return (
    <>
      <div className={`ud-sticky${visible ? ' ud-sticky--visible' : ''}`}>
        <div className="ud-sticky__inner">
          <div className="ud-sticky__left">
            <div className="ud-sticky__img">
              {imageUrl ? (
                <Image src={imageUrl} alt={title} fill sizes="48px" style={{ objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '20px' }}>📦</span>
              )}
            </div>
            <div>
              <p className="ud-sticky__title">{title.length > 40 ? title.slice(0, 40) + '…' : title}</p>
              <p className="ud-sticky__price">{price}</p>
            </div>
          </div>
          <button className="ud-sticky__btn" onClick={handleAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {label}
          </button>
        </div>
      </div>

      <style>{`
        .ud-sticky {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
          background: white;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 1px solid #E5E5E5;
        }
        .ud-sticky--visible { transform: translateY(0); }
        .ud-sticky__inner {
          max-width: 1280px; margin: 0 auto;
          padding: 12px 24px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        .ud-sticky__left {
          display: flex; align-items: center; gap: 12px; min-width: 0;
        }
        .ud-sticky__img {
          width: 48px; height: 48px; border-radius: 8px;
          background: #EFEFEF; flex-shrink: 0;
          overflow: hidden; position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .ud-sticky__title {
          font-size: 14px; font-weight: 500; color: #0A0A0A;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ud-sticky__price { font-size: 13px; color: #6B7280; margin-top: 2px; }
        .ud-sticky__btn {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 24px; background: #0A0A0A; color: white;
          border: none; border-radius: 10px; font-size: 14px;
          font-weight: 600; cursor: pointer; white-space: nowrap;
          font-family: inherit; transition: opacity 0.15s; flex-shrink: 0;
        }
        .ud-sticky__btn:hover { opacity: 0.85; }

        @media (max-width: 640px) {
          .ud-sticky__inner { padding: 12px 16px; }
          .ud-sticky__title { display: none; }
        }
      `}</style>
    </>
  )
}
