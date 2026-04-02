/**
 * Estimates reading time for a FACTION fact file.
 * Counts words in summary + situation_context + all evidence descriptions.
 * Average reading speed: 200 wpm (slightly below average to account for
 * technical/legal content that requires closer attention).
 */

import type { FactFile } from '@/types'

const WORDS_PER_MINUTE = 200

export function estimateReadingTime(ff: FactFile): { minutes: number; label: string } {
  const textBlocks = [
    ff.summary,
    ff.situation_context ?? '',
    ff.resolution_note ?? '',
    ...ff.evidence.map(e => e.description),
    ...ff.timeline.map(t => t.description),
    ...ff.contested_claims.flatMap(c => [c.context, c.side_a.position, c.side_b.position]),
  ]

  const totalWords = textBlocks
    .join(' ')
    .split(/\s+/)
    .filter(w => w.length > 0)
    .length

  const minutes = Math.max(1, Math.ceil(totalWords / WORDS_PER_MINUTE))

  return {
    minutes,
    label: minutes === 1 ? '~1 min read' : `~${minutes} min read`,
  }
}
