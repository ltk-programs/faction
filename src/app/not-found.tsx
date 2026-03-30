import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      {/* Large muted number */}
      <div className="text-[120px] font-black leading-none text-slate-100 select-none" aria-hidden="true">
        404
      </div>

      <div className="-mt-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          No record found at this address
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto mb-8">
          This page doesn&apos;t exist in the FACTION index. The URL may be incorrect,
          or this fact file may have been removed or renamed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#0D1F3C] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4A8A] transition-colors"
          >
            Browse all topics
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:border-slate-400 transition-colors"
          >
            Search the index
          </Link>
        </div>
      </div>

      {/* Subtle branding */}
      <p className="mt-16 text-xs text-slate-300 font-mono">
        FACTION · Primary sources only
      </p>
    </div>
  )
}
