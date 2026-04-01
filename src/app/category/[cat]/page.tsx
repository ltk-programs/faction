import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllFactFiles } from '@/lib/content'
import { StatusBadge } from '@/components/StatusBadge'

export async function generateStaticParams() {
  const files = await getAllFactFiles()
  const cats = new Set(files.flatMap(f => f.category))
  return Array.from(cats).map(cat => ({ cat: encodeURIComponent(cat) }))
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params
  const label = decodeURIComponent(cat)
  return {
    title: `${label} — FACTION`,
    description: `All FACTION fact files in the ${label} category. Primary-source evidence only.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const label = decodeURIComponent(cat)
  const allFiles = await getAllFactFiles()

  const files = allFiles.filter(f =>
    f.category.some(c => c.toLowerCase() === label.toLowerCase())
  )

  if (files.length === 0) notFound()

  const openCount = files.filter(f => f.status === 'open').length
  const developingCount = files.filter(f => f.status === 'developing').length
  const resolvedCount = files.filter(f => f.status === 'resolved').length

  // All other categories that appear alongside this one
  const related = Array.from(
    new Set(files.flatMap(f => f.category).filter(c => c.toLowerCase() !== label.toLowerCase()))
  ).sort()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <span className="text-slate-600 capitalize">{label}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#EAF1FB] text-[#1A4A8A] border border-[#C5D8F5] font-semibold capitalize">
            {label}
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#0D1F3C] capitalize">{label}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {files.length} fact file{files.length !== 1 ? 's' : ''} ·{' '}
          {openCount > 0 && `${openCount} open · `}
          {developingCount > 0 && `${developingCount} developing · `}
          {resolvedCount > 0 && `${resolvedCount} resolved`}
        </p>
      </div>

      {/* Fact files */}
      <div className="space-y-3 mb-8">
        {files.map(ff => (
          <Link
            key={ff.slug}
            href={`/fact/${ff.slug}`}
            className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-[#2A7DE1] hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <StatusBadge status={ff.status} />
                  {ff.category.filter(c => c.toLowerCase() !== label.toLowerCase()).map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{c}</span>
                  ))}
                </div>
                <h2 className="text-sm font-bold text-slate-800 group-hover:text-[#1A4A8A] transition-colors leading-snug">
                  {ff.title}
                </h2>
                {ff.subtitle && (
                  <p className="text-xs text-slate-400 mt-0.5">{ff.subtitle}</p>
                )}
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                  {ff.summary.slice(0, 160)}…
                </p>
              </div>
              <div className="text-right shrink-0 text-xs text-slate-400">
                <div className="font-mono">{ff.evidence_count} sources</div>
                <div className="mt-0.5">
                  {new Date(ff.last_updated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Related categories */}
      {related.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Related categories
          </p>
          <div className="flex flex-wrap gap-2">
            {related.map(c => (
              <Link
                key={c}
                href={`/category/${encodeURIComponent(c)}`}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:border-[#2A7DE1] hover:text-[#1A4A8A] hover:bg-[#EAF1FB] transition-colors capitalize"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
