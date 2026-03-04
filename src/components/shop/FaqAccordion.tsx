'use client'

import { useState } from 'react'

type FaqItem = { q: string; a: string }

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={i} style={{
            borderTop: '1px solid var(--color-gray-100)',
          }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '18px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-black)',
                lineHeight: 1.4,
              }}>
                {item.q}
              </span>
              <span style={{
                flexShrink: 0,
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-muted)',
                transition: 'transform 200ms ease',
                transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
            </button>
            <div style={{
              overflow: 'hidden',
              maxHeight: isOpen ? '200px' : '0',
              transition: 'max-height 250ms ease',
            }}>
              <p style={{
                fontSize: '14px',
                color: 'var(--color-secondary)',
                lineHeight: 1.7,
                paddingBottom: '18px',
              }}>
                {item.a}
              </p>
            </div>
          </div>
        )
      })}
      {/* Dernière bordure */}
      <div style={{ borderTop: '1px solid var(--color-gray-100)' }} />
    </div>
  )
}
