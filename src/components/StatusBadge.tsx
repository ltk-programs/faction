import type { TopicStatus } from '@/types'

const CONFIG: Record<TopicStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  open:       { label: 'Open',       dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200' },
  developing: { label: 'Developing', dot: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-200' },
  resolved:   { label: 'Resolved',   dot: 'bg-slate-400',  bg: 'bg-slate-100', text: 'text-slate-700',  border: 'border-slate-300' },
}

export function StatusBadge({ status }: { status: TopicStatus }) {
  const c = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
      role="status"
      aria-label={`Status: ${c.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
      {c.label}
    </span>
  )
}
