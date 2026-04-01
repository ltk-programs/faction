import Link from 'next/link'
import { getAllFactFilesRaw } from '@/lib/content'

export const metadata = { title: 'Source Reputation — FACTION' }

interface DomainStat {
  domain: string
  total: number
  tier1: number
  tier3: number
  verified: number
  factFiles: string[]
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default async function SourcesPage() {
  const factFiles = await getAllFactFilesRaw()

  // Aggregate domain stats across all fact files
  const domainMap = new Map<string, DomainStat>()

  for (const ff of factFiles) {
    for (const ev of ff.evidence) {
      const domain = extractDomain(ev.url)
      const existing = domainMap.get(domain) ?? {
        domain,
        total: 0,
        tier1: 0,
        tier3: 0,
        verified: 0,
        factFiles: [],
      }
      existing.total++
      if (ev.tier === 1) existing.tier1++
      else existing.tier3++
      if (ev.verified) existing.verified++
      if (!existing.factFiles.includes(ff.slug)) existing.factFiles.push(ff.slug)
      domainMap.set(domain, existing)
    }
  }

  const domains = Array.from(domainMap.values())
    .sort((a, b) => b.total - a.total)

  const totalSources = domains.reduce((s, d) => s + d.total, 0)
  const tier1Total = domains.reduce((s, d) => s + d.tier1, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <span className="text-slate-600">Source Reputation</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0D1F3C]">Source Reputation Index</h1>
        <p className="text-slate-500 text-sm mt-1">
          Every domain cited across all FACTION fact files — with tier distribution and verification status.
          Builds automatically as content grows.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Unique domains', value: domains.length },
          { label: 'Total sources', value: totalSources },
          { label: 'Tier 1 ratio', value: `${Math.round((tier1Total / totalSources) * 100)}%` },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-[#0D1F3C]">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Domain table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            All cited domains · sorted by source count
          </p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Domain</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">Sources</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">Tier 1</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">Tier 3</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">Verified</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Fact Files</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {domains.map(d => {
              const tier1Pct = Math.round((d.tier1 / d.total) * 100)
              return (
                <tr key={d.domain} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-slate-700">{d.domain}</span>
                      {tier1Pct === 100 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                          All Tier 1
                        </span>
                      )}
                    </div>
                    {/* Mini tier bar */}
                    <div className="mt-1.5 h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${tier1Pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-slate-700">{d.total}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-blue-700">{d.tier1}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-amber-700">{d.tier3 || '—'}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-emerald-700">{d.verified}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {d.factFiles.slice(0, 3).map(slug => (
                        <Link
                          key={slug}
                          href={`/fact/${slug}`}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded hover:bg-[#EAF1FB] hover:text-[#1A4A8A] transition-colors"
                        >
                          {slug.replace(/-/g, ' ').slice(0, 20)}
                        </Link>
                      ))}
                      {d.factFiles.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{d.factFiles.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400 text-center">
        Domain reliability is based on FACTION editorial review only — not automated scoring.{' '}
        <Link href="/methodology" className="text-[#2A7DE1] hover:underline">Read our methodology →</Link>
      </p>
    </div>
  )
}
