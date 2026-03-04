'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Option = { value: string; label: string }

type Props = {
  options: Option[]
  activeSort: string
}

export default function SortSelect({ options, activeSort }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    const val = e.target.value
    if (val && val !== 'popular') {
      params.set('sort', val)
    } else {
      params.delete('sort')
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  return (
    <select
      value={activeSort}
      onChange={handleChange}
      style={{
        padding: '8px 32px 8px 12px',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'var(--font-sans)',
        background: 'white',
        color: 'var(--color-black)',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A3A3A3' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
