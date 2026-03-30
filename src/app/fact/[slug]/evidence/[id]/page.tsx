import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile, getAllSlugs } from '@/lib/content'
import { TierBadge } from '@/components/TierBadge'
import type { Metadata } from 'next'

const MEDIA_LABELS: Record<string, string> = {
  document: '📄 Document',
  video:    '🎥 Video',
  dataset:  '📊 Dataset',
  webpage:  '🌐 Webpage',
  audio:    '🔊 Audio',
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  federal_agency_report:   'Federal Agency Report',
  government_press_release:'Government Press Release',
  court_document:          'Court Document',
  legislative_report:      'Legislative Report',
  congressional_record:    'Congressional Record',
  federal_regulation:      'Federal Regulation',
  government_report:       'Government Report',
  academic_paper:          'Academic Paper',
  news_article:            'News Article',
  dataset:                 'Dataset',
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  const params: { slug: string; id: string }[] = []
  for (const slug of slugs) {
    const ff = await getFactFile(slug)
    if (ff) {
      for (const ev of ff.evidence) {
        params.push({ slug, id: ev.id })
      }
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}): Promise<Metadata> {
  const { slug, id } = await params
  const ff = await getFactFile(slug)
  const ev = ff?.evidence.find(e => e.id === id)
  if (!ff || !ev) return { title: 'Not Found' }
  return {
    title: `${ev.title} — ${ff.title}`,
    description: ev.description,
  }
}

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const evidenceIndex = ff.evidence.findIndex(e => e.id === id)
  if (evidenceIndex === -1) notFound()

  const ev = ff.evidence[evidenceIndex]
  const prevEv = evidenceIndex > 0 ? ff.evidence[evidenceIndex - 1] : null
  const nextEv = evidenceIndex < ff.evidence.length - 1 ? ff.evidence[evidenceIndex + 1] : null

  // Find timeline events that reference this evidence
  const relatedTimeline = ff.timeline.filter(t =>
    t.evidence_ids?.includes(id)
  )

  const isPDF = ev.url.toLowerCase().endsWith('.pdf') ||
    ev.media_type === 'document'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <Link href={`/fact/${slug}`} className="hover:text-[#2A7DE1]">{ff.title}</Link>
        <span>/</span>
        <Link href={`/fact/${slug}?tab=evidence`} className="hover:text-[#2A7DE1]">Evidence</Link>
        <span>/</span>
        <span className="text-slate-600 font-mono">{ev.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <TierBadge tier={ev.tier} />
              {ev.media_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {MEDIA_LABELS[ev.media_type] ?? ev.media_type}
                </span>
              )}
              {ev.verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  ✓ Verified
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-slate-900 leading-snug mb-3">
              {ev.title}
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed">
              {ev.description}
            </p>
          </div>

          {/* Primary link */}
          <a
            href={ev.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-[#2A7DE1] hover:bg-[#1a6dd1] text-white rounded-xl transition-colors group"
          >
            <span className="text-2xl">
              {ev.media_type === 'video' ? '▶' : ev.media_type === 'dataset' ? '📊' : '📄'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">
                {ev.media_type === 'video' ? 'Watch footage' :
                 ev.media_type === 'dataset' ? 'Access dataset' :
                 isPDF ? 'Open PDF document' : 'Visit source'}
              </div>
              <div className="text-xs text-blue-200 font-mono truncate mt-0.5">{ev.url}</div>
            </div>
            <span className="text-white/70 group-hover:text-white transition-colors">↗</span>
          </a>

          {/* PDF embed for document-type evidence */}
          {isPDF && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Document preview</span>
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2A7DE1] hover:underline"
                >
                  Open in new tab ↗
                </a>
              </div>
              <iframe
                src={`${ev.url}#toolbar=1&navpanes=0`}
                className="w-full h-[600px]"
                title={ev.title}
              />
            </div>
          )}

          {/* Related timeline events */}
          {relatedTimeline.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Referenced in timeline
              </h2>
              <div className="space-y-3">
                {relatedTimeline.map(t => (
                  <div key={t.id} className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#2A7DE1] mt-1.5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-mono mb-0.5">
                        {t.date}{t.time ? ` · ${t.time}` : ''}
                      </div>
                      <div className="text-sm font-medium text-slate-800">{t.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Metadata card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Source details
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Issuing authority</dt>
                <dd className="text-slate-800 font-medium">{ev.issuing_authority}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Document type</dt>
                <dd className="text-slate-800">
                  {SOURCE_TYPE_LABELS[ev.source_type] ?? ev.source_type}
                </dd>
              </div>
              {ev.date_issued && (
                <div>
                  <dt className="text-xs text-slate-400 mb-0.5">Date issued</dt>
                  <dd className="text-slate-800 font-mono text-xs">{ev.date_issued}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Evidence ID</dt>
                <dd className="text-slate-800 font-mono text-xs">{ff.slug}/{ev.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Added to FACTION</dt>
                <dd className="text-slate-800 font-mono text-xs">{ev.added_date}</dd>
              </div>
            </dl>
          </div>

          {/* Tier explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TierBadge tier={ev.tier} />
              <span className="text-xs font-semibold text-slate-700">
                {ev.tier === 1 ? 'Primary source' : 'Supporting source'}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {ev.tier === 1
                ? 'Original document from the issuing authority — the highest source tier. No intermediary reporting.'
                : 'Supporting context from a credible publication. Should be read alongside primary sources.'}
            </p>
          </div>

          {/* Navigation between evidence items */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Evidence index
            </h2>
            <div className="space-y-1.5">
              {prevEv && (
                <Link
                  href={`/fact/${slug}/evidence/${prevEv.id}`}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#2A7DE1] transition-colors p-1.5 rounded hover:bg-slate-50 group"
                >
                  <span className="text-slate-300 group-hover:text-[#2A7DE1]">←</span>
                  <span className="truncate">{prevEv.title}</span>
                </Link>
              )}
              <div className="px-1.5 py-1 text-xs font-medium text-slate-800 bg-[#2A7DE1]/5 rounded border border-[#2A7DE1]/20 truncate">
                {ev.title}
              </div>
              {nextEv && (
                <Link
                  href={`/fact/${slug}/evidence/${nextEv.id}`}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#2A7DE1] transition-colors p-1.5 rounded hover:bg-slate-50 group"
                >
                  <span className="truncate">{nextEv.title}</span>
                  <span className="text-slate-300 group-hover:text-[#2A7DE1] ml-auto shrink-0">→</span>
                </Link>
              )}
            </div>
            <Link
              href={`/fact/${slug}?tab=evidence`}
              className="block mt-3 text-center text-xs text-slate-400 hover:text-[#2A7DE1] transition-colors"
            >
              View all {ff.evidence.length} evidence items →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
