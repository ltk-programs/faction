import type { ContestedClaim, Evidence } from '@/types'

interface Props {
  claims: ContestedClaim[]
  evidence: Evidence[]
}

export function ContestedClaims({ claims, evidence }: Props) {
  if (claims.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700 font-medium">
          ✓ No genuinely contested factual claims identified in the primary source record.
        </p>
        <p className="text-xs text-green-600 mt-1">
          Interpretive disagreements exist but the underlying facts are not materially disputed by the primary sources.
        </p>
      </div>
    )
  }

  const evidenceMap = Object.fromEntries(evidence.map(e => [e.id, e]))

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        <strong>Note:</strong> Contested claims appear only where two or more primary sources directly contradict each other on a specific factual point. These are genuine evidentiary disputes, not interpretive disagreements.
      </div>

      {claims.map((claim, i) => (
        <div key={claim.id} className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Claim header */}
          <div className="bg-slate-800 text-white px-4 py-3">
            <div className="text-xs text-slate-400 mb-0.5">Contested Factual Question #{i + 1}</div>
            <p className="text-sm font-semibold">{claim.claim}</p>
            {claim.context && (
              <p className="text-xs text-slate-300 mt-1">{claim.context}</p>
            )}
          </div>

          {/* Two sides */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Side A */}
            <div className="p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Position A</div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{claim.side_a.position}</p>
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">Primary sources:</div>
                {claim.side_a.evidence_ids.map(eid => {
                  const ev = evidenceMap[eid]
                  if (!ev) return null
                  return (
                    <a key={eid} href={ev.url} target="_blank" rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline truncate"
                      aria-label={`${ev.title} (opens in new tab)`}>
                      ↗ {ev.title}
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Side B */}
            <div className="p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Position B</div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{claim.side_b.position}</p>
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">Primary sources:</div>
                {claim.side_b.evidence_ids.map(eid => {
                  const ev = evidenceMap[eid]
                  if (!ev) return null
                  return (
                    <a key={eid} href={ev.url} target="_blank" rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline truncate"
                      aria-label={`${ev.title} (opens in new tab)`}>
                      ↗ {ev.title}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
