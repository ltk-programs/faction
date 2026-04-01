import Link from 'next/link'
import type { Evidence, MediaType } from '@/types'
import { TierBadge } from './TierBadge'
import { SourceTypeLabel } from './SourceTypeLabel'
import { CiteButton } from './CiteButton'
import { DocumentPreview } from './DocumentPreview'
import { ShareEvidenceButton } from './ShareEvidenceButton'

interface Props {
  evidence: Evidence
  index: number
  verdictDate?: string  // ISO date of the key verdict — used for pre/post verdict labelling
  slug?: string         // fact file slug — enables deep-link to evidence detail page
  /** null/undefined = unchecked; true = link confirmed unreachable; false = link ok */
  linkDead?: boolean | null
  /** Fact file title — used to build citations */
  factFileTitle?: string
  /** Evidence IDs referenced in any contested claim on this fact file */
  contestedIds?: Set<string>
}

const MEDIA_ICONS: Record<MediaType, { icon: string; label: string; classes: string }> = {
  document: { icon: '📄', label: 'Document', classes: 'bg-slate-50 text-slate-600 border-slate-200' },
  video:    { icon: '🎥', label: 'Video',    classes: 'bg-rose-50 text-rose-600 border-rose-200' },
  dataset:  { icon: '📊', label: 'Dataset',  classes: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  webpage:  { icon: '🔗', label: 'Webpage',  classes: 'bg-teal-50 text-teal-600 border-teal-200' },
  audio:    { icon: '🎙', label: 'Audio',    classes: 'bg-orange-50 text-orange-600 border-orange-200' },
}

export function EvidenceCard({ evidence: e, index, verdictDate, slug, linkDead, factFileTitle = '', contestedIds }: Props) {
  const isContested = contestedIds?.has(e.id) ?? false
  // Pre/post verdict label
  let verdictLabel: { text: string; classes: string } | null = null
  if (verdictDate && e.date_issued) {
    const isBeforeVerdict = e.date_issued < verdictDate
    verdictLabel = isBeforeVerdict
      ? { text: '◀ Before verdict', classes: 'bg-blue-50 text-blue-600 border-blue-200' }
      : { text: '▶ After verdict', classes: 'bg-purple-50 text-purple-600 border-purple-200' }
  }

  const mediaInfo = e.media_type ? MEDIA_ICONS[e.media_type] : null

  return (
    <div
      id={`ev-${e.id}`}
      className={`border rounded-lg p-4 bg-white transition-all ${linkDead ? 'border-red-200 bg-red-50/30 hover:border-red-300' : 'border-slate-200 hover:border-blue-300'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-mono text-slate-400">#{String(index).padStart(2, '0')}</span>
            <TierBadge tier={e.tier} />
            <SourceTypeLabel type={e.source_type} />
            {mediaInfo && (
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${mediaInfo.classes}`}>
                {mediaInfo.icon} {mediaInfo.label}
              </span>
            )}
            {verdictLabel && (
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${verdictLabel.classes}`}>
                {verdictLabel.text}
              </span>
            )}
            {isContested && (
              <span className="text-xs px-2 py-0.5 rounded border font-medium bg-orange-50 text-orange-700 border-orange-200">
                ⚡ Contested
              </span>
            )}
            {!e.verified && (
              <span className="text-xs text-amber-600 font-medium">⚠ Pending editorial review</span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <a
              href={slug ? `/out/${slug}/${e.id}` : e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline block truncate flex-1"
            >
              {e.title} ↗
            </a>
            <div className="shrink-0 flex items-center gap-1.5">
              <ShareEvidenceButton evidenceId={e.id} />
              <CiteButton evidence={e} factFileTitle={factFileTitle} />
              {slug && (
                <Link
                  href={`/fact/${slug}/evidence/${e.id}`}
                  className="text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors whitespace-nowrap"
                >
                  Detail →
                </Link>
              )}
            </div>
          </div>

          {e.media_type === 'video' && (
            <p className="mt-1 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded px-2 py-1 inline-block">
              🎥 Video source — link opens the hosting page where footage is available
            </p>
          )}

          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span>{e.issuing_authority}</span>
            <span>·</span>
            <span>
              {new Date(e.date_issued + 'T12:00:00').toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            {verdictDate && (
              <>
                <span>·</span>
                <span className="text-slate-400">
                  Verdict: {new Date(verdictDate + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </>
            )}
          </div>

          {e.description && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{e.description}</p>
          )}

          {linkDead === true && (
            <div className="mt-2 flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
              <span className="text-red-700">
                <strong className="font-semibold">Link may be unavailable.</strong>{' '}
                Our last health check could not reach this URL.{' '}
                <a
                  href={e.archive_url ?? `https://web.archive.org/web/*/${e.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-900"
                >
                  View archived copy →
                </a>
              </span>
            </div>
          )}

          {e.archive_url && linkDead !== true && (
            <div className="mt-1.5">
              <a
                href={e.archive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
              >
                🗃 Archived copy
              </a>
            </div>
          )}

          <DocumentPreview
            url={e.url}
            archiveUrl={e.archive_url}
            mediaType={e.media_type}
            title={e.title}
          />
        </div>
      </div>
    </div>
  )
}
