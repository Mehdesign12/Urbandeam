'use client'

import { useState, useCallback } from 'react'

type Category = {
  id: string
  slug: string
  name: { fr: string; en: string }
  color: string
  position: number
  is_active: boolean
}

type EditState = {
  name_fr: string
  name_en: string
  color: string
  is_active: boolean
}

const PRESET_COLORS = [
  '#217346', '#FF4B4B', '#191919', '#F59E0B',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
]

export default function AdminCategoriesClient({ initial }: { initial: Category[] }) {
  const [cats,    setCats]    = useState<Category[]>(initial)
  const [saving,  setSaving]  = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditState>({ name_fr: '', name_en: '', color: '', is_active: true })
  const [newForm, setNewForm] = useState({ slug: '', name_fr: '', name_en: '', color: '#6B7280' })
  const [error,   setError]   = useState('')
  const [adding,  setAdding]  = useState(false)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/categories')
    const d = await res.json()
    if (d.categories) setCats(d.categories)
  }, [])

  const startEdit = (cat: Category) => {
    setEditing(cat.id)
    setEditForm({ name_fr: cat.name.fr, name_en: cat.name.en, color: cat.color, is_active: cat.is_active })
    setError('')
  }

  const saveEdit = async (id: string) => {
    setSaving(id)
    setError('')
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const d = await res.json()
    setSaving(null)
    if (!res.ok) { setError(d.error); return }
    setEditing(null)
    await refresh()
  }

  const move = async (cat: Category, dir: -1 | 1) => {
    const idx    = cats.findIndex(c => c.id === cat.id)
    const target = cats[idx + dir]
    if (!target) return
    setSaving(cat.id)
    await Promise.all([
      fetch(`/api/admin/categories/${cat.id}`,    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: target.position }) }),
      fetch(`/api/admin/categories/${target.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: cat.position }) }),
    ])
    setSaving(null)
    await refresh()
  }

  const del = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ? Les produits associés conserveront leur slug de catégorie.')) return
    setSaving(id)
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    setSaving(null)
    await refresh()
  }

  const create = async () => {
    if (!newForm.slug || !newForm.name_fr) { setError('Slug et nom FR sont requis'); return }
    setAdding(true)
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    const d = await res.json()
    setAdding(false)
    if (!res.ok) { setError(d.error); return }
    setNewForm({ slug: '', name_fr: '', name_en: '', color: '#6B7280' })
    await refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: '13px',
    border: '1px solid #E5E5E5', borderRadius: '8px',
    fontFamily: 'inherit', outline: 'none', background: 'white',
    boxSizing: 'border-box',
  }
  const btnStyle = (variant: 'primary' | 'ghost' | 'danger'): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
    background: variant === 'primary' ? '#0A0A0A' : variant === 'danger' ? '#FEE2E2' : '#F5F5F5',
    color:      variant === 'primary' ? 'white'   : variant === 'danger' ? '#DC2626' : '#0A0A0A',
  })

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Catégories</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>{cats.length} catégorie{cats.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Liste */}
      <div style={{ border: '1px solid #E5E5E5', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        {cats.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            Aucune catégorie. Créez-en une ci-dessous.
          </div>
        )}
        {cats.map((cat, idx) => (
          <div
            key={cat.id}
            style={{
              padding: '14px 20px',
              borderBottom: idx < cats.length - 1 ? '1px solid #F0F0F0' : 'none',
              background: !cat.is_active ? '#FAFAFA' : 'white',
            }}
          >
            {editing === cat.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Nom FR *</label>
                    <input style={inputStyle} value={editForm.name_fr} onChange={e => setEditForm(f => ({ ...f, name_fr: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Nom EN</label>
                    <input style={inputStyle} value={editForm.name_en} onChange={e => setEditForm(f => ({ ...f, name_en: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Couleur</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditForm(f => ({ ...f, color: c }))}
                          style={{
                            width: '22px', height: '22px', borderRadius: '50%', background: c,
                            border: editForm.color === c ? '2px solid #0A0A0A' : '2px solid transparent',
                            cursor: 'pointer', padding: 0,
                          }}
                        />
                      ))}
                      <input type="color" value={editForm.color} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                        style={{ width: '22px', height: '22px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
                    <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />
                    Visible sur le site
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={btnStyle('primary')} onClick={() => saveEdit(cat.id)} disabled={saving === cat.id}>
                    {saving === cat.id ? 'Sauvegarde…' : 'Sauvegarder'}
                  </button>
                  <button style={btnStyle('ghost')} onClick={() => setEditing(null)}>Annuler</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Couleur + nom */}
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: cat.is_active ? '#0A0A0A' : '#9CA3AF' }}>
                    {cat.name.fr}
                  </span>
                  {cat.name.en && cat.name.en !== cat.name.fr && (
                    <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '6px' }}>/ {cat.name.en}</span>
                  )}
                  <span style={{ fontSize: '11px', color: '#D1D5DB', marginLeft: '8px', fontFamily: 'monospace' }}>{cat.slug}</span>
                </div>
                {!cat.is_active && (
                  <span style={{ fontSize: '11px', color: '#9CA3AF', background: '#F5F5F5', padding: '2px 8px', borderRadius: '4px' }}>Masqué</span>
                )}
                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    onClick={() => move(cat, -1)} disabled={idx === 0 || saving === cat.id}
                    style={{ ...btnStyle('ghost'), padding: '4px 8px', opacity: idx === 0 ? 0.3 : 1 }}
                    title="Monter"
                  >↑</button>
                  <button
                    onClick={() => move(cat, 1)} disabled={idx === cats.length - 1 || saving === cat.id}
                    style={{ ...btnStyle('ghost'), padding: '4px 8px', opacity: idx === cats.length - 1 ? 0.3 : 1 }}
                    title="Descendre"
                  >↓</button>
                  <button style={btnStyle('ghost')} onClick={() => startEdit(cat)}>Modifier</button>
                  <button style={btnStyle('danger')} onClick={() => del(cat.id)} disabled={saving === cat.id}>Suppr.</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulaire création */}
      <div style={{ border: '1px solid #E5E5E5', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A', marginBottom: '16px' }}>Nouvelle catégorie</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Slug *</label>
            <input
              style={inputStyle} placeholder="ex: notion" value={newForm.slug}
              onChange={e => setNewForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Nom FR *</label>
            <input style={inputStyle} placeholder="ex: Notion" value={newForm.name_fr} onChange={e => setNewForm(f => ({ ...f, name_fr: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Nom EN</label>
            <input style={inputStyle} placeholder="ex: Notion" value={newForm.name_en} onChange={e => setNewForm(f => ({ ...f, name_en: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Couleur</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewForm(f => ({ ...f, color: c }))}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', background: c,
                  border: newForm.color === c ? '2px solid #0A0A0A' : '2px solid transparent',
                  cursor: 'pointer', padding: 0,
                }}
              />
            ))}
            <input type="color" value={newForm.color} onChange={e => setNewForm(f => ({ ...f, color: e.target.value }))}
              style={{ width: '22px', height: '22px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
          </div>
        </div>
        <button style={btnStyle('primary')} onClick={create} disabled={adding}>
          {adding ? 'Création…' : '+ Créer la catégorie'}
        </button>
      </div>
    </div>
  )
}
