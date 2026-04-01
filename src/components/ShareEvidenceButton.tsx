'use client'

import { useState, useCallback } from 'react'

interface Props {
  evidenceId: string
}

/**
 * Copies a direct link to this evidence card to the clipboard.
 * The hash format is #ev-{evidenceId}.
 */
export function ShareEvidenceButton({ evidenceId }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#ev-${evidenceId}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text from a temporary input
      const url = `${window.location.origin}${window.location.pathname}#ev-${evidenceId}`
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [evidenceId])

  return (
    <button
      onClick={handleCopy}
      title="Copy link to this evidence"
      className="text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors whitespace-nowrap"
    >
      {copied ? '✓ Copied' : '🔗'}
    </button>
  )
}
