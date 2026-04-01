import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllFactFilesRaw } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Timeline — FACTION',
  description: 'All documented events across every FACTION fact file, in chronological order.',
}

interface TimelineEntry {
  date: string
  time?: string
  title: string
  description: string
  factFileTitle: string
  factFileSlug: string
  factFileStatus: string
  category: string[]
}

export default async function TimelinePage() {
  const factFiles = await getAllFactFilesRaw()

  // Flatten all timeline events across all fact files
  const entries: TimelineEntry[] = []

  for (const ff of factFiles) {
    if (ff.is_draft) continue
    for (const event of ff.timeline) {
      entries.push({
        date: event.date,
        time: event.time,
        title: event.title,
        description: event.description,
        factFileTitle: ff.title,
        factFileSlug: ff.slug,
        factFileStatus: ff.status,
        category: ff.category,
      })
    }
  }

  // Sort chronologically
  entries.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    if (a.time && b.time) return a.time.localeCompare(b.time)
    return 0
  })

  // Group by year
  const byYear = new Map<string, TimelineEntry[]>()
  for (const entry of entries) {
    const year = entry.date.slice(0, 4)
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year)!.push(entry)
  }

  const years = Array.from(byYear.keys()).sort((a, b) => b.localeCompare(a)) // newest first

  const STATUS_DOT: Record<string, string> = {
    open: 'bg-blue-400',
    developing: 'bg-amber-400',
    resolved: 'bg-emerald-500',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <span className="text-slate-600">Timeline</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0D1F3C]">Global Timeline</h1>
        <p className="text-slate-500 text-sm mt-1">
          {entries.length} documented events across {factFiles.filter(f => !f.is_draft).length} fact files · chronological order
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          No timeline events yet. Add them to fact files via the admin panel.
        </div>
      ) : (
        <div className="space-y-10">
          {years.map(year => (
            <div key={year}>
              {/* Year anchor */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{year}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{byYear.get(year)!.length} events</span>
              </div>

              {/* Events in this year */}
              <ol className="relative border-l border-slate-200 space-y-6 ml-2">
                {byYear.get(year)!.map((entry, i) => (
                  <li key={`${entry.factFileSlug}-${entry.date}-${i}`} className="ml-5">
                    {/* Dot */}
                    <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${STATUS_DOT[entry.factFileStatus] ?? 'bg-slate-400'}`} />

                    <div className="flex items-start gap-3 flex-wrap">
                      <time className="text-xs font-mono text-slate-400 whitespace-nowrap pt-0.5 w-24 shrink-0">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                        {entry.time && ` · ${entry.time}`}
                      </time>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{entry.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{entry.description}</p>
                        <Link
                          href={`/fact/${entry.factFileSlug}?tab=timeline`}
                          className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-[#2A7DE1] hover:underline"
                        >
                          <span className="capitalize">{entry.category[0]}</span>
                          <span>·</span>
                          <span className="font-medium">{entry.factFileTitle}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
