'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to an error reporting service if one is added later
    console.error('[FACTION error]', error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      {/* Icon */}
      <div className="text-5xl mb-4 select-none" aria-hidden="true">⚠</div>

      <h1 className="text-2xl font-bold text-slate-900 mb-3">
        Something went wrong
      </h1>
      <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto mb-8">
        An unexpected error occurred. The FACTION record you were viewing may be
        temporarily unavailable. Please try again — if the problem persists,
        contact us via the{' '}
        <a href="/submit" className="text-[#2A7DE1] hover:underline">
          submit form
        </a>.
      </p>

      {error.digest && (
        <p className="text-xs font-mono text-slate-300 mb-6">
          Error reference: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#0D1F3C] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4A8A] transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:border-slate-400 transition-colors"
        >
          Return home
        </a>
      </div>

      <p className="mt-16 text-xs text-slate-300 font-mono">
        FACTION · Primary sources only
      </p>
    </div>
  )
}
