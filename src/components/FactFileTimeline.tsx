'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { TimelineEvent, Evidence } from '@/types'

interface Props {
  events: TimelineEvent[]
  evidence: Evidence[]
  slug?: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function getYear(dateStr: string) {
  return dateStr.slice(0, 4)
}

// Group consecutive events that share the same date into clusters
function clusterEvents(events: TimelineEvent[]) {
  const clusters: TimelineEvent[][] = []
  for (const ev of events) {
    const last = clusters[clusters.length - 1]
    if (last && last[0].date === ev.date) {
      last.push(ev)
    } else {
      clusters.push([ev])
    }
  }
  return clusters
}

export function FactFileTimeline({ events, evidence, slug }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'vertical' | 'compact'>('vertical')

  if (events.length === 0) {
    return <p className="text-slate-400 text-sm italic">No timeline events added yet.</p>
  }

  const evidenceMap = Object.fromEntries(evidence.map(e => [e.id, e]))
  const clusters = clusterEvents(events)

  // Group clusters by year for the compact year-band view
  const byYear = clusters.reduce<Record<string, TimelineEvent[][]>>((acc, cluster) => {
    const year = getYear(cluster[0].date)
    if (!acc[year]) acc[year] = []
    acc[year].push(cluster)
    return acc
  }, {})

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      {/* View toggle + event count */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-slate-400">{events.length} events across {Object.keys(byYear).length} year{Object.keys(byYear).length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView('vertical')}
            className={`text-xs px-3 py-1 rounded-md transition-colors font-medium ${
              view === 'vertical' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Detailed
          </button>
          <button
            onClick={() => setView('compact')}
            className={`text-xs px-3 py-1 rounded-md transition-colors font-medium ${
              view === 'compact' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Compact
          </button>
        </div>
      </div>

      {view === 'vertical' ? (
        /* ── Detailed vertical timeline ── */
        <div className="relative">
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#2A7DE1] via-slate-200 to-slate-200" />

          <div className="space-y-0">
            {clusters.map((cluster, ci) => {
              const isMulti = cluster.length > 1
              const firstEvent = cluster[0]
              const isClusterExpanded = expanded.has(firstEvent.id)

              return (
                <div key={firstEvent.id} className="relative flex gap-5 pb-7 last:pb-0">
                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    {isMulti ? (
                      <button
                        onClick={() => toggleExpand(firstEvent.id)}
                        className="w-10 h-10 rounded-full bg-[#2A7DE1] text-white text-xs font-bold flex items-center justify-center shadow-sm hover:bg-[#1a6dd1] transition-colors border-2 border-white"
                        title={`${cluster.length} events on this date`}
                      >
                        {cluster.length}
                      </button>
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                        ci === 0 ? 'bg-[#2A7DE1]' : 'bg-white border-slate-200'
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${ci === 0 ? 'bg-white' : 'bg-[#2A7DE1]'}`} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1.5">
                    {/* Date */}
                    <time className="text-xs font-mono text-slate-400 mb-1.5 block">
                      {formatDate(firstEvent.date)}
                      {firstEvent.time && (
                        <span className="ml-2 text-[#2A7DE1] font-semibold">{firstEvent.time}</span>
                      )}
                    </time>

                    {/* Single event or collapsed cluster */}
                    <EventContent
                      event={firstEvent}
                      evidenceMap={evidenceMap}
                      slug={slug}
                    />

                    {/* Cluster overflow */}
                    {isMulti && (
                      <div className="mt-2">
                        {isClusterExpanded ? (
                          <div className="space-y-4 mt-3 pl-4 border-l-2 border-[#2A7DE1]/20">
                            {cluster.slice(1).map(ev => (
                              <EventContent key={ev.id} event={ev} evidenceMap={evidenceMap} slug={slug} />
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleExpand(firstEvent.id)}
                            className="text-xs text-[#2A7DE1] hover:underline mt-1"
                          >
                            + {cluster.length - 1} more event{cluster.length - 1 !== 1 ? 's' : ''} on this date →
                          </button>
                        )}
                        {isClusterExpanded && (
                          <button
                            onClick={() => toggleExpand(firstEvent.id)}
                            className="text-xs text-slate-400 hover:text-slate-600 mt-2 block"
                          >
                            ↑ Collapse
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── Compact year-band view ── */
        <div className="space-y-6">
          {Object.entries(byYear).map(([year, yearClusters]) => (
            <div key={year} className="flex gap-4">
              {/* Year label */}
              <div className="shrink-0 w-14 pt-1 text-right">
                <span className="text-xs font-black text-slate-300 tracking-wider">{year}</span>
              </div>

              {/* Events for this year */}
              <div className="flex-1 space-y-2 border-l-2 border-slate-100 pl-4">
                {yearClusters.map(cluster => (
                  <div key={cluster[0].id} className="relative">
                    <div className="absolute -left-[21px] top-2 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#2A7DE1]" />
                    {cluster.map((ev, i) => (
                      <div key={ev.id} className={`${i > 0 ? 'mt-1.5 pl-3 border-l border-slate-100' : ''}`}>
                        <div className="flex items-start gap-2">
                          <time className="text-xs font-mono text-slate-400 shrink-0 mt-0.5 w-16">
                            {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {ev.time && <span className="block text-[#2A7DE1]">{ev.time}</span>}
                          </time>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{ev.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{ev.description}</p>
                            {ev.evidence_ids.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ev.evidence_ids.map(eid => {
                                  const e = evidenceMap[eid]
                                  if (!e) return null
                                  return slug ? (
                                    <Link
                                      key={eid}
                                      href={`/fact/${slug}/evidence/${eid}`}
                                      className="text-xs text-[#2A7DE1] hover:underline"
                                    >
                                      [{e.id}]
                                    </Link>
                                  ) : (
                                    <a key={eid} href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2A7DE1] hover:underline">[{e.id}]</a>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EventContent({
  event,
  evidenceMap,
  slug,
}: {
  event: TimelineEvent
  evidenceMap: Record<string, Evidence>
  slug?: string
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800 leading-snug">{event.title}</h3>
      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{event.description}</p>

      {event.evidence_ids.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {event.evidence_ids.map(eid => {
            const ev = evidenceMap[eid]
            if (!ev) return null
            const label = ev.title.length > 45 ? ev.title.slice(0, 45) + '…' : ev.title
            return slug ? (
              <Link
                key={eid}
                href={`/fact/${slug}/evidence/${eid}`}
                className="inline-flex items-center gap-1 text-xs text-[#2A7DE1] hover:text-[#1a6dd1] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded hover:border-[#2A7DE1] transition-colors"
              >
                {label} →
              </Link>
            ) : (
              <a
                key={eid}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded hover:underline"
              >
                {label} ↗
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
