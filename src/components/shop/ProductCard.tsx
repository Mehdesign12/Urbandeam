'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { getLocalizedField, getPriceDisplay } from '@/lib/utils'
import { useCart } from './CartContext'

type Props = {
  product: Product
  locale: string
  priority?: boolean
  cardSize?: 'default' | 'large'
}

const CATEGORY_EMOJI: Record<string, string> = {
  excel: '📊', notion: '📋', pdf: '📄',
}

export default function ProductCard({ product, locale, priority = false, cardSize = 'default' }: Props) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCart()

  const title = getLocalizedField(product.title, locale as 'fr' | 'en', product.slug)
  const price = getPriceDisplay(product.price, product.price_original)

  const handleAddToCart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      slug: product.slug,
      title,
      price: product.price,
      image_url: product.image_url,
      locale,
    })
  }

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className={`ud-card${cardSize === 'large' ? ' ud-card--large' : ''}`}
      // hover uniquement sur appareil pointeur (desktop) — évite le 300ms delay iOS
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image zone ── */}
      <div className="ud-card__img-wrap">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 400ms ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
            priority={priority}
          />
        ) : (
          <div className="ud-card__placeholder">
            {CATEGORY_EMOJI[product.category] ?? '📦'}
          </div>
        )}

        {/* Flèches navigation — desktop uniquement */}
        {hovered && (
          <>
            <button
              className="ud-card__arrow ud-card__arrow--left"
              onClick={e => e.preventDefault()}
              tabIndex={-1}
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              className="ud-card__arrow ud-card__arrow--right"
              onClick={e => e.preventDefault()}
              tabIndex={-1}
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </>
        )}

        {/* Badge promo */}
        {price.isOnSale && (
          <span className="ud-card__badge">
            -{price.discountPercent}%
          </span>
        )}

        {/* Bouton add to cart
            - Sur desktop (hover) : opacity animée
            - Sur mobile : toujours visible MAIS pointer-events uniquement sur
              le bouton lui-même via onTouchEnd pour éviter d'intercepter le tap du Link */}
        <button
          className={`ud-card__cart-btn${hovered ? ' ud-card__cart-btn--visible' : ''}`}
          onClick={handleAddToCart}
          onTouchEnd={handleAddToCart}
          aria-label="Ajouter au panier"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* ── Infos sous l'image ── */}
      <div className="ud-card__info">
        <h3 className="ud-card__title">{title}</h3>
        <div className="ud-card__prices">
          <span className="ud-card__price">{price.full}</span>
          {price.isOnSale && price.originalFull && (
            <span className="ud-card__price-original">{price.originalFull}</span>
          )}
        </div>
      </div>

      <style>{`
        .ud-card {
          display: block; text-decoration: none; color: inherit;
          /* Réponse tactile immédiate sur iOS/Android */
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .ud-card__img-wrap {
          position: relative;
          width: 100%; padding-bottom: 100%;
          background: #EFEFEF;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        /* Large variant */
        .ud-card--large .ud-card__img-wrap {
          padding-bottom: 110%;
          border-radius: 14px;
          margin-bottom: 14px;
        }
        .ud-card--large .ud-card__title { font-size: 15px; }
        .ud-card--large .ud-card__price { font-size: 15px; }

        .ud-card__placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 56px;
        }

        /* Flèches — desktop uniquement */
        .ud-card__arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border-radius: 50%;
          background: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15); z-index: 2;
          color: #0A0A0A; transition: background 0.1s;
        }
        .ud-card__arrow:hover { background: #F5F5F5; }
        .ud-card__arrow--left  { left: 8px; }
        .ud-card__arrow--right { right: 8px; }

        /* Badge promo */
        .ud-card__badge {
          position: absolute; top: 10px; left: 10px;
          background: #0A0A0A; color: white;
          font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 4px;
          letter-spacing: 0.05em; z-index: 2;
          /* Sur mobile le badge ne capte pas les taps */
          pointer-events: none;
        }

        /* Bouton panier — desktop : apparaît au hover */
        .ud-card__cart-btn {
          position: absolute; bottom: 10px; right: 10px;
          width: 36px; height: 36px; border-radius: 50%;
          background: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 1px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          color: #0A0A0A; z-index: 2;
          opacity: 0; transform: scale(0.8);
          transition: opacity 0.15s, transform 0.15s, background 0.1s;
        }
        .ud-card__cart-btn--visible {
          opacity: 1; transform: scale(1);
        }
        .ud-card__cart-btn:hover { background: #0A0A0A; color: white; }

        /* Mobile : bouton panier visible mais ne bloque PAS le tap vers le Link
           Il est positionné en bas à droite — une petite zone dédié au panier */
        @media (hover: none) {
          .ud-card__cart-btn {
            opacity: 1 !important;
            transform: scale(1) !important;
          }
        }

        .ud-card__info { padding: 0 2px; }
        .ud-card__title {
          font-size: 14px; font-weight: 400; color: #0A0A0A;
          line-height: 1.4; margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ud-card__prices { display: flex; align-items: center; gap: 6px; }
        .ud-card__price { font-size: 14px; color: #0A0A0A; font-weight: 400; }
        .ud-card__price-original {
          font-size: 13px; color: #9CA3AF; text-decoration: line-through;
        }
      `}</style>
    </Link>
  )
}
