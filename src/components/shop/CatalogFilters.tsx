'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Category = { value: string; label: string }

type Props = {
  categories: Category[]
  activeCategory: string
  locale: string
}

export default function CatalogFilters({ categories, activeCategory, locale }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setCategory = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) {
      params.set('cat', cat)
    } else {
      params.delete('cat')
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      marginBottom: '28px',
    }}>
      {categories.map(cat => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              border: isActive ? '1px solid var(--color-black)' : '1px solid var(--color-border)',
              background: isActive ? 'var(--color-black)' : 'white',
              color: isActive ? 'white' : 'var(--color-secondary)',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-black)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-black)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-secondary)'
              }
            }}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
