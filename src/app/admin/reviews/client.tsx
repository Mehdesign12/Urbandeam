'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductReview, I18nField } from '@/types'

type ReviewWithProduct = ProductReview & {
  product: { id: string; slug: string; title: I18nField } | null
}

export default function AdminReviewsClient() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reviews')
    const data = await res.json()
    setReviews(data.reviews ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleTogglePublish = async (review: ReviewWithProduct) => {
    setTogglingId(review.id)
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !review.is_published }),
    })
    await fetchReviews()
    setTogglingId(null)
  }

  const handleDelete = async (id: string, author: string) => {
    if (!confirm(`Supprimer l'avis de "${author}" ? Cette action est irréversible.`)) return
    setDeletingId(id)
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    await fetchReviews()
    setDeletingId(null)
  }

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase()
    const productTitle = r.product?.title?.fr ?? ''
    return (
      r.author_name.toLowerCase().includes(q) ||
      (r.title ?? '').toLowerCase().includes(q) ||
      (r.text ?? '').toLowerCase().includes(q) ||
      productTitle.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '2px' }}>Avis clients</h1>
          <p style={{ fontSize: '13px', color: '#A3A3A3' }}>{reviews.length} avis au total</p>
        </div>
        <Link href="/admin/reviews/new" className="btn-primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouvel avis
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
          placeholder="Rechercher un avis…"
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
              {search ? 'Aucun avis ne correspond à la recherche' : 'Aucun avis créé'}
            </p>
            {!search && (
              <Link href="/admin/reviews/new" className="btn-primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
                Créer le premier avis
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E5E5' }}>
                {['Auteur', 'Produit', 'Note', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((review, i) => {
                const isDeleting = deletingId === review.id
                const isToggling = togglingId === review.id
                const productTitle = review.product?.title?.fr ?? '—'
                return (
                  <tr key={review.id} style={{ borderTop: i > 0 ? '1px solid #F5F5F5' : 'none', opacity: isDeleting ? 0.4 : 1 }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {review.photo_url ? (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F2F2F2', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                            <Image src={review.photo_url} alt={review.author_name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                          </div>
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: '#0A0A0A', flexShrink: 0 }}>
                            {review.author_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {review.author_name}
                            {review.is_verified && (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="#3B82F6">
                                <path d="M12 2 9 5H5v4l-3 3 3 3v4h4l3 3 3-3h4v-4l3-3-3-3V5h-4zm-1.59 14L6 11.59 7.41 10.17l3 3L16.59 7l1.41 1.41z"/>
                              </svg>
                            )}
                          </p>
                          {review.title && <p style={{ fontSize: '12px', color: '#A3A3A3' }}>{review.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#374151' }}>
                      {productTitle}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                      {'★'.repeat(review.rating)}<span style={{ color: '#D1D5DB' }}>{'★'.repeat(5 - review.rating)}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {review.review_date}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        onClick={() => handleTogglePublish(review)}
                        disabled={isToggling}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: review.is_published ? '#DCFCE7' : '#F3F4F6', color: review.is_published ? '#166534' : '#6B7280', opacity: isToggling ? 0.5 : 1 }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: review.is_published ? '#22C55E' : '#D1D5DB' }} />
                        {isToggling ? '…' : review.is_published ? 'Publié' : 'Masqué'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/admin/reviews/${review.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#F2F2F2', color: '#0A0A0A', textDecoration: 'none' }}>
                          Éditer
                        </Link>
                        <button onClick={() => handleDelete(review.id, review.author_name)} disabled={isDeleting} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#FEF2F2', color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: isDeleting ? 0.5 : 1 }}>
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
