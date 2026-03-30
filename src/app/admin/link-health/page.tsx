import Link from 'next/link'
import { getLinkCheckResults } from '@/lib/content'
import type { LinkCheckResult } from '@/lib/content'
import RecheckButton from './RecheckButton'

// Read cached results — no live fetch on page load
export const dynamic = 'force-dynamic'

function StatusPill({ result }: { result: LinkCheckResult }) {
  if (result.ok) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        ✓ {result.status}
      </span>
    )
  }
  if (result.error?.includes('abort') || result.error?.includes('timeout')) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        ⏱ Timeout
      </span>
    )
  }
  if (result.status) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
        ✗ {result.status}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
      ✗ Error
    </span>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default async function LinkHealthPage() {
  const cached = await getLinkCheckResults()

  const results = cached?.results ?? []
  const checkedAt = cached?.checkedAt ?? null

  const ok = results.filter(r => r.ok)
  const broken = results.filter(r => !r.ok)
  const grouped = broken.reduce<Record<string, LinkCheckResult[]>>((acc, r) => {
    if (!acc[r.slug]) acc[r.slug] = []
    acc[r.slug].push(r)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-800">← Admin</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">Link Health</h1>
      </div>

      {/* Header row: last checked + re-check button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {checkedAt
            ? <>Last checked: <span className="font-medium text-slate-700">{timeAgo(checkedAt)}</span> ({new Date(checkedAt).toLocaleString()})</>
            : 'No check run yet. Hit Re-check to start.'}
        </p>
        <RecheckButton />
      </div>

      {!cached ? (
        <div className="border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <p className="text-4xl mb-3">🔗</p>
          <p className="font-semibold text-slate-600">No results yet</p>
          <p className="text-sm mt-1">Click "Re-check now" to run the first link health scan.</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-700">{ok.length}</div>
              <div className="text-xs text-emerald-600 mt-0.5">Responding OK</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-red-700">{broken.length}</div>
              <div className="text-xs text-red-600 mt-0.5">Need attention</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-slate-700">{results.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total checked</div>
            </div>
          </div>

          {broken.length === 0 ? (
            <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-8 text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="font-semibold text-emerald-800">All links responding</p>
              <p className="text-sm text-emerald-600 mt-1">All {results.length} evidence URLs returned a successful response.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                URLs needing attention ({broken.length})
              </h2>

              {Object.entries(grouped).map(([slug, items]) => (
                <div key={slug} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                    <span className="font-mono text-sm font-semibold text-slate-700">{slug}</span>
                    <Link
                      href={`/admin/${slug}`}
                      className="text-xs text-[#2A7DE1] hover:underline"
                    >
                      Edit fact file →
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {items.map(r => (
                      <div key={r.evidenceId} className="px-4 py-3 flex items-start gap-3">
                        <StatusPill result={r} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-400 hover:text-[#2A7DE1] font-mono truncate block"
                          >
                            {r.url}
                          </a>
                          {r.error && (
                            <p className="text-xs text-red-500 mt-0.5">{r.error}</p>
                          )}
                        </div>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs px-2 py-1 rounded border border-slate-200 text-slate-500 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors"
                        >
                          Test ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OK links — collapsed */}
          {ok.length > 0 && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-800 select-none">
                ▶ Show {ok.length} passing URLs
              </summary>
              <div className="mt-3 border border-slate-200 rounded-xl divide-y divide-slate-100">
                {ok.map(r => (
                  <div key={r.evidenceId} className="px-4 py-2.5 flex items-center gap-3">
                    <StatusPill result={r} />
                    <span className="text-xs text-slate-500 font-mono truncate flex-1">{r.url}</span>
                    <span className="text-xs text-slate-400">{r.slug}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
