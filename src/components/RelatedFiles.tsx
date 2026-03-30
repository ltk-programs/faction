import Link from 'next/link'
import type { RelatedFile } from '@/lib/related'
import { StatusBadge } from './StatusBadge'

interface Props {
  related: RelatedFile[]
}

export function RelatedFiles({ related }: Props) {
  if (related.length === 0) return null

  return (
    <div className="mt-6">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        Related fact files
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {related.map(r => (
          <Link
            key={r.slug}
            href={`/fact/${r.slug}`}
            className="group block border border-slate-200 rounded-xl p-4 bg-white hover:border-[#2A7DE1] hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-slate-800 group-hover:text-[#1A4A8A] transition-colors leading-snug line-clamp-2">
                {r.title}
              </h3>
              <div className="shrink-0 mt-0.5">
                <StatusBadge status={r.status as 'open' | 'developing' | 'resolved'} />
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
              {r.summary}
            </p>
            <div className="flex flex-wrap gap-1">
              {r.category.slice(0, 2).map(cat => (
                <span key={cat} className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {cat}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
