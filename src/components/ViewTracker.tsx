'use client'

import { useEffect } from 'react'

interface Props {
  slug: string
}

/**
 * Invisible component — fires a single POST to record a page view.
 * No cookies. No fingerprinting. No third-party scripts.
 * Silently no-ops if the request fails.
 */
export function ViewTracker({ slug }: Props) {
  useEffect(() => {
    fetch(`/api/views/${slug}`, { method: 'POST' }).catch(() => {})
  }, [slug])

  return null
}
