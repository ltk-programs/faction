'use client'

import { useState, useTransition } from 'react'
import { approveAndMerge } from '@/lib/actions'

interface Props {
  submissionId: string
  type: 'new_evidence' | 'new_topic' | 'correction'
}

export function MergeButton({ submissionId, type }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      const res = await approveAndMerge(submissionId)
      setResult(res)
    })
  }

  if (result) {
    return (
      <div className={`text-xs px-3 py-1.5 rounded border font-medium ${
        result.ok
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
        {result.ok ? '✓' : '⚠'} {result.message}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`text-xs px-3 py-1.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        type === 'new_evidence'
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-slate-600 text-white hover:bg-slate-700'
      }`}
    >
      {isPending
        ? 'Processing…'
        : type === 'new_evidence'
          ? '✓ Accept & Merge'
          : '✓ Accept'
      }
    </button>
  )
}
