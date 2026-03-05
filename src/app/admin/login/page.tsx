'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Mot de passe incorrect')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#FAFAFA',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        border: '1px solid #E5E5E5',
        padding: '48px 40px', width: '100%', maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image
            src="https://flyhmbookyqckgjotihg.supabase.co/storage/v1/object/public/Logo/urban-deam-logo-long-pngc.png"
            alt="Urbandeam"
            width={140}
            height={40}
            style={{ objectFit: 'contain', height: '28px', width: 'auto', margin: '0 auto 16px' }}
          />
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', marginTop: '16px' }}>
            Espace Admin
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A3A3', marginTop: '4px' }}>
            Accès restreint — Urban Deam
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0A0A0A', marginBottom: '6px' }}>
              Mot de passe admin
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input"
              autoFocus
              required
            />
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '13px', color: '#EF4444', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Connexion…' : 'Accéder au dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
