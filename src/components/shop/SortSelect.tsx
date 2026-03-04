'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }
type Props = {
  options: Option[]
  activeSort: string
  variant?: 'select' | 'inline'
}

export default function SortSelect({ options, activeSort, variant = 'inline' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = useCallback((val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== 'popular') params.set('sort', val)
    else params.delete('sort')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setOpen(false)
  }, [router, pathname, searchParams])

  const activeLabel = options.find(o => o.value === activeSort)?.label ?? options[0]?.label

  if (variant === 'select') {
    return (
      <select
        value={activeSort}
        onChange={e => handleChange(e.target.value)}
        style={{
          padding: '7px 28px 7px 12px',
          border: '1px solid #E5E5E5',
          borderRadius: '6px', fontSize: '13px',
          background: 'white', color: '#0A0A0A',
          cursor: 'pointer', outline: 'none',
          appearance: 'none', fontFamily: 'inherit',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="ud-catalog__filter-btn"
        onClick={() => setOpen(!open)}
      >
        Sort
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0,
          background: 'white', border: '1px solid #E5E5E5',
          borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          minWidth: '180px', overflow: 'hidden', zIndex: 200,
        }}>
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => handleChange(o.value)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 16px', fontSize: '13px',
                fontWeight: o.value === activeSort ? 600 : 400,
                color: '#0A0A0A', background: o.value === activeSort ? '#F5F5F5' : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
              onMouseLeave={e => (e.currentTarget.style.background = o.value === activeSort ? '#F5F5F5' : 'transparent')}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
