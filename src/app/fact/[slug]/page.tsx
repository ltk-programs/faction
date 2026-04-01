import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile, getAllSlugs, getAllFactFilesRaw, getAllFactFiles, getLinkCheckResults } from '@/lib/content'
import { getRelatedFiles } from '@/lib/related'
import { StatusBadge } from '@/components/StatusBadge'
import { TierBadge } from '@/components/TierBadge'
import { EvidenceCard } from '@/components/EvidenceCard'
import { FactFileTimeline } from '@/components/FactFileTimeline'
import { ContestedClaims } from '@/components/ContestedClaims'
import { DataPanelView } from '@/components/DataPanelChart'
import { VoteButton } from '@/components/VoteButton'
import { RelatedFiles } from '@/components/RelatedFiles'
import { FactChangelog } from '@/components/FactChangelog'
import { ViewTracker } from '@/components/ViewTracker'
import { SubscribeForm } from '@/components/SubscribeForm'

export async function generateStaticParams() {
  // Only pre-render published (non-draft) fact files — draft slugs return notFound() anyway
  return (await getAllFactFiles()).map(ff => ({ slug: ff.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ff = await getFactFile(slug)
  if (!ff) return { title: 'Not Found' }

  const description = ff.summary.slice(0, 155)
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const pageUrl = `${BASE_URL}/fact/${slug}`

  return {
    title: ff.title,
    description,
    openGraph: {
      type: 'article',
      title: ff.title,
      description,
      url: pageUrl,
      siteName: 'FACTION',
      publishedTime: ff.verdict_date ?? ff.last_updated,
      modifiedTime: ff.last_updated,
      tags: [ff.category, ff.status],
    },
    twitter: {
      card: 'summary_large_image',
      title: ff.title,
      description,
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

// Tab label config
const TABS = [
  { id: 'evidence',  label: 'Evidence Index' },
  { id: 'timeline',  label: 'Timeline' },
  { id: 'contested', label: 'Contested Claims' },
  { id: 'data',      label: 'Data Panels' },
]

export default async function FactFilePage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string; preview?: string }>
}) {
  const { slug } = await params
  const resolvedSearch = await searchParams
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  // Block public access to drafts (allow with ?preview=true from admin)
  if (ff.is_draft && resolvedSearch.preview !== 'true') notFound()

  const activeTab = resolvedSearch.tab || 'evidence'

  const tier1Count = ff.evidence.filter(e => e.tier === 1).length
  const tier3Count = ff.evidence.filter(e => e.tier === 3).length

  // Build a Set of evidence IDs that failed the last link health check for this slug
  const linkSnapshot = await getLinkCheckResults()
  const deadEvidenceIds = new Set<string>(
    (linkSnapshot?.results ?? [])
      .filter(r => r.slug === slug && !r.ok)
      .map(r => r.evidenceId)
  )

  // Related files (auto-computed or manually curated via related_slugs)
  const allRaw = await getAllFactFilesRaw()
  const related = getRelatedFiles(ff, allRaw, 3)

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://faction.news'

  // JSON-LD structured data — Article + ItemList of evidence
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${BASE_URL}/fact/${slug}#article`,
        headline: ff.title,
        description: ff.summary.slice(0, 200),
        url: `${BASE_URL}/fact/${slug}`,
        datePublished: ff.created_date,
        dateModified: ff.last_updated,
        publisher: {
          '@type': 'Organization',
          name: 'FACTION',
          url: BASE_URL,
        },
        about: ff.category.map(cat => ({ '@type': 'Thing', name: cat })),
        keywords: ff.category.join(', '),
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE_URL}/fact/${slug}#evidence`,
        name: `Primary sources — ${ff.title}`,
        numberOfItems: ff.evidence.length,
        itemListElement: ff.evidence.map((ev, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: ev.title,
          url: ev.url,
          description: ev.description,
        })),
      },
    ],
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <ViewTracker slug={slug} />
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Draft banner */}
      {ff.is_draft && (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-yellow-600 font-bold text-sm">⚠ DRAFT</span>
          <p className="text-sm text-yellow-700">
            This fact file is in draft mode and is not visible to the public.
            Preview URL: <code className="font-mono text-xs">/fact/{ff.slug}?preview=true</code>
          </p>
          <Link href={`/admin/${ff.slug}`} className="ml-auto text-xs text-yellow-700 underline">
            Edit in Admin
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <span className="text-slate-600">{ff.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <StatusBadge status={ff.status} />
              {ff.category.map(cat => (
                <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{cat}</span>
              ))}
            </div>
            <h1 className="text-2xl font-black text-[#0D1F3C] leading-tight">{ff.title}</h1>
            {ff.subtitle && <p className="text-slate-500 mt-1">{ff.subtitle}</p>}
          </div>

          <VoteButton slug={ff.slug} initialVotes={ff.priority_votes} />
        </div>

        {/* Meta row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
          <span>Created {new Date(ff.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <span>Updated {new Date(ff.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <span>{ff.evidence.length} sources ({tier1Count} Tier 1, {tier3Count} Tier 3)</span>
          <span>·</span>
          <span>{ff.timeline.length} timeline events</span>
          {ff.verdict_date && (
            <>
              <span>·</span>
              <span>Key verdict: {new Date(ff.verdict_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-3">
            <Link href={`/fact/${ff.slug}/print`} target="_blank" className="text-slate-400 hover:text-slate-600 hover:underline">
              🖨 Export PDF
            </Link>
            <Link href={`/admin/${ff.slug}`} className="text-[#2A7DE1] hover:underline">
              Edit in Admin →
            </Link>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#EAF1FB] border border-[#C5D8F5] rounded-xl p-5 mb-6">
        <div className="text-xs font-bold text-[#1A4A8A] uppercase tracking-wide mb-2">Summary</div>
        <p className="text-sm text-slate-700 leading-relaxed">{ff.summary}</p>
      </div>

      {/* Situation Context */}
      {ff.situation_context && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Situation Context</div>
          <p className="text-sm text-slate-600 leading-relaxed">{ff.situation_context}</p>
        </div>
      )}

      {/* Resolution note (if resolved) */}
      {ff.status === 'resolved' && ff.resolution_note && (
        <div className="bg-slate-800 text-white rounded-xl p-5 mb-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">● Resolved</div>
          <p className="text-sm leading-relaxed">{ff.resolution_note}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(tab => {
            const count =
              tab.id === 'evidence'  ? ff.evidence.length :
              tab.id === 'timeline'  ? ff.timeline.length :
              tab.id === 'contested' ? ff.contested_claims.length :
              tab.id === 'data'      ? ff.data_panels.length : 0

            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={`/fact/${ff.slug}?tab=${tab.id}`}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#2A7DE1] text-[#1A4A8A]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#EAF1FB] text-[#1A4A8A]' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'evidence' && (
            <div>
              {ff.evidence.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No evidence added yet.</p>
              ) : (
                <div>
                  {/* Tier summary */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <TierBadge tier={1} /> <span>{tier1Count} verified official source{tier1Count !== 1 ? 's' : ''}</span>
                    </div>
                    {tier3Count > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <TierBadge tier={3} /> <span>{tier3Count} community-verified source{tier3Count !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {ff.evidence.map((ev, i) => (
                      <EvidenceCard key={ev.id} evidence={ev} index={i + 1} verdictDate={ff.verdict_date ?? undefined} slug={slug} linkDead={deadEvidenceIds.size > 0 ? deadEvidenceIds.has(ev.id) : null} factFileTitle={ff.title} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <FactFileTimeline events={ff.timeline} evidence={ff.evidence} slug={slug} />
          )}

          {activeTab === 'contested' && (
            <ContestedClaims claims={ff.contested_claims} evidence={ff.evidence} />
          )}

          {activeTab === 'data' && (
            <div>
              {ff.data_panels.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No data panels added yet.</p>
              ) : (
                <div className="space-y-6">
                  {ff.data_panels.map(panel => (
                    <DataPanelView key={panel.id} panel={panel} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reopen threshold */}
      <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-white">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
          Reopen threshold
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{ff.reopen_threshold}</p>
      </div>

      {/* Changelog */}
      {ff.changelog && ff.changelog.length > 0 && (
        <FactChangelog entries={ff.changelog} />
      )}

      {/* Subscribe */}
      <SubscribeForm slug={ff.slug} factFileTitle={ff.title} />

      {/* Related files */}
      <RelatedFiles related={related} />

      {/* Embed & RSS */}
      <details className="mt-4 border border-slate-200 rounded-xl bg-white group">
        <summary className="px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 list-none flex items-center gap-2">
          <span>↗</span> Embed this fact file or subscribe via RSS
        </summary>
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Embed code (copy this into your site or newsletter):</p>
            <code className="block text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 font-mono break-all select-all">
              {`<iframe src="${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://your-domain.com'}/embed/${ff.slug}" width="100%" height="160" frameborder="0" style="border-radius:12px"></iframe>`}
            </code>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
            >
              <span>◉</span> Subscribe to FACTION RSS
            </a>
            <a
              href={`/embed/${ff.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
            >
              Preview embed →
            </a>
          </div>
        </div>
      </details>

      {/* Contribute CTA */}
      <div className="mt-4 border border-dashed border-slate-300 rounded-xl p-5 bg-white flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700">Know a primary source we&apos;re missing?</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All submissions enter editorial review. Only verified primary sources are published.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/submit?type=new_evidence&slug=${ff.slug}`}
            className="text-xs px-3 py-2 rounded-lg bg-[#2A7DE1] text-white hover:bg-[#1A4A8A] transition-colors font-medium"
          >
            🔗 Suggest evidence
          </Link>
          <Link
            href={`/submit?type=correction&slug=${ff.slug}`}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors"
          >
            ⚠️ Flag correction
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}
