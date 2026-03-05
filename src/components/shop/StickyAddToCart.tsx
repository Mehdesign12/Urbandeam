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
  imageUrl?: string | null
  locale: string
  label: string
}

export default function StickyAddToCart({ productId, slug, title, price, imageUrl, locale, label }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          {/* Réutilise BuyButton qui gère la modal complète */}
          <div style={{ flexShrink: 0, minWidth: 180 }}>
            <BuyButton
              productId={productId}
              locale={locale}
              label={label}
            />
          </div>
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
          display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;
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

        @media (max-width: 640px) {
          .ud-sticky__inner { padding: 12px 16px; }
          .ud-sticky__left { display: none; }
        }
      `}</style>
    </>
  )
}
