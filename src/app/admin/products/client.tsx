'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'

const CATEGORY_LABELS: Record<string, string> = { excel: 'Excel', pdf: 'PDF', notion: 'Notion' }

export default function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleTogglePublish = async (product: Product) => {
    setTogglingId(product.id)
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !product.is_published }),
    })
    await fetchProducts()
    setTogglingId(null)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) return
    setDeletingId(id)
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    await fetchProducts()
    setDeletingId(null)
  }

  const filtered = products.filter(p => {
    const t = (p.title as Record<string, string>)?.fr ?? ''
    return t.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
  })

  const fmt = (cents: number) => `€${(cents / 100).toFixed(2)}`

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '2px' }}>Produits</h1>
          <p style={{ fontSize: '13px', color: '#A3A3A3' }}>{products.length} produit{products.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau produit
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '360px' }}>
        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="input"
          style={{ paddingLeft: '36px' }}
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#A3A3A3' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: '#A3A3A3', marginBottom: '16px' }}>
              {search ? 'Aucun produit ne correspond à la recherche' : 'Aucun produit créé'}
            </p>
            {!search && (
              <Link href="/admin/products/new" className="btn-primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
                Créer le premier produit
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E5E5' }}>
                {['Produit', 'Catégorie', 'Prix', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const title = (product.title as Record<string, string>)?.fr ?? product.slug
                const isDeleting = deletingId === product.id
                const isToggling = togglingId === product.id
                return (
                  <tr key={product.id} style={{ borderTop: i > 0 ? '1px solid #F5F5F5' : 'none', opacity: isDeleting ? 0.4 : 1 }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#F2F2F2', flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {product.image_url ? (
                            <Image src={product.image_url} alt={title} fill style={{ objectFit: 'cover' }} sizes="44px" />
                          ) : (
                            <span style={{ fontSize: '20px' }}>📦</span>
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '2px' }}>{title}</p>
                          <p style={{ fontSize: '12px', color: '#A3A3A3' }}>{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: '#F3F4F6', color: '#374151' }}>
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A' }}>{fmt(product.price)}</span>
                      {product.price_original && (
                        <span style={{ fontSize: '12px', color: '#A3A3A3', textDecoration: 'line-through', marginLeft: '6px' }}>{fmt(product.price_original)}</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        onClick={() => handleTogglePublish(product)}
                        disabled={isToggling}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: product.is_published ? '#DCFCE7' : '#F3F4F6', color: product.is_published ? '#166534' : '#6B7280', opacity: isToggling ? 0.5 : 1, transition: 'opacity 0.15s' }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: product.is_published ? '#22C55E' : '#D1D5DB' }} />
                        {isToggling ? '…' : product.is_published ? 'Publié' : 'Masqué'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/admin/products/${product.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#F2F2F2', color: '#0A0A0A', textDecoration: 'none' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Éditer
                        </Link>
                        <button onClick={() => handleDelete(product.id, title)} disabled={isDeleting} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#FEF2F2', color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: isDeleting ? 0.5 : 1 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                          {isDeleting ? '…' : 'Suppr.'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
