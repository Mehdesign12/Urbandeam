import ProductCard from './ProductCard'
import type { Product } from '@/types'

type Props = {
  products: Product[]
  locale: string
  columns?: 2 | 3 | 4 | 5
  priorityCount?: number
  cardSize?: 'default' | 'large'
}

export default function ProductGrid({
  products,
  locale,
  columns = 4,
  priorityCount = 2,
  cardSize = 'default',
}: Props) {
  if (!products.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 0',
        color: 'var(--color-muted)',
        fontSize: '14px',
      }}>
        {locale === 'fr' ? 'Aucun produit trouvé.' : 'No products found.'}
      </div>
    )
  }

  const gap = cardSize === 'large' ? '28px' : '20px'

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
        className={`product-grid product-grid-${columns}${cardSize === 'large' ? ' product-grid--large' : ''}`}
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            priority={i < priorityCount}
            cardSize={cardSize}
          />
        ))}
      </div>

      <style>{`
        /* ── Responsive breakpoints ── */
        @media (max-width: 1200px) {
          .product-grid-5 { grid-template-columns: repeat(4, 1fr) !important; }
          .product-grid-4 { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .product-grid-5,
          .product-grid-4 { grid-template-columns: repeat(3, 1fr) !important; }
          .product-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .product-grid-5,
          .product-grid-4,
          .product-grid-3 { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
          .product-grid-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .product-grid--large { gap: 12px !important; }
        }
      `}</style>
    </>
  )
}
