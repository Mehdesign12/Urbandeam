'use client'

import { useEffect } from 'react'

type Props = {
  contentIds: string[]
  value: number
  currency?: string
}

export default function PixelPurchase({
  contentIds,
  value,
  currency = 'USD',
}: Props) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq
    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', {
        content_ids: contentIds,
        content_type: 'product',
        value,
        currency,
      })
    }
  // Intentionally no deps — fires once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
