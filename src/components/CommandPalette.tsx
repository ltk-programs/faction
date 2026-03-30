'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from 'react'
import { useRouter } from 'next/navigation'
import type { FactFileSummary } from '@/types'
import { searchFactFiles, highlightMatches } from '@/lib/search'
import { StatusBadge } from './StatusBadge'

// ─── Context ─────────────────────────────────────────────────────────────────

interface PaletteContextValue {
  open: () => void
  close: () => void
}

const PaletteContext = createContext<PaletteContextValue>({
  open:  () => {},
  close: () => {},
})

export function useCommandPalette() {
  return useContext(PaletteContext)
}

// ─── Highlighted span ────────────────────────────────────────────────────────

function Hl({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => highlightMatches(text, query), [text, query])
  return (
    <>
      {parts.map((p, i) =>
        p.highlight
          ? <mark key={i} className="bg-[#DBEAFE] text-[#1A4A8A] rounded-sm not-italic">{p.text}</mark>
          : <span key={i}>{p.text}</span>
      )}
    </>
  )
}

// ─── Palette modal ───────────────────────────────────────────────────────────

const MAX_RESULTS = 7

function PaletteModal({
  factFiles,
  onClose,
}: {
  factFiles: FactFileSummary[]
  onClose: () => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const results = useMemo(
    () =>
      searchFactFiles(factFiles, {
        query,
        status: 'all',
        category: null,
        sort: query ? 'relevance' : 'votes',
      }).slice(0, MAX_RESULTS),
    [factFiles, query]
  )

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results.length])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const navigate = useCallback(
    (slug: string) => {
      onClose()
      router.push(`/fact/${slug}`)
    },
    [router, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex(i => Math.min(i + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[activeIndex]) navigate(results[activeIndex].ff.slug)
          break
        case 'Escape':
          onClose()
          break
        case 'Tab':
          // Navigate to /search with current query
          e.preventDefault()
          onClose()
          router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
          break
      }
    },
    [results, activeIndex, navigate, onClose, router, query]
  )

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(13,31,60,0.6)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <span className="text-slate-400 text-base select-none">⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search fact files…"
            className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none"
          />
          <kbd
            onClick={onClose}
            className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 font-mono cursor-pointer hover:bg-slate-50"
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul ref={listRef} className="py-1.5 max-h-96 overflow-y-auto">
            {results.map(({ ff }, idx) => (
              <li key={ff.slug}>
                <button
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    idx === activeIndex ? 'bg-[#EFF6FF]' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => navigate(ff.slug)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      <Hl text={ff.title} query={query} />
                    </div>
                    {ff.subtitle && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        <Hl text={ff.subtitle} query={query} />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ff.category.slice(0, 3).map(cat => (
                        <span key={cat} className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={ff.status} />
                  </div>
                  <span className="text-slate-300 shrink-0">→</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            {query ? `No results for "${query}"` : 'Start typing to search…'}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">tab</kbd> full search</span>
          </div>
          <button
            onClick={() => { onClose(); router.push('/search') }}
            className="hover:text-[#2A7DE1] transition-colors"
          >
            Browse all →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Provider (wraps the entire app in layout.tsx) ────────────────────────────

export function CommandPaletteProvider({
  children,
  factFiles,
}: {
  children: React.ReactNode
  factFiles: FactFileSummary[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  const open  = useCallback(() => setIsOpen(true),  [])
  const close = useCallback(() => setIsOpen(false), [])

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <PaletteContext.Provider value={{ open, close }}>
      {children}
      {isOpen && <PaletteModal factFiles={factFiles} onClose={close} />}
    </PaletteContext.Provider>
  )
}
