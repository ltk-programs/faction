import type { SourceTier } from '@/types'

interface Props {
  tier: SourceTier
  /** If false, suppress the hover tooltip. Default: true */
  showTooltip?: boolean
}

const TIER_INFO = {
  1: {
    badge: 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200',
    icon: '✓',
    label: 'Tier 1',
    heading: 'Tier 1 — Verified Official Source',
    body: 'Published directly by a government body, court, peer-reviewed journal, or institutional authority. The issuing organisation is identified and the document is publicly archived. FACTION editors verify each source before it is published.',
    examples: 'Court filings · Government reports · Peer-reviewed studies · Official testimony · Autopsy reports',
  },
  3: {
    badge: 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200',
    icon: '◐',
    label: 'Tier 3',
    heading: 'Tier 3 — Community-Verified Source',
    body: 'Credible but not issued by an official authority — citizen footage, official social media posts, or documents released but not yet independently verified. Clearly labelled. Treated with appropriate caution.',
    examples: 'Body-cam footage (released) · Official social posts · Released documents (unverified)',
  },
} as const

export function TierBadge({ tier, showTooltip = true }: Props) {
  const info = TIER_INFO[tier]

  if (!showTooltip) {
    return (
      <span className={info.badge}>
        {info.icon} {info.label}
      </span>
    )
  }

  return (
    <span className="relative group inline-flex">
      {/* Badge trigger */}
      <span className={`${info.badge} cursor-help`}>
        {info.icon} {info.label}
      </span>

      {/* Tooltip panel */}
      <span
        role="tooltip"
        className="
          pointer-events-none absolute z-50 bottom-full left-0 mb-2
          w-72 rounded-xl border border-slate-200 bg-white shadow-lg
          p-3 text-left
          opacity-0 scale-95 translate-y-1
          group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
          transition-all duration-150 ease-out
        "
      >
        <p className="text-xs font-bold text-slate-800 mb-1">{info.heading}</p>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">{info.body}</p>
        <p className="text-[11px] text-slate-400">
          <span className="font-semibold text-slate-500">Examples: </span>
          {info.examples}
        </p>
        <a
          href="/methodology#source-tiers"
          className="pointer-events-auto mt-2 block text-[11px] text-[#2A7DE1] hover:underline"
        >
          Read full methodology →
        </a>
        {/* Caret */}
        <span className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-slate-200" />
        <span className="absolute top-full left-4 border-4 border-transparent border-t-white" />
      </span>
    </span>
  )
}
