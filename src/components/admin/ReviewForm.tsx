'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ProductReview, Product } from '@/types'

type Mode = 'create' | 'edit'

type Props = {
  mode: Mode
  initial?: ProductReview
}

export default function ReviewForm({ mode, initial }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState(initial?.product_id ?? '')
  const [authorName, setAuthorName] = useState(initial?.author_name ?? '')
  const [isVerified, setIsVerified] = useState(initial?.is_verified ?? true)
  const [rating, setRating] = useState<number>(initial?.rating ?? 5)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [text, setText] = useState(initial?.text ?? '')
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? '')
  const [reviewDate, setReviewDate] = useState(initial?.review_date ?? new Date().toISOString().slice(0, 10))
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true)
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/products').then(r => r.json()).then(d => setProducts(d.products ?? []))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErr('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'image')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.error) { setErr(data.error); return }
    setPhotoUrl(data.url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setSaving(true)

    const body = {
      product_id: productId,
      author_name: authorName.trim(),
      is_verified: isVerified,
      rating,
      title: title.trim() || null,
      text: text.trim() || null,
      photo_url: photoUrl || null,
      review_date: reviewDate,
      is_published: isPublished,
      sort_order: sortOrder,
    }

    const url = mode === 'create' ? '/api/admin/reviews' : `/api/admin/reviews/${initial?.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)

    if (data.error) { setErr(data.error); return }
    router.push('/admin/reviews')
    router.refresh()
  }

  const label = { fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }
  const row = { marginBottom: '18px' }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '720px' }}>
      {err && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px' }}>
          {err}
        </div>
      )}

      <div style={row}>
        <label style={label}>Produit *</label>
        <select className="input" value={productId} onChange={e => setProductId(e.target.value)} required>
          <option value="">— Sélectionner un produit —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{(p.title as Record<string, string>)?.fr ?? p.slug}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', ...row }}>
        <div>
          <label style={label}>Nom de l&apos;auteur *</label>
          <input className="input" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Ex. Jake A." required />
        </div>
        <div>
          <label style={label}>Date de l&apos;avis</label>
          <input type="date" className="input" value={reviewDate} onChange={e => setReviewDate(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', ...row }}>
        <div>
          <label style={label}>Note (1-5) *</label>
          <select className="input" value={rating} onChange={e => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Ordre d&apos;affichage</label>
          <input type="number" className="input" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
        </div>
      </div>

      <div style={row}>
        <label style={label}>Titre (optionnel)</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex. Great structure inside" />
      </div>

      <div style={row}>
        <label style={label}>Texte de l&apos;avis (optionnel)</label>
        <textarea className="input" rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Le contenu de l'avis…" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <div style={row}>
        <label style={label}>Photo (optionnel)</label>
        {photoUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', position: 'relative', background: '#F2F2F2' }}>
              <Image src={photoUrl} alt="Preview" fill style={{ objectFit: 'cover' }} sizes="80px" />
            </div>
            <button type="button" onClick={() => setPhotoUrl('')} style={{ fontSize: '13px', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Supprimer la photo
            </button>
          </div>
        ) : (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary" style={{ fontSize: '13px' }}>
              {uploading ? 'Upload…' : 'Uploader une photo'}
            </button>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '26px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} />
          Acheteur vérifié
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
          Publié (visible sur le site)
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
          {saving ? 'Enregistrement…' : mode === 'create' ? 'Créer l\'avis' : 'Enregistrer'}
        </button>
        <button type="button" onClick={() => router.push('/admin/reviews')} className="btn-secondary" style={{ fontSize: '14px', padding: '10px 20px' }}>
          Annuler
        </button>
      </div>
    </form>
  )
}
