'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RecheckButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRecheck() {
    setLoading(true)
    try {
      await fetch('/api/check-links', { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRecheck}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-lg border border-[#2A7DE1] text-[#2A7DE1] hover:bg-[#2A7DE1] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {loading ? (
        <>
          <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Checking…
        </>
      ) : (
        <>🔄 Re-check now</>
      )}
    </button>
  )
}
