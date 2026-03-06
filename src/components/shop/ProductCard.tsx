'use client'

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
    >
      {/* ── Image zone ── */}
      <div className="ud-card__img-wrap">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            style={{ objectFit: 'cover' }}
            priority={priority}
          />
        ) : (
          <div className="ud-card__placeholder">
            {CATEGORY_EMOJI[product.category] ?? '📦'}
          </div>
        )}

        {/* Badge promo — pointer-events none pour ne pas bloquer les taps */}
        {price.isOnSale && (
          <span className="ud-card__badge" aria-hidden="true">
            -{price.discountPercent}%
          </span>
        )}

        {/* Bouton add to cart
            Desktop : visible au hover via CSS uniquement
            Mobile  : toujours visible, zone 36×36px isolée en bas à droite */}
        <button
          className="ud-card__cart-btn"
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
        .ud-card--large .ud-card__img-wrap {
          padding-bottom: 110%;
          border-radius: 14px;
          margin-bottom: 14px;
        }
        .ud-card--large .ud-card__title { font-size: 15px; }
        .ud-card--large .ud-card__price { font-size: 15px; }

        /* Zoom image — CSS uniquement, sans JS ni state */
        @media (hover: hover) {
          .ud-card__img-wrap img {
            transition: transform 400ms ease;
          }
          .ud-card:hover .ud-card__img-wrap img {
            transform: scale(1.04);
          }
        }

        .ud-card__placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 56px;
        }

        /* Badge promo — ne capte jamais les taps */
        .ud-card__badge {
          position: absolute; top: 10px; left: 10px;
          background: #0A0A0A; color: white;
          font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 4px;
          letter-spacing: 0.05em; z-index: 2;
          pointer-events: none;
        }

        /* Bouton panier */
        .ud-card__cart-btn {
          position: absolute; bottom: 10px; right: 10px;
          width: 36px; height: 36px; border-radius: 50%;
          background: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 1px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          color: #0A0A0A; z-index: 2;
          transition: opacity 0.15s, transform 0.15s, background 0.1s;
        }
        /* Desktop : caché, apparaît au hover de la card via CSS */
        @media (hover: hover) {
          .ud-card__cart-btn {
            opacity: 0; transform: scale(0.8);
          }
          .ud-card:hover .ud-card__cart-btn {
            opacity: 1; transform: scale(1);
          }
          .ud-card__cart-btn:hover { background: #0A0A0A; color: white; }
        }
        /* Mobile (pas de hover) : toujours visible */
        @media (hover: none) {
          .ud-card__cart-btn {
            opacity: 1; transform: scale(1);
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
