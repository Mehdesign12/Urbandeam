'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { getLocalizedField, getPriceDisplay, CATEGORY_LABELS } from '@/lib/utils'

type Props = {
  product: Product
  locale: string
  priority?: boolean
}

// Emoji placeholder selon la catégorie
const CATEGORY_EMOJI: Record<string, string> = {
  excel: '📊',
  notion: '📋',
  pdf: '📄',
}

export default function ProductCard({ product, locale, priority = false }: Props) {
  const [hovered, setHovered] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const title = getLocalizedField(product.title, locale as 'fr' | 'en', product.slug)
  const price = getPriceDisplay(product.price, product.price_original)
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor: 'pointer',
        border: '1px solid var(--color-border)',
      }}>

        {/* ── Image zone 1:1 ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%', // ratio 1:1
          background: 'var(--color-card-bg)',
          overflow: 'hidden',
        }}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              style={{ objectFit: 'cover', transition: 'transform 300ms ease', transform: hovered ? 'scale(1.03)' : 'scale(1)' }}
              priority={priority}
            />
          ) : (
            /* Placeholder emoji centré */
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '52px',
            }}>
              {CATEGORY_EMOJI[product.category] ?? '📦'}
            </div>
          )}

          {/* ── Badges ── */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
          }}>
            {price.isOnSale && (
              <span className="badge badge-sale">
                {locale === 'fr' ? 'PROMO' : 'SALE'}
              </span>
            )}
            <span className={`badge badge-${product.category}`}>
              {categoryLabel}
            </span>
          </div>

          {/* ── Add to cart btn (cercle bas-droit) ── */}
          <button
            onClick={handleAddToCart}
            aria-label="Ajouter au panier"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: addedToCart ? 'var(--color-success)' : 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 150ms ease, background 200ms ease',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
              zIndex: 1,
            }}
          >
            {addedToCart ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            )}
          </button>
        </div>

        {/* ── Info produit ── */}
        <div style={{ padding: '12px 14px 14px' }}>
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-black)',
            lineHeight: 1.4,
            marginBottom: '6px',
            // Tronquer à 2 lignes
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}>
            {title}
          </h3>

          {/* Prix */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-black)', fontWeight: 500 }}>
              {price.full}
            </span>
            {price.isOnSale && price.originalFull && (
              <span style={{
                fontSize: '12px',
                color: 'var(--color-muted)',
                textDecoration: 'line-through',
              }}>
                {price.originalFull}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
