'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import BuyButton from './BuyButton'

type Props = {
  productId: string
  slug: string
  title: string
  price: string
  priceRaw: number
  priceOriginal?: string | null   // prix barré optionnel
  isOnSale?: boolean
  imageUrl?: string | null
  locale: string
  label: string
}

export default function StickyAddToCart({
  productId, title, price, priceOriginal, isOnSale, imageUrl, locale, label
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className={`ud-sticky${visible ? ' ud-sticky--visible' : ''}`}>
        <div className="ud-sticky__inner">

          {/* Gauche : image + infos */}
          <div className="ud-sticky__left">
            <div className="ud-sticky__img">
              {imageUrl ? (
                <Image src={imageUrl} alt={title} fill sizes="48px" style={{ objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '20px' }}>📦</span>
              )}
            </div>
            <div className="ud-sticky__meta">
              <p className="ud-sticky__title">{title.length > 36 ? title.slice(0, 36) + '…' : title}</p>
              {/* Étoiles + note */}
              <div className="ud-sticky__stars">
                <span className="ud-sticky__star-row">★★★★★</span>
                <span className="ud-sticky__rating">4.8</span>
              </div>
              {/* Prix (+ prix barré si promo) */}
              <div className="ud-sticky__price-row">
                <span className="ud-sticky__price">{price}</span>
                {isOnSale && priceOriginal && (
                  <span className="ud-sticky__price-orig">{priceOriginal}</span>
                )}
                {isOnSale && (
                  <span className="ud-sticky__badge-sale">PROMO</span>
                )}
              </div>
            </div>
          </div>

          {/* Bouton achat */}
          <div className="ud-sticky__cta">
            <BuyButton productId={productId} locale={locale} label={label} />
          </div>
        </div>
      </div>

      <style>{`
        .ud-sticky {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
          background: white;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.10);
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 1px solid #E5E5E5;
        }
        .ud-sticky--visible { transform: translateY(0); }
        .ud-sticky__inner {
          max-width: 1280px; margin: 0 auto;
          padding: 10px 16px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
        }
        @media (min-width: 640px) {
          .ud-sticky__inner { padding: 12px 24px; gap: 16px; }
        }

        /* Gauche */
        .ud-sticky__left {
          display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;
        }
        .ud-sticky__img {
          width: 44px; height: 44px; border-radius: 8px;
          background: #EFEFEF; flex-shrink: 0;
          overflow: hidden; position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .ud-sticky__meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .ud-sticky__title {
          font-size: 13px; font-weight: 600; color: #0A0A0A;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        @media (min-width: 640px) { .ud-sticky__title { font-size: 14px; } }

        /* Étoiles */
        .ud-sticky__stars { display: flex; align-items: center; gap: 4px; }
        .ud-sticky__star-row { color: #F59E0B; font-size: 11px; letter-spacing: 1px; }
        .ud-sticky__rating { font-size: 11px; font-weight: 700; color: #374151; }

        /* Prix */
        .ud-sticky__price-row { display: flex; align-items: center; gap: 6px; }
        .ud-sticky__price { font-size: 13px; font-weight: 700; color: #0A0A0A; }
        .ud-sticky__price-orig { font-size: 12px; color: #9CA3AF; text-decoration: line-through; }
        .ud-sticky__badge-sale {
          font-size: 10px; font-weight: 700;
          background: #FEF3C7; color: #92400E;
          padding: 1px 6px; border-radius: 4px;
        }

        /* CTA */
        .ud-sticky__cta { flex-shrink: 0; min-width: 150px; }

        /* Mobile < 480px : masquer image + stars, garder titre + prix + bouton */
        @media (max-width: 480px) {
          .ud-sticky__img { display: none; }
          .ud-sticky__stars { display: none; }
          .ud-sticky__inner { padding: 10px 12px; }
          .ud-sticky__cta { min-width: 120px; }
        }
      `}</style>
    </>
  )
}
