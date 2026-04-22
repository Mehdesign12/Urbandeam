'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type ProductFormData = {
  slug: string
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
  price: string
  price_original: string
  category: string
  image_url: string
  gallery_urls: string[]
  file_path: string
  is_published: boolean
  sort_order: string
}

type CategoryOption = { value: string; label: string; color?: string }

type Props = {
  initialData?: Partial<ProductFormData>
  productId?: string
  mode: 'create' | 'edit'
  categories?: CategoryOption[]
}

export default function ProductForm({ initialData, productId, mode, categories = [] }: Props) {
  const router = useRouter()
  const imageInputRef   = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef    = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProductFormData>({
    slug:            initialData?.slug            ?? '',
    title_fr:        initialData?.title_fr        ?? '',
    title_en:        initialData?.title_en        ?? '',
    description_fr:  initialData?.description_fr  ?? '',
    description_en:  initialData?.description_en  ?? '',
    price:           initialData?.price           ?? '',
    price_original:  initialData?.price_original  ?? '',
    category:        initialData?.category        ?? 'pdf',
    image_url:       initialData?.image_url       ?? '',
    gallery_urls:    initialData?.gallery_urls    ?? [],
    file_path:       initialData?.file_path       ?? '',
    is_published:    initialData?.is_published    ?? false,
    sort_order:      initialData?.sort_order      ?? '0',
  })

  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')
  const [uploadingImg,     setUploadingImg]     = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingFile,    setUploadingFile]    = useState(false)
  const [imgPreview,    setImgPreview]    = useState(form.image_url)
  const [fileName,      setFileName]      = useState(form.file_path ? form.file_path.split('/').pop() ?? '' : '')

  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  // Auto-slug depuis le titre FR
  const handleTitleFr = (val: string) => {
    set('title_fr', val)
    if (mode === 'create') {
      set('slug', val.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-'))
    }
  }

  const uploadFile = async (file: File, type: 'image' | 'product') => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Erreur upload')
    return data
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    setError('')
    try {
      const data = await uploadFile(file, 'image')
      set('image_url', data.url ?? '')
      setImgPreview(data.url ?? '')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload image')
    } finally {
      setUploadingImg(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploadingGallery(true)
    setError('')
    try {
      const uploaded: string[] = []
      for (const file of files) {
        const data = await uploadFile(file, 'image')
        if (data.url) uploaded.push(data.url)
      }
      set('gallery_urls', [...form.gallery_urls, ...uploaded])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload galerie')
    } finally {
      setUploadingGallery(false)
      // Reset input to allow re-uploading same files
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const removeGalleryImage = (index: number) => {
    set('gallery_urls', form.gallery_urls.filter((_, i) => i !== index))
  }

  const moveGalleryImage = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= form.gallery_urls.length) return
    const next = [...form.gallery_urls]
    ;[next[index], next[target]] = [next[target], next[index]]
    set('gallery_urls', next)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    setError('')
    try {
      const data = await uploadFile(file, 'product')
      set('file_path', data.path ?? '')
      setFileName(file.name)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload fichier')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url    = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price:         form.price,
          price_original: form.price_original || null,
          sort_order:    Number(form.sort_order) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')
      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#EF4444', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

        {/* ── Colonne principale ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Titres */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Informations générales</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <Field label="Titre FR *">
                <input className="input" value={form.title_fr} onChange={e => handleTitleFr(e.target.value)} placeholder="Ex : Template Budget 2025" required />
              </Field>
              <Field label="Titre EN">
                <input className="input" value={form.title_en} onChange={e => set('title_en', e.target.value)} placeholder="Ex : Budget Template 2025" />
              </Field>
            </div>
            <Field label="Slug (URL) *">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#A3A3A3' }}>/products/</span>
                <input className="input" style={{ paddingLeft: '84px' }} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="template-budget-2025" required />
              </div>
            </Field>
          </div>

          {/* Descriptions */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Descriptions</h3>
            <Field label="Description FR">
              <textarea className="input" style={{ minHeight: '120px', resize: 'vertical' }} value={form.description_fr} onChange={e => set('description_fr', e.target.value)} placeholder="Décrivez votre produit en français…" />
            </Field>
            <div style={{ marginTop: '16px' }}>
              <Field label="Description EN">
                <textarea className="input" style={{ minHeight: '120px', resize: 'vertical' }} value={form.description_en} onChange={e => set('description_en', e.target.value)} placeholder="Describe your product in English…" />
              </Field>
            </div>
          </div>

          {/* Fichier digital */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Fichier digital</h3>
            <p style={{ fontSize: '13px', color: '#A3A3A3', marginBottom: '16px' }}>
              PDF, ZIP, Excel, Word, PowerPoint — max 50 MB
            </p>

            {fileName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>{fileName}</p>
                  <p style={{ fontSize: '11px', color: '#A3A3A3' }}>Fichier uploadé avec succès</p>
                </div>
                <button type="button" onClick={() => { set('file_path', ''); setFileName('') }} style={{ fontSize: '12px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #E5E5E5', borderRadius: '10px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0A0A0A')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E5E5')}
              >
                {uploadingFile ? (
                  <p style={{ fontSize: '14px', color: '#A3A3A3' }}>Upload en cours…</p>
                ) : (
                  <>
                    <svg style={{ margin: '0 auto 12px', display: 'block', color: '#A3A3A3' }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>Cliquer pour uploader</p>
                    <p style={{ fontSize: '12px', color: '#A3A3A3' }}>ou glisser-déposer le fichier ici</p>
                  </>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept=".pdf,.zip,.xlsx,.xls,.docx,.doc,.pptx,.ppt" onChange={handleFileUpload} />
          </div>
        </div>

        {/* ── Colonne latérale ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Publication */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Publication</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div
                onClick={() => set('is_published', !form.is_published)}
                style={{
                  width: '44px', height: '24px', borderRadius: '99px',
                  background: form.is_published ? '#0A0A0A' : '#E5E5E5',
                  position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '3px',
                  left: form.is_published ? '23px' : '3px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>
                  {form.is_published ? 'Publié' : 'Brouillon'}
                </p>
                <p style={{ fontSize: '12px', color: '#A3A3A3' }}>
                  {form.is_published ? 'Visible sur le site' : 'Non visible'}
                </p>
              </div>
            </label>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F0F0F0' }}>
              <Field label="Ordre d'affichage">
                <input className="input" type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="0" />
              </Field>
            </div>
          </div>

          {/* Prix */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Prix</h3>
            <Field label="Prix de vente ($) *">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#0A0A0A' }}>$</span>
                <input className="input" style={{ paddingLeft: '28px' }} type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="19.00" required />
              </div>
            </Field>
            <div style={{ marginTop: '12px' }}>
              <Field label="Prix barré (optionnel)">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#A3A3A3' }}>$</span>
                  <input className="input" style={{ paddingLeft: '28px' }} type="number" step="0.01" min="0" value={form.price_original} onChange={e => set('price_original', e.target.value)} placeholder="29.00" />
                </div>
              </Field>
            </div>
          </div>

          {/* Catégorie */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Catégorie</h3>
            {categories.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                Aucune catégorie disponible.{' '}
                <a href="/admin/categories" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>
                  Créez-en une d&apos;abord.
                </a>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map(({ value, label, color }) => (
                  <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${form.category === value ? '#0A0A0A' : '#E5E5E5'}`, cursor: 'pointer', transition: 'border-color 0.12s' }}>
                    <input type="radio" name="category" value={value} checked={form.category === value} onChange={() => set('category', value)} style={{ display: 'none' }} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${form.category === value ? '#0A0A0A' : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {form.category === value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0A0A0A' }} />}
                    </div>
                    {color && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />}
                    <span style={{ fontSize: '14px', fontWeight: form.category === value ? 500 : 400 }}>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Image produit</h3>
            <div
              onClick={() => imageInputRef.current?.click()}
              style={{ cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', border: '2px dashed #E5E5E5', aspectRatio: '16/9', position: 'relative', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0A0A0A')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E5E5')}
            >
              {imgPreview ? (
                <Image src={imgPreview} alt="Preview" fill style={{ objectFit: 'cover' }} sizes="300px" />
              ) : uploadingImg ? (
                <p style={{ fontSize: '13px', color: '#A3A3A3' }}>Upload en cours…</p>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <svg style={{ margin: '0 auto 8px', display: 'block', color: '#A3A3A3' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p style={{ fontSize: '12px', color: '#A3A3A3' }}>Cliquer pour ajouter</p>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
            {imgPreview && (
              <button type="button" onClick={() => { set('image_url', ''); setImgPreview('') }} style={{ marginTop: '8px', fontSize: '12px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}>
                Supprimer l&apos;image
              </button>
            )}
          </div>

          {/* Galerie d'images supplémentaires */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Galerie d&apos;images</h3>
            <p style={{ fontSize: '12px', color: '#A3A3A3', marginBottom: '12px' }}>
              Images additionnelles affichées dans le carrousel de la fiche produit.
            </p>

            {form.gallery_urls.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                {form.gallery_urls.map((url, i) => (
                  <div key={`${url}-${i}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E5E5', background: '#F9FAFB' }}>
                    <Image src={url} alt={`Galerie ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="100px" />
                    <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '2px' }}>
                      {i > 0 && (
                        <button type="button" onClick={() => moveGalleryImage(i, -1)} title="Déplacer vers le haut" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>↑</button>
                      )}
                      {i < form.gallery_urls.length - 1 && (
                        <button type="button" onClick={() => moveGalleryImage(i, 1)} title="Déplacer vers le bas" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>↓</button>
                      )}
                      <button type="button" onClick={() => removeGalleryImage(i)} title="Supprimer" style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
                    </div>
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '4px', padding: '1px 5px', fontSize: '10px', fontWeight: 600 }}>{i + 1}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed #E5E5E5', background: '#F9FAFB', color: '#0A0A0A', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {uploadingGallery ? 'Upload en cours…' : form.gallery_urls.length === 0 ? '+ Ajouter des images' : '+ Ajouter plus d\'images'}
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleGalleryUpload}
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ fontSize: '14px', padding: '10px 20px' }}>
          Annuler
        </button>
        <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: '14px', padding: '10px 24px', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Enregistrement…' : mode === 'create' ? 'Créer le produit' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#525252', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: '12px',
  border: '1px solid #E5E5E5', padding: '24px',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '15px', fontWeight: 600, color: '#0A0A0A', marginBottom: '16px',
}
