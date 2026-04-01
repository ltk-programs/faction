import type { FactFile } from '@/types'

/**
 * Computes a confidence score (0–100) based on:
 * - Tier 1 source ratio (weighted most heavily)
 * - Total evidence volume
 * - Whether claims are contested (penalty)
 * - Resolved status (bonus)
 * - Verified ratio
 */
function computeScore(ff: FactFile): { score: number; label: string; color: string; bar: string } {
  const total = ff.evidence.length
  if (total === 0) return { score: 0, label: 'No sources', color: 'text-slate-400', bar: 'bg-slate-200' }

  const tier1 = ff.evidence.filter(e => e.tier === 1).length
  const verified = ff.evidence.filter(e => e.verified).length
  const tier1Ratio = tier1 / total
  const verifiedRatio = verified / total

  // Base score: tier 1 ratio (0–60 pts)
  let score = tier1Ratio * 60

  // Volume bonus: up to 20 pts (maxes at 15 sources)
  score += Math.min(total / 15, 1) * 20

  // Verified bonus: up to 10 pts
  score += verifiedRatio * 10

  // Resolved bonus: 10 pts
  if (ff.status === 'resolved') score += 10

  // Contested penalty: -5 pts per contested claim (max -15)
  const contestedPenalty = Math.min(ff.contested_claims.length * 5, 15)
  score -= contestedPenalty

  score = Math.max(0, Math.min(100, Math.round(score)))

  let label: string
  let color: string
  let bar: string

  if (score >= 80) {
    label = 'High confidence'
    color = 'text-emerald-700'
    bar = 'bg-emerald-500'
  } else if (score >= 55) {
    label = 'Moderate confidence'
    color = 'text-blue-700'
    bar = 'bg-blue-500'
  } else if (score >= 30) {
    label = 'Developing record'
    color = 'text-amber-700'
    bar = 'bg-amber-500'
  } else {
    label = 'Limited sources'
    color = 'text-slate-500'
    bar = 'bg-slate-400'
  }

  return { score, label, color, bar }
}

interface Props {
  ff: FactFile
}

export function ConfidenceMeter({ ff }: Props) {
  const { score, label, color, bar } = computeScore(ff)
  const tier1 = ff.evidence.filter(e => e.tier === 1).length
  const verified = ff.evidence.filter(e => e.verified).length

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Evidence confidence
        </span>
        <span className={`text-xs font-semibold ${color}`}>
          {label} · {score}/100
        </span>
      </div>

      {/* Bar */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
        <span>{tier1}/{ff.evidence.length} Tier 1 sources</span>
        <span>·</span>
        <span>{verified}/{ff.evidence.length} verified</span>
        {ff.contested_claims.length > 0 && (
          <>
            <span>·</span>
            <span className="text-orange-500">⚡ {ff.contested_claims.length} contested claim{ff.contested_claims.length !== 1 ? 's' : ''}</span>
          </>
        )}
        {ff.status === 'resolved' && (
          <>
            <span>·</span>
            <span className="text-emerald-600">✓ Resolved</span>
          </>
        )}
      </div>
    </div>
  )
}
