'use client'

import { useEffect } from 'react'

/**
 * On mount, checks if the URL has a #ev-{id} hash and scrolls to + highlights that element.
 * Placed once on the fact file page — lightweight, no visible output.
 */
export function HashScroller() {
  useEffect(() => {
    const hash = window.location.hash  // e.g. "#ev-abc123"
    if (!hash.startsWith('#ev-')) return

    const target = document.getElementById(hash.slice(1))
    if (!target) return

    // Smooth scroll
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Pulse highlight
    target.classList.add('ring-2', 'ring-[#2A7DE1]', 'ring-offset-2')
    setTimeout(() => {
      target.classList.remove('ring-2', 'ring-[#2A7DE1]', 'ring-offset-2')
    }, 3000)
  }, [])

  return null
}
