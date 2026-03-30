import type { ChangelogEntry, ChangelogEntryType } from '@/types'

const TYPE_CONFIG: Record<ChangelogEntryType, {
  label: string
  dot: string
  badge: string
}> = {
  correction:      { label: 'Correction',    dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200' },
  addition:        { label: 'Addition',      dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  update:          { label: 'Update',        dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  'status-change': { label: 'Status change', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
}

interface Props {
  entries: ChangelogEntry[]
}

export function FactChangelog({ entries }: Props) {
  if (entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const corrections = sorted.filter(e => e.type === 'correction')
  const hasCorrectionToday = corrections.some(
    e => e.date === new Date().toISOString().slice(0, 10)
  )

  return (
    <div className="mt-6 border border-slate-200 rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Transparency Log
          </span>
          {hasCorrectionToday && (
            <span className="text-[10px] px-2 py-0.5 rounded border bg-red-50 text-red-600 border-red-200 font-bold uppercase tracking-wide">
              Correction issued today
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 font-mono">{entries.length} entr{entries.length === 1 ? 'y' : 'ies'}</span>
      </div>

      {/* Mission note */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-xs text-slate-500 leading-relaxed">
          Every change to this fact file is logged here — additions, corrections, status changes, and updates.
          This record is permanent and uneditable. FACTION&apos;s editorial policy requires a log entry for every substantive change.
        </p>
      </div>

      {/* Timeline entries */}
      <div className="px-5 py-4">
        <ol className="relative border-l border-slate-200 space-y-0">
          {sorted.map((entry, i) => {
            const cfg = TYPE_CONFIG[entry.type]
            const isLast = i === sorted.length - 1
            return (
              <li key={entry.id} className={`ml-4 ${isLast ? 'pb-0' : 'pb-5'}`}>
                {/* Dot on the line */}
                <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${cfg.dot}`} />

                <div className="flex items-start gap-3 flex-wrap">
                  <time className="text-xs text-slate-400 font-mono whitespace-nowrap pt-0.5 w-[90px] shrink-0">
                    {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </time>
                  <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold shrink-0 mt-0.5 uppercase tracking-wide ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1 min-w-0">
                    {entry.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-xs text-slate-400">
          All changes reviewed by the FACTION editorial team before publication.
          To flag an error,{' '}
          <a href="/submit?type=correction" className="text-[#2A7DE1] hover:underline">
            submit a correction
          </a>.
        </p>
      </div>
    </div>
  )
}
