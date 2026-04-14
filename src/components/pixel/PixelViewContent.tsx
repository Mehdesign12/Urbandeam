'use client'

import { useEffect } from 'react'

type Props = {
  contentId: string
  contentName: string
  value: number
  currency?: string
}

export default function PixelViewContent({
  contentId,
  contentName,
  value,
  currency = 'EUR',
}: Props) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq
    if (typeof fbq === 'function') {
      fbq('track', 'ViewContent', {
        content_ids: [contentId],
        content_name: contentName,
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
