import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllFactFilesRaw } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Platform Stats',
  description: 'Live statistics for the FACTION evidence database — topics, sources, categories, and coverage.',
}

// Revalidate stats every hour
export const revalidate = 3600

function StatCard({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center">
      <div className="text-3xl font-black text-[#0D1F3C] dark:text-slate-100">{value}</div>
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
    </div>
  )
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
    </div>
  )
}

export default async function StatsPage() {
  const factFiles = await getAllFactFilesRaw()
  const published = factFiles.filter(f => !f.is_draft)

  // ── Core counts ────────────────────────────────────────────────────────────
  const totalFiles        = published.length
  const totalEvidence     = published.reduce((s, f) => s + f.evidence.length, 0)
  const totalTimeline     = published.reduce((s, f) => s + f.timeline.length, 0)
  const totalContested    = published.reduce((s, f) => s + f.contested_claims.length, 0)
  const totalDataPanels   = published.reduce((s, f) => s + f.data_panels.length, 0)
  const tier1Count        = published.reduce((s, f) => s + f.evidence.filter(e => e.tier === 1).length, 0)
  const tier3Count        = published.reduce((s, f) => s + f.evidence.filter(e => e.tier === 3).length, 0)
  const verifiedCount     = published.reduce((s, f) => s + f.evidence.filter(e => e.verified).length, 0)

  // ── Status distribution ────────────────────────────────────────────────────
  const byStatus = {
    open:       published.filter(f => f.status === 'open').length,
    developing: published.filter(f => f.status === 'developing').length,
    resolved:   published.filter(f => f.status === 'resolved').length,
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  const catMap = new Map<string, number>()
  for (const f of published) {
    for (const c of f.category) {
      catMap.set(c, (catMap.get(c) ?? 0) + 1)
    }
  }
  const categories = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
  const maxCatCount = categories[0]?.[1] ?? 1

  // ── Source types ───────────────────────────────────────────────────────────
  const typeMap = new Map<string, number>()
  for (const f of published) {
    for (const e of f.evidence) {
      typeMap.set(e.source_type, (typeMap.get(e.source_type) ?? 0) + 1)
    }
  }
  const sourceTypes = Array.from(typeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  const maxTypeCount = sourceTypes[0]?.[1] ?? 1

  // ── Top fact files by evidence count ──────────────────────────────────────
  const topByEvidence = [...published]
    .sort((a, b) => b.evidence.length - a.evidence.length)
    .slice(0, 5)

  // ── Top by votes ──────────────────────────────────────────────────────────
  const topByVotes = [...published]
    .sort((a, b) => b.priority_votes - a.priority_votes)
    .slice(0, 5)

  // ── Coverage span ─────────────────────────────────────────────────────────
  const allDates = published.flatMap(f => f.timeline.map(t => t.date)).filter(Boolean).sort()
  const earliestDate = allDates[0]
  const latestDate   = allDates[allDates.length - 1]

  const tier1Pct    = totalEvidence > 0 ? Math.round((tier1Count / totalEvidence) * 100) : 0
  const verifiedPct = totalEvidence > 0 ? Math.round((verifiedCount / totalEvidence) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-400">Platform Stats</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0D1F3C] dark:text-slate-100 tracking-tight">
          Platform Statistics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Live metrics for the FACTION evidence database. Updated automatically as content grows.
        </p>
      </div>

      {/* ── Core stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard value={totalFiles}    label="Fact Files"      sub={`${factFiles.filter(f => f.is_draft).length} draft`} />
        <StatCard value={totalEvidence} label="Primary Sources" sub={`${tier1Pct}% Tier 1`} />
        <StatCard value={totalTimeline} label="Timeline Events" sub="across all files" />
        <StatCard value={catMap.size}   label="Categories"      sub="unique topics" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard value={tier1Count}     label="Tier 1 Sources"  sub="official primary" />
        <StatCard value={tier3Count}     label="Tier 3 Sources"  sub="community verified" />
        <StatCard value={verifiedCount}  label="Verified"        sub={`${verifiedPct}% of total`} />
        <StatCard value={totalContested} label="Contested Claims" sub="genuine disputes" />
      </div>

      {/* ── Status distribution ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Status distribution</h2>
        <div className="space-y-3">
          {[
            { label: 'Open',       count: byStatus.open,       color: 'bg-blue-400',  textColor: 'text-blue-600 dark:text-blue-400' },
            { label: 'Developing', count: byStatus.developing, color: 'bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400' },
            { label: 'Resolved',   count: byStatus.resolved,   color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
          ].map(row => (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${row.textColor}`}>{row.label}</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {row.count} ({totalFiles > 0 ? Math.round((row.count / totalFiles) * 100) : 0}%)
                </span>
              </div>
              <Bar pct={totalFiles > 0 ? (row.count / totalFiles) * 100 : 0} color={row.color} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Two column: categories + source types ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top categories */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Top categories
          </h2>
          <div className="space-y-2.5">
            {categories.map(([cat, count]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href={`/category/${encodeURIComponent(cat)}`}
                    className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#2A7DE1] capitalize"
                  >
                    {cat}
                  </Link>
                  <span className="text-xs font-mono text-slate-400">{count}</span>
                </div>
                <Bar pct={(count / maxCatCount) * 100} color="bg-[#2A7DE1]" />
              </div>
            ))}
          </div>
        </div>

        {/* Source types */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Source types
          </h2>
          <div className="space-y-2.5">
            {sourceTypes.map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{count}</span>
                </div>
                <Bar pct={(count / maxTypeCount) * 100} color="bg-indigo-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top fact files ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* By evidence count */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Most documented (by sources)
          </h2>
          <ol className="space-y-2">
            {topByEvidence.map((f, i) => (
              <li key={f.slug}>
                <Link
                  href={`/fact/${f.slug}`}
                  className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-[#2A7DE1] group"
                >
                  <span className="text-xs font-mono text-slate-300 dark:text-slate-600 w-4">{i + 1}</span>
                  <span className="flex-1 truncate group-hover:text-[#2A7DE1] transition-colors">{f.title}</span>
                  <span className="text-xs font-mono text-slate-400 shrink-0">{f.evidence.length}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* By priority votes */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Highest priority (by votes)
          </h2>
          <ol className="space-y-2">
            {topByVotes.map((f, i) => (
              <li key={f.slug}>
                <Link
                  href={`/fact/${f.slug}`}
                  className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-[#2A7DE1] group"
                >
                  <span className="text-xs font-mono text-slate-300 dark:text-slate-600 w-4">{i + 1}</span>
                  <span className="flex-1 truncate group-hover:text-[#2A7DE1] transition-colors">{f.title}</span>
                  <span className="text-xs font-mono text-slate-400 shrink-0">{f.priority_votes}▲</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Coverage timeline ── */}
      {earliestDate && latestDate && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
            Timeline coverage
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-400">Earliest documented event</div>
              <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {new Date(earliestDate + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#2A7DE1] to-slate-200 dark:to-slate-700 rounded" />
            <div className="text-right">
              <div className="text-xs text-slate-400">Latest documented event</div>
              <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {new Date(latestDate + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {totalTimeline} documented events spanning{' '}
            {Math.round((new Date(latestDate).getTime() - new Date(earliestDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
          </div>
        </div>
      )}

      {/* ── Data panels + contested ── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard value={totalDataPanels} label="Data Panels" sub="charts and datasets" />
        <StatCard value={totalContested}  label="Contested Claims" sub="verified factual disputes" />
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-600">
        Stats update automatically as the evidence base grows.{' '}
        <Link href="/methodology" className="text-[#2A7DE1] hover:underline">Read our methodology →</Link>
      </p>
    </div>
  )
}
