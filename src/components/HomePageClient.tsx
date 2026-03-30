'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { FactFileSummary, TopicStatus } from '@/types'
import type { SortMode } from '@/lib/search'
import { searchFactFiles, extractCategories, highlightMatches } from '@/lib/search'
import { StatusBadge } from './StatusBadge'

// ─── Highlighted text ─────────────────────────────────────────────────────────

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => highlightMatches(text, query), [text, query])
  return (
    <>
      {parts.map((p, i) =>
        p.highlight
          ? <mark key={i} className="bg-[#DBEAFE] text-[#1A4A8A] rounded-sm px-0.5 not-italic font-medium">{p.text}</mark>
          : <span key={i}>{p.text}</span>
      )}
    </>
  )
}

// ─── Priority bar ─────────────────────────────────────────────────────────────

function PriorityBar({ votes, max }: { votes: number; max: number }) {
  const pct = max > 0 ? Math.round((votes / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2A7DE1] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-500 w-8 text-right">{votes}</span>
    </div>
  )
}

// ─── Topic card ───────────────────────────────────────────────────────────────

function TopicCard({
  ff,
  maxVotes,
  query,
  activeCategory,
  onCategoryClick,
}: {
  ff: FactFileSummary
  maxVotes: number
  query: string
  activeCategory: string | null
  onCategoryClick: (cat: string) => void
}) {
  return (
    <Link
      href={`/fact/${ff.slug}`}
      className="block border border-slate-200 rounded-xl bg-white hover:border-[#2A7DE1] hover:shadow-sm transition-all p-5 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-slate-900 group-hover:text-[#1A4A8A] transition-colors leading-snug">
            <Highlighted text={ff.title} query={query} />
          </h2>
          {ff.subtitle && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">
              <Highlighted text={ff.subtitle} query={query} />
            </p>
          )}
        </div>
        <StatusBadge status={ff.status} />
      </div>

      {/* Summary snippet (only when searching) */}
      {query && ff.summary && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
          <Highlighted text={ff.summary} query={query} />
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {ff.category.map(cat => (
          <button
            key={cat}
            onClick={e => { e.preventDefault(); e.stopPropagation(); onCategoryClick(cat) }}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              activeCategory === cat
                ? 'bg-[#2A7DE1] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-[#DBEAFE] hover:text-[#1A4A8A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <PriorityBar votes={ff.priority_votes} max={maxVotes} />

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        <span>{ff.evidence_count} source{ff.evidence_count !== 1 ? 's' : ''}</span>
        {ff.has_contested_claims && <span>⚡ Contested</span>}
        {ff.has_data_panels && <span>📊 Data</span>}
        <span className="ml-auto">
          Updated {new Date(ff.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </Link>
  )
}

// ─── Sort pill ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'votes',     label: 'Votes'     },
  { value: 'recent',    label: 'Recent'    },
  { value: 'alpha',     label: 'A–Z'       },
]

const STATUS_OPTIONS: { value: TopicStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'All'        },
  { value: 'open',       label: 'Open'       },
  { value: 'developing', label: 'Developing' },
  { value: 'resolved',   label: 'Resolved'   },
]

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  factFiles: FactFileSummary[]
  /** When true, shows the standalone search page layout (no hero callouts) */
  standalone?: boolean
}

export function HomePageClient({ factFiles, standalone = false }: Props) {
  const [query, setQuery]           = useState('')
  const [statusFilter, setStatus]   = useState<TopicStatus | 'all'>('all')
  const [activeCategory, setCategory] = useState<string | null>(null)
  const [sort, setSort]             = useState<SortMode>('votes')

  const allCategories = useMemo(() => extractCategories(factFiles), [factFiles])

  // When user clicks a category pill on a card, toggle it
  const handleCategoryClick = useCallback((cat: string) => {
    setCategory(prev => prev === cat ? null : cat)
  }, [])

  const results = useMemo(
    () => searchFactFiles(factFiles, { query, status: statusFilter, category: activeCategory, sort }),
    [factFiles, query, statusFilter, activeCategory, sort]
  )

  const maxVotes = useMemo(
    () => Math.max(...factFiles.map(f => f.priority_votes), 1),
    [factFiles]
  )

  const isFiltered = query !== '' || statusFilter !== 'all' || activeCategory !== null

  const clearAll = () => {
    setQuery('')
    setStatus('all')
    setCategory(null)
    setSort('votes')
  }

  return (
    <>
      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div className="relative mb-3">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none select-none">
          ⌕
        </span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); if (sort === 'votes' && e.target.value) setSort('relevance') }}
          placeholder={standalone ? 'Search all fact files…' : 'Search topics, categories, summaries…'}
          className="w-full pl-9 pr-16 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2A7DE1] focus:border-transparent placeholder:text-slate-400 shadow-sm"
          autoFocus={standalone}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          )}
          <kbd className="hidden sm:inline text-xs text-slate-300 border border-slate-200 rounded px-1 py-0.5 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Status + Sort filters ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === opt.value
                  ? 'bg-[#2A7DE1] text-white border-[#2A7DE1]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#2A7DE1] hover:text-[#2A7DE1]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Sort pills */}
        <div className="flex gap-1 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                sort === opt.value
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category chips ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              activeCategory === cat
                ? 'bg-[#0D1F3C] text-white border-[#0D1F3C]'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
        {activeCategory && (
          <button
            onClick={() => setCategory(null)}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            × clear
          </button>
        )}
      </div>

      {/* ── Results meta ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400">
          {isFiltered
            ? `${results.length} of ${factFiles.length} topic${factFiles.length !== 1 ? 's' : ''}`
            : `${factFiles.length} active topic${factFiles.length !== 1 ? 's' : ''} · sorted by ${sort}`}
          {activeCategory && <span className="ml-1">in <span className="font-medium text-slate-600">{activeCategory}</span></span>}
        </p>
        <div className="flex items-center gap-2">
          {isFiltered && (
            <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 hover:underline">
              Clear all
            </button>
          )}
          {!standalone && (
            <Link
              href="/submit"
              className="text-xs px-3 py-1.5 rounded border border-[#2A7DE1] text-[#2A7DE1] hover:bg-[#2A7DE1] hover:text-white transition-colors"
            >
              + Suggest topic
            </Link>
          )}
        </div>
      </div>

      {/* ── Results grid ───────────────────────────────────────────────────── */}
      {results.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm mb-1">No topics match your search.</p>
          {isFiltered && (
            <button onClick={clearAll} className="text-sm text-[#2A7DE1] hover:underline mt-1">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map(({ ff }) => (
            <TopicCard
              key={ff.slug}
              ff={ff}
              maxVotes={maxVotes}
              query={query}
              activeCategory={activeCategory}
              onCategoryClick={handleCategoryClick}
            />
          ))}
        </div>
      )}
    </>
  )
}
