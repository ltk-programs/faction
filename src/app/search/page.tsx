import type { Metadata } from 'next'
import { getAllFactFiles } from '@/lib/content'
import { HomePageClient } from '@/components/HomePageClient'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all FACTION fact files by topic, category, status, and keyword.',
}

export default async function SearchPage() {
  const factFiles = await getAllFactFiles()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Link href="/" className="hover:text-[#2A7DE1] transition-colors">FACTION</Link>
          <span>/</span>
          <span className="text-slate-600">Search</span>
        </div>
        <h1 className="text-2xl font-black text-[#0D1F3C] tracking-tight mb-1">
          Search fact files
        </h1>
        <p className="text-slate-500 text-sm">
          {factFiles.length} topic{factFiles.length !== 1 ? 's' : ''} indexed · fuzzy-match across titles, categories, and summaries
        </p>
      </div>

      {/* Search + filter UI (autofocused in standalone mode) */}
      <HomePageClient factFiles={factFiles} standalone />
    </div>
  )
}
