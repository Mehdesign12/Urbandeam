import ProductCard from './ProductCard'
import type { Product } from '@/types'

type Props = {
  products: Product[]
  locale: string
  columns?: 2 | 3 | 4 | 5
  priorityCount?: number  // nb de premières cards en priority (LCP)
}

export default function ProductGrid({ products, locale, columns = 4, priorityCount = 2 }: Props) {
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

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '20px',
      }} className={`product-grid product-grid-${columns}`}>
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            priority={i < priorityCount}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .product-grid-5 { grid-template-columns: repeat(4, 1fr) !important; }
          .product-grid-4 { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .product-grid-5,
          .product-grid-4,
          .product-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .product-grid-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .product-grid-5,
          .product-grid-4,
          .product-grid-3,
          .product-grid-2 { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </>
  )
}
