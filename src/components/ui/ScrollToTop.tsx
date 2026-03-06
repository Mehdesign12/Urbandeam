'use client'

import { useEffect } from 'react'

/**
 * Force le scroll à (0,0) dès que la page monte.
 * Corrige le bug Next.js App Router qui restaure parfois
 * une position de scroll résiduelle en naviguant sur mobile.
 */
export default function ScrollToTop() {
  useEffect(() => {
    // Immédiat + sans animation pour éviter le flash "page basse"
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return null
}
