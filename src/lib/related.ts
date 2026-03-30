/**
 * FACTION — Related fact file engine
 *
 * Computes a similarity score between two FactFiles using:
 *  - Shared categories          (weight: 5 per shared category)
 *  - Timeline date proximity    (weight: 2 per overlapping year)
 *  - Shared issuing authorities (weight: 3 per shared authority domain)
 *
 * Returns the top-N most similar slugs for a given file.
 * Used both at runtime (fact pages) and by the admin panel to suggest cross-links.
 */

import type { FactFile } from '@/types'

// ─── Domain helpers ───────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const u = new URL(url)
    // Normalise: strip www. and keep only registered domain (last two parts)
    const parts = u.hostname.replace(/^www\./, '').split('.')
    return parts.slice(-2).join('.')
  } catch {
    return ''
  }
}

function getYears(ff: FactFile): Set<number> {
  const years = new Set<number>()
  for (const ev of ff.timeline) {
    const y = parseInt(ev.date.slice(0, 4), 10)
    if (!isNaN(y)) years.add(y)
  }
  // Also include evidence dates
  for (const ev of ff.evidence) {
    const y = parseInt(ev.date_issued.slice(0, 4), 10)
    if (!isNaN(y)) years.add(y)
  }
  return years
}

function getDomains(ff: FactFile): Set<string> {
  const domains = new Set<string>()
  for (const ev of ff.evidence) {
    const d = extractDomain(ev.url)
    if (d) domains.add(d)
  }
  return domains
}

// ─── Score a pair ─────────────────────────────────────────────────────────────

function scorePair(a: FactFile, b: FactFile): number {
  let score = 0

  // 1. Shared categories
  const catA = new Set(a.category.map(c => c.toLowerCase()))
  for (const cat of b.category) {
    if (catA.has(cat.toLowerCase())) score += 5
  }

  // 2. Overlapping years in timeline / evidence
  const yearsA = getYears(a)
  const yearsB = getYears(b)
  for (const y of yearsB) {
    if (yearsA.has(y)) score += 2
  }

  // 3. Shared source domains (e.g. both cite justice.gov → indicates same institutions)
  const domsA = getDomains(a)
  const domsB = getDomains(b)
  for (const d of domsB) {
    if (d && domsA.has(d)) score += 3
  }

  return score
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RelatedFile {
  slug: string
  title: string
  status: string
  category: string[]
  summary: string
  score: number
}

/**
 * Given one fact file and all other files, return the top-N auto-suggested related files.
 * If `ff.related_slugs` is set, those are returned directly (manual override).
 */
export function getRelatedFiles(
  ff: FactFile,
  allFiles: FactFile[],
  topN = 3,
): RelatedFile[] {
  // Manual override — use curated list if present
  if (ff.related_slugs && ff.related_slugs.length > 0) {
    return ff.related_slugs
      .map(slug => allFiles.find(f => f.slug === slug))
      .filter((f): f is FactFile => f !== undefined)
      .map(f => ({
        slug: f.slug,
        title: f.title,
        status: f.status,
        category: f.category,
        summary: f.summary.slice(0, 150),
        score: 999, // manually curated — always shown
      }))
  }

  // Automatic scoring
  const others = allFiles.filter(f => f.slug !== ff.slug)
  const scored = others
    .map(other => ({
      slug: other.slug,
      title: other.title,
      status: other.status,
      category: other.category,
      summary: other.summary.slice(0, 150),
      score: scorePair(ff, other),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)

  return scored
}
