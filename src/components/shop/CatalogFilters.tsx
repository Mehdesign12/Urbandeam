'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

type FilterGroup = { label: string; options: string[] }

type Props = {
  categories: { value: string; label: string }[]
  activeCategory: string
  locale: string
  filterOptions?: FilterGroup[]
}

export default function CatalogFilters({ locale, filterOptions }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const setCategory = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) params.set('cat', cat)
    else params.delete('cat')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const groups = filterOptions ?? [
    { label: locale === 'fr' ? 'Disponibilité' : 'Availability', options: [locale === 'fr' ? 'Tous' : 'All', locale === 'fr' ? 'En stock' : 'In stock'] },
    { label: locale === 'fr' ? 'Prix' : 'Price', options: [locale === 'fr' ? 'Tous les prix' : 'All prices'] },
  ]

  const catFilters = [
    { value: '', label: locale === 'fr' ? 'Tous' : 'All' },
    ...categories.filter(c => c.value !== ''),
  ]

  const activeCat = searchParams.get('cat') ?? ''

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Filtres dropdowns style Platsupply */}
      {groups.map(group => (
        <div key={group.label} style={{ position: 'relative' }}>
          <button
            className="ud-catalog__filter-btn"
            onClick={() => setOpenFilter(openFilter === group.label ? null : group.label)}
          >
            {group.label}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {openFilter === group.label && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0,
              background: 'white', border: '1px solid #E5E5E5',
              borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              minWidth: '160px', overflow: 'hidden', zIndex: 200,
            }}>
              {group.options.map(opt => (
                <button
                  key={opt}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 16px', fontSize: '13px', color: '#0A0A0A',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => {
                    setOpenFilter(null)
                    // Pour "Price" et catégorie uniquement
                    if (group.label === 'Prix' || group.label === 'Price') {
                      const map: Record<string, string> = {
                        'Excel': 'excel', 'Notion': 'notion', 'PDF': 'pdf',
                      }
                      if (map[opt]) setCategory(map[opt])
                      else setCategory('')
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Séparateur + pills catégories */}
      <div style={{ width: '1px', height: '20px', background: '#E5E5E5', margin: '0 4px' }} />
      {catFilters.map(cat => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          style={{
            padding: '6px 14px', borderRadius: '6px',
            fontSize: '13px', fontWeight: activeCat === cat.value ? 600 : 400,
            border: activeCat === cat.value ? '1px solid #0A0A0A' : '1px solid #E5E5E5',
            background: activeCat === cat.value ? '#0A0A0A' : 'white',
            color: activeCat === cat.value ? 'white' : '#0A0A0A',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.12s',
          }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
