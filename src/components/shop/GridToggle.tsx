'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function GridToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? '4'

  const setView = useCallback((v: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {/* 4 colonnes */}
      <button
        onClick={() => setView('4')}
        aria-label="Grille 4 colonnes"
        style={{
          width: '32px', height: '32px', border: '1px solid',
          borderColor: view === '4' ? '#0A0A0A' : '#E5E5E5',
          borderRadius: '6px', background: view === '4' ? '#0A0A0A' : 'white',
          color: view === '4' ? 'white' : '#6B7280',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <rect x="0" y="0" width="7" height="7" rx="1"/><rect x="9" y="0" width="7" height="7" rx="1"/>
          <rect x="0" y="9" width="7" height="7" rx="1"/><rect x="9" y="9" width="7" height="7" rx="1"/>
        </svg>
      </button>
      {/* 5 colonnes */}
      <button
        onClick={() => setView('5')}
        aria-label="Grille 5 colonnes"
        style={{
          width: '32px', height: '32px', border: '1px solid',
          borderColor: view === '5' ? '#0A0A0A' : '#E5E5E5',
          borderRadius: '6px', background: view === '5' ? '#0A0A0A' : 'white',
          color: view === '5' ? 'white' : '#6B7280',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <rect x="0" y="0" width="3" height="9" rx="0.5"/><rect x="4.25" y="0" width="3" height="9" rx="0.5"/>
          <rect x="8.5" y="0" width="3" height="9" rx="0.5"/><rect x="12.75" y="0" width="3" height="9" rx="0.5"/>
          <rect x="17" y="0" width="3" height="9" rx="0.5"/>
          <rect x="0" y="11" width="3" height="9" rx="0.5"/><rect x="4.25" y="11" width="3" height="9" rx="0.5"/>
          <rect x="8.5" y="11" width="3" height="9" rx="0.5"/><rect x="12.75" y="11" width="3" height="9" rx="0.5"/>
          <rect x="17" y="11" width="3" height="9" rx="0.5"/>
        </svg>
      </button>
    </div>
  )
}
