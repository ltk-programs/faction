/**
 * FACTION — Lightweight weighted search engine
 *
 * No external dependencies. Scores FactFileSummary objects against a
 * query string using tokenised, weighted field matching.
 *
 * Field weights:
 *   title        → 10   (most important — matches here rank highest)
 *   subtitle     → 6
 *   category     → 4    (category pill clicks also use this)
 *   summary      → 3
 *   status       → 2    (lets you type "open" or "resolved")
 *
 * A result is returned only if ALL query tokens match at least one field.
 * This prevents noise from partial-query results.
 */

import type { FactFileSummary, TopicStatus } from '@/types'

export type SortMode = 'relevance' | 'votes' | 'recent' | 'alpha'

export interface SearchOptions {
  query: string
  status: TopicStatus | 'all'
  category: string | null   // null = all categories
  sort: SortMode
}

// ─── Tokenise ─────────────────────────────────────────────────────────────────

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0)
}

// ─── Score a single fact file against a set of tokens ────────────────────────

function scoreFile(ff: FactFileSummary, tokens: string[]): number {
  if (tokens.length === 0) return 1  // blank query → everything matches equally

  const fields = [
    { text: ff.title.toLowerCase(),                          weight: 10 },
    { text: (ff.subtitle ?? '').toLowerCase(),               weight: 6  },
    { text: ff.category.join(' ').toLowerCase(),             weight: 4  },
    { text: ff.summary.toLowerCase(),                        weight: 3  },
    { text: ff.status.toLowerCase(),                         weight: 2  },
  ]

  let totalScore = 0

  for (const token of tokens) {
    let tokenScore = 0

    for (const field of fields) {
      if (!field.text) continue
      if (field.text.includes(token)) {
        tokenScore += field.weight
        // Bonus: title starts with this token (e.g. searching "flint")
        if (field.weight === 10 && field.text.startsWith(token)) {
          tokenScore += 5
        }
        // Bonus: exact word match (not just substring)
        const wordBoundary = new RegExp(`\\b${token}\\b`)
        if (wordBoundary.test(field.text)) {
          tokenScore += Math.floor(field.weight / 2)
        }
      }
    }

    if (tokenScore === 0) return 0  // ALL tokens must match
    totalScore += tokenScore
  }

  return totalScore
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SearchResult {
  ff: FactFileSummary
  score: number
}

export function searchFactFiles(
  files: FactFileSummary[],
  options: SearchOptions,
): SearchResult[] {
  const tokens = tokenise(options.query)

  const results: SearchResult[] = files
    .filter(ff => {
      // Status filter
      if (options.status !== 'all' && ff.status !== options.status) return false
      // Category filter
      if (options.category) {
        const cat = options.category.toLowerCase()
        if (!ff.category.some(c => c.toLowerCase() === cat)) return false
      }
      return true
    })
    .map(ff => ({ ff, score: scoreFile(ff, tokens) }))
    .filter(r => r.score > 0)

  // Sort
  results.sort((a, b) => {
    switch (options.sort) {
      case 'relevance':
        if (tokens.length === 0) return b.ff.priority_votes - a.ff.priority_votes
        return b.score - a.score
      case 'votes':
        return b.ff.priority_votes - a.ff.priority_votes
      case 'recent':
        return new Date(b.ff.last_updated).getTime() - new Date(a.ff.last_updated).getTime()
      case 'alpha':
        return a.ff.title.localeCompare(b.ff.title)
    }
  })

  return results
}

// ─── Collect all unique categories from a set of files ───────────────────────

export function extractCategories(files: FactFileSummary[]): string[] {
  const set = new Set<string>()
  for (const ff of files) {
    for (const cat of ff.category) {
      set.add(cat)
    }
  }
  return Array.from(set).sort()
}

// ─── Simple highlight helper: wrap matched tokens in <mark> ──────────────────
// Returns plain string with ==marked== delimiters (safe for React dangerouslySetInnerHTML
// or manual splitting). The caller decides how to render them.

export function highlightMatches(text: string, query: string): Array<{ text: string; highlight: boolean }> {
  if (!query.trim()) return [{ text, highlight: false }]

  const tokens = tokenise(query)
  if (tokens.length === 0) return [{ text, highlight: false }]

  // Build a single alternation regex from all tokens
  const pattern = tokens
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))  // escape regex chars
    .join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')

  const parts: Array<{ text: string; highlight: boolean }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false })
    }
    parts.push({ text: match[0], highlight: true })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false })
  }

  return parts
}
