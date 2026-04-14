'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type PublicReview = {
  id: string
  author_name: string
  is_verified: boolean
  rating: number
  title: string | null
  text: string | null
  photo_url: string | null
  review_date: string
}

type Props = {
  productId: string
  locale: 'fr' | 'en'
  contactEmail?: string
  productTitle?: string
}

function formatDate(iso: string, locale: 'fr' | 'en') {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return locale === 'fr' ? `${dd}/${mm}/${yyyy}` : `${mm}/${dd}/${yyyy}`
}

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }} aria-label={`${n} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < n ? '#0A0A0A' : '#D1D5DB'}>
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  )
}

function VerifiedBadge({ locale }: { locale: 'fr' | 'en' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6B7280' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#3B82F6" aria-hidden="true">
        <path d="M12 2 9 5H5v4l-3 3 3 3v4h4l3 3 3-3h4v-4l3-3-3-3V5h-4zm-1.59 14L6 11.59 7.41 10.17l3 3L16.59 7l1.41 1.41z" />
      </svg>
      {locale === 'fr' ? 'Acheteur vérifié' : 'Verified'}
    </span>
  )
}

export default function ReviewsMasonry({ productId, locale, contactEmail = 'contact@urbandeam.com', productTitle = '' }: Props) {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [loading, setLoading] = useState(true)
  const [minStars, setMinStars] = useState<number>(0)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews ?? []))
      .finally(() => setLoading(false))
  }, [productId])

  const filtered = minStars > 0 ? reviews.filter(r => r.rating >= minStars) : reviews
  const count = reviews.length

  const avg = count > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / count
    : 0

  const fr = locale === 'fr'
  const mailSubject = encodeURIComponent(fr ? `Avis sur ${productTitle}` : `Review for ${productTitle}`)

  if (loading) {
    return <div className="ud-masonry__loading">{fr ? 'Chargement des avis…' : 'Loading reviews…'}</div>
  }

  if (count === 0) {
    return null
  }

  return (
    <section className="ud-masonry">
      {/* Header */}
      <div className="ud-masonry__header">
        <div className="ud-masonry__header-left">
          <Stars n={Math.round(avg)} size={18} />
          <button
            type="button"
            onClick={() => setFilterOpen(v => !v)}
            className="ud-masonry__count-btn"
            aria-expanded={filterOpen}
          >
            {count} {fr ? (count > 1 ? 'avis' : 'avis') : (count > 1 ? 'Reviews' : 'Review')}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
        <div className="ud-masonry__header-right">
          <a
            href={`mailto:${contactEmail}?subject=${mailSubject}`}
            className="ud-masonry__write-btn"
          >
            {fr ? 'Laisser un avis' : 'Write a review'}
          </a>
          <button
            type="button"
            onClick={() => setFilterOpen(v => !v)}
            className="ud-masonry__filter-btn"
            aria-label={fr ? 'Filtrer' : 'Filter'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="6" y1="12" x2="18" y2="12"/>
              <line x1="9" y1="18" x2="15" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Filter dropdown */}
      {filterOpen && (
        <div className="ud-masonry__filter-panel">
          <span className="ud-masonry__filter-label">{fr ? 'Filtrer par note' : 'Filter by rating'}</span>
          <div className="ud-masonry__filter-chips">
            {[0, 5, 4, 3, 2, 1].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => { setMinStars(n); setFilterOpen(false) }}
                className={`ud-masonry__chip ${minStars === n ? 'is-active' : ''}`}
              >
                {n === 0 ? (fr ? 'Toutes' : 'All') : `${n}★+`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Masonry grid via CSS columns */}
      <div className="ud-masonry__grid">
        {filtered.map(r => (
          <article key={r.id} className="ud-masonry__item">
            {r.photo_url && (
              <div className="ud-masonry__photo">
                <Image
                  src={r.photo_url}
                  alt={`${r.author_name} — review`}
                  width={600}
                  height={800}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            )}
            {(r.title || r.text || r.author_name) && (
              <div className="ud-masonry__body">
                <div className="ud-masonry__author-row">
                  <span className="ud-masonry__author">{r.author_name}</span>
                  {r.is_verified && <VerifiedBadge locale={locale} />}
                </div>
                <div className="ud-masonry__date">{formatDate(r.review_date, locale)}</div>
                <div style={{ margin: '4px 0' }}><Stars n={r.rating} /></div>
                {r.title && <h3 className="ud-masonry__title">{r.title}</h3>}
                {r.text && <p className="ud-masonry__text">{r.text}</p>}
              </div>
            )}
          </article>
        ))}
      </div>

      {filtered.length === 0 && minStars > 0 && (
        <p className="ud-masonry__empty">
          {fr ? 'Aucun avis ne correspond à ce filtre.' : 'No reviews match this filter.'}
        </p>
      )}

      <style>{`
        .ud-masonry {
          padding-top: 40px;
          margin-top: 32px;
          border-top: 1px solid #F0F0F0;
        }

        .ud-masonry__loading {
          padding: 40px 0;
          text-align: center;
          color: #A3A3A3;
          font-size: 14px;
        }

        .ud-masonry__header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
          margin-bottom: 20px;
        }
        @media (min-width: 768px) {
          .ud-masonry__header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 28px;
          }
        }
        .ud-masonry__header-left,
        .ud-masonry__header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ud-masonry__header-right { justify-content: flex-end; }

        .ud-masonry__count-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 15px;
          font-weight: 600;
          color: #0A0A0A;
          cursor: pointer;
          font-family: inherit;
        }

        .ud-masonry__write-btn {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #FFFFFF;
          color: #0A0A0A;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: background 150ms ease;
        }
        .ud-masonry__write-btn:hover { background: #F9FAFB; }

        .ud-masonry__filter-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #FFFFFF;
          color: #0A0A0A;
          cursor: pointer;
          transition: background 150ms ease;
        }
        .ud-masonry__filter-btn:hover { background: #F9FAFB; }

        .ud-masonry__filter-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 14px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .ud-masonry__filter-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }
        .ud-masonry__filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ud-masonry__chip {
          padding: 5px 10px;
          border-radius: 99px;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          color: #374151;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
        }
        .ud-masonry__chip.is-active {
          background: #0A0A0A;
          color: #FFFFFF;
          border-color: #0A0A0A;
        }

        /* Mobile-first : 2 colonnes */
        .ud-masonry__grid {
          column-count: 2;
          column-gap: 10px;
        }
        @media (min-width: 640px) {
          .ud-masonry__grid { column-count: 3; column-gap: 14px; }
        }
        @media (min-width: 1024px) {
          .ud-masonry__grid { column-count: 4; column-gap: 16px; }
        }

        .ud-masonry__item {
          break-inside: avoid;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 640px) {
          .ud-masonry__item { margin-bottom: 14px; }
        }
        @media (min-width: 1024px) {
          .ud-masonry__item { margin-bottom: 16px; }
        }

        .ud-masonry__photo {
          display: block;
          background: #F2F2F2;
        }

        .ud-masonry__body { padding: 12px 14px; }

        .ud-masonry__author-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #0A0A0A;
        }
        .ud-masonry__author { font-weight: 600; }
        .ud-masonry__date {
          font-size: 11px;
          color: #9CA3AF;
          margin-top: 2px;
        }
        .ud-masonry__title {
          font-size: 13px;
          font-weight: 600;
          color: #0A0A0A;
          margin-top: 4px;
          line-height: 1.4;
        }
        .ud-masonry__text {
          font-size: 12.5px;
          color: #374151;
          line-height: 1.55;
          margin-top: 4px;
          white-space: pre-line;
        }
        @media (min-width: 768px) {
          .ud-masonry__title { font-size: 14px; }
          .ud-masonry__text  { font-size: 13px; }
        }

        .ud-masonry__empty {
          padding: 32px 0;
          text-align: center;
          color: #9CA3AF;
          font-size: 13px;
        }
      `}</style>
    </section>
  )
}
