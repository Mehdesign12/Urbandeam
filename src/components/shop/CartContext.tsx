'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CartBuyModal } from './BuyButton'

export type CartItem = {
  id: string
  slug: string
  title: string
  price: number        // centimes
  image_url?: string | null
  locale: string
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  openCart: () => void
  closeCart: () => void
  isOpen: boolean
}

const CartContext = createContext<CartContextType>({
  items: [], itemCount: 0,
  addItem: () => {}, removeItem: () => {},
  openCart: () => {}, closeCart: () => {}, isOpen: false,
})

export function useCart() { return useContext(CartContext) }

export function CartProvider({ children, locale }: { children: ReactNode; locale: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev
      return [...prev, item]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const total = items.reduce((s, i) => s + i.price, 0)
  const fmt = (cents: number) => `€${(cents / 100).toFixed(2)}`

  return (
    <CartContext.Provider value={{
      items,
      itemCount: items.length,
      addItem,
      removeItem,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      isOpen,
    }}>
      {children}

      {/* Modal de paiement déclenché par le cart "Check out" */}
      <CartBuyModal locale={locale} />

      {/* ── Cart Sidebar overlay ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Cart Sidebar ── */}
      <div className={`ud-cart${isOpen ? ' ud-cart--open' : ''}`}>
        {/* Header */}
        <div className="ud-cart__header">
          <span className="ud-cart__title">
            Cart {items.length > 0 && <span className="ud-cart__count">{items.length}</span>}
          </span>
          <button className="ud-cart__close" onClick={() => setIsOpen(false)} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="ud-cart__body">
          {items.length === 0 ? (
            <div className="ud-cart__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '12px' }}>
                {locale === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}
              </p>
              <Link
                href={`/${locale}/products`}
                className="ud-cart__continue"
                onClick={() => setIsOpen(false)}
              >
                {locale === 'fr' ? 'Continuer mes achats' : 'Continue shopping'}
              </Link>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="ud-cart__items">
                {items.map(item => (
                  <div key={item.id} className="ud-cart__item">
                    <div className="ud-cart__item-img">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="64px" />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>📦</div>
                      )}
                    </div>
                    <div className="ud-cart__item-info">
                      <p className="ud-cart__item-name">{item.title}</p>
                      <p className="ud-cart__item-price">{fmt(item.price)}</p>
                    </div>
                    <button
                      className="ud-cart__item-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Supprimer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="ud-cart__footer">
                <div className="ud-cart__discount">
                  <span style={{ fontSize: '14px', color: '#0A0A0A' }}>Discount</span>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9CA3AF', lineHeight: 1 }}>+</button>
                </div>
                <div className="ud-cart__total-row">
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Estimated total</span>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>{fmt(total)} EUR</span>
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
                  {locale === 'fr' ? 'Taxes calculées lors du paiement.' : 'Taxes and shipping calculated at checkout.'}
                </p>
                <button
                  className="ud-cart__checkout"
                  onClick={() => {
                    if (items.length === 0) return
                    setIsOpen(false)
                    // Envoyer TOUS les items dans la queue
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('ud:open-checkout', {
                        detail: {
                          items: items.map(i => ({
                            id: i.id,
                            title: i.title,
                            price: i.price,
                            image_url: i.image_url ?? null,
                          })),
                          locale,
                        }
                      }))
                    }, 320)
                  }}
                >
                  {locale === 'fr' ? 'Commander' : 'Check out'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .ud-cart {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 400px; max-width: 100vw;
          background: white; z-index: 600;
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -4px 0 40px rgba(0,0,0,0.12);
        }
        .ud-cart--open { transform: translateX(0); }

        .ud-cart__header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #F0F0F0;
        }
        .ud-cart__title { font-size: 18px; font-weight: 600; color: #0A0A0A; display: flex; align-items: center; gap: 8px; }
        .ud-cart__count {
          background: #0A0A0A; color: white;
          border-radius: 50%; width: 22px; height: 22px;
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .ud-cart__close {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: #F5F5F5; border: none; cursor: pointer;
          color: #0A0A0A; transition: background 0.12s;
        }
        .ud-cart__close:hover { background: #E5E5E5; }

        .ud-cart__body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

        .ud-cart__empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px; text-align: center;
        }
        .ud-cart__continue {
          display: inline-block; margin-top: 20px;
          padding: 10px 24px; background: #0A0A0A; color: white;
          border-radius: 8px; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: opacity 0.15s;
        }
        .ud-cart__continue:hover { opacity: 0.85; }

        .ud-cart__items { flex: 1; padding: 16px 24px; display: flex; flex-direction: column; gap: 16px; }
        .ud-cart__item { display: flex; align-items: center; gap: 12px; }
        .ud-cart__item-img {
          width: 64px; height: 64px; border-radius: 8px;
          background: #F5F5F5; flex-shrink: 0; overflow: hidden;
          position: relative;
        }
        .ud-cart__item-info { flex: 1; min-width: 0; }
        .ud-cart__item-name {
          font-size: 13px; font-weight: 500; color: #0A0A0A;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .ud-cart__item-price { font-size: 13px; color: #6B7280; }
        .ud-cart__item-remove {
          flex-shrink: 0; background: none; border: none; cursor: pointer;
          color: #9CA3AF; padding: 4px; transition: color 0.12s;
        }
        .ud-cart__item-remove:hover { color: #0A0A0A; }

        .ud-cart__footer {
          padding: 16px 24px 24px;
          border-top: 1px solid #F0F0F0;
        }
        .ud-cart__discount {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid #F0F0F0; margin-bottom: 14px;
        }
        .ud-cart__total-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 6px;
        }
        .ud-cart__checkout {
          display: block; width: 100%;
          background: #0A0A0A; color: white;
          border-radius: 10px; padding: 15px;
          font-size: 15px; font-weight: 600; text-align: center;
          text-decoration: none; transition: opacity 0.15s;
        }
        .ud-cart__checkout:hover { opacity: 0.85; }

        @media (max-width: 480px) {
          .ud-cart { width: 100vw; }
        }
      `}</style>
    </CartContext.Provider>
  )
}
