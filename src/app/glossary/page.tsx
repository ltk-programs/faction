import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Glossary',
  description: 'Definitions for every term used on FACTION — evidence tiers, source types, status labels, and platform concepts.',
}

interface Term {
  id: string
  term: string
  definition: string
  related?: string[]
  learnMore?: { label: string; href: string }
}

const TERMS: Term[] = [
  {
    id: 'fact-file',
    term: 'Fact File',
    definition: 'The core document type on FACTION. Each Fact File covers one topic, case, or event and contains an evidence index, timeline, contested claims, and data panels. Think of it as a dossier built entirely from primary sources.',
    related: ['evidence', 'timeline', 'contested-claim'],
    learnMore: { label: 'Browse Fact Files', href: '/' },
  },
  {
    id: 'tier-1',
    term: 'Tier 1 Source',
    definition: 'The highest evidence tier. A Tier 1 source is an original document from the issuing authority — no intermediary reporting. Examples: government reports, court filings, peer-reviewed studies, official testimony, autopsy reports, legislative records. Displayed with a blue TIER 1 badge.',
    related: ['tier-3', 'issuing-authority', 'verified'],
    learnMore: { label: 'Source methodology', href: '/methodology' },
  },
  {
    id: 'tier-3',
    term: 'Tier 3 Source',
    definition: 'Community-verified sources where the content appears authentic but the chain of custody is less certain. Examples: citizen footage, official social media posts, documents released informally. Always clearly labelled with an amber TIER 3 badge. There is intentionally no Tier 2.',
    related: ['tier-1', 'verified'],
    learnMore: { label: 'Source methodology', href: '/methodology' },
  },
  {
    id: 'evidence',
    term: 'Evidence',
    definition: 'An atomic unit in FACTION. Each evidence item is a single primary source with its own tier, source type, issuing authority, date, description, and direct URL to the original document. Evidence items are numbered within a Fact File and can be deep-linked.',
    related: ['tier-1', 'tier-3', 'issuing-authority'],
  },
  {
    id: 'issuing-authority',
    term: 'Issuing Authority',
    definition: 'The institution, agency, or court that produced or released a source document. Examples: "U.S. House Select Committee", "Hennepin County Medical Examiner", "Federal Aviation Administration". FACTION records this for every evidence item to establish provenance.',
    related: ['tier-1', 'evidence', 'verified'],
  },
  {
    id: 'contested-claim',
    term: 'Contested Claim',
    definition: 'A documented factual dispute where two or more primary sources directly contradict each other on a specific point. FACTION does not manufacture contested claims to create false balance — they appear only when the documentary record itself is in conflict. Marked with a ⚡ icon.',
    related: ['evidence', 'confidence-score'],
    learnMore: { label: 'Guide: Contested Claims', href: '/guide#contested-claims' },
  },
  {
    id: 'confidence-score',
    term: 'Confidence Score',
    definition: 'A machine-computed score (0–100) indicating how well-documented a topic is. Factors: Tier 1 ratio (weighted most heavily), total evidence volume, verification ratio, resolved status (+bonus), and contested claim count (-penalty). A low score means the record is thin, not that the topic is false.',
    related: ['tier-1', 'verified', 'status'],
    learnMore: { label: 'Guide: Confidence Score', href: '/guide#confidence-score' },
  },
  {
    id: 'status',
    term: 'Status',
    definition: 'Every Fact File has one of three statuses: Open (investigation is active; key facts may still emerge), Developing (major facts are established but the record is incomplete), or Resolved (the primary source record is definitively established).',
    related: ['confidence-score', 'reopen-threshold'],
  },
  {
    id: 'reopen-threshold',
    term: 'Reopen Threshold',
    definition: 'A statement at the bottom of every Fact File defining what type of new primary evidence would cause a Resolved topic to be re-opened. This prevents FACTION from treating resolved records as permanently closed when genuine new information emerges.',
    related: ['status', 'fact-file'],
  },
  {
    id: 'timeline',
    term: 'Timeline',
    definition: 'A chronological sequence of documented events within a Fact File. Each event has a date, description, and references one or more evidence items. Timeline events are independently sourced — if an event cannot be traced to a primary source, it does not appear.',
    related: ['evidence', 'fact-file'],
  },
  {
    id: 'data-panel',
    term: 'Data Panel',
    definition: 'A chart or dataset embedded within a Fact File. Data panels are built from official datasets (government statistics, court records, official reports) and always include a full methodology note explaining what data was used, what period it covers, and what it does NOT show.',
    related: ['evidence', 'fact-file'],
  },
  {
    id: 'priority-vote',
    term: 'Priority Vote',
    definition: 'A community signal sent to the FACTION editorial team requesting deeper investigation of a topic. One vote per person per topic per day. Higher-vote topics surface to the top of the priority queue. Votes indicate importance, not agreement or disagreement.',
    related: ['fact-file'],
    learnMore: { label: 'Guide: Voting', href: '/guide#voting' },
  },
  {
    id: 'verified',
    term: 'Verified',
    definition: 'An evidence item marked Verified has been confirmed by the FACTION editorial team as authentic — the URL leads to an unaltered document from the stated issuing authority. Unverified sources show a ⚠ Pending review badge and may still be genuine, but have not been independently confirmed.',
    related: ['tier-1', 'evidence'],
  },
  {
    id: 'changelog',
    term: 'Changelog',
    definition: 'A transparent edit history at the bottom of each Fact File. Every change to a Fact File — corrections, additions, updates, status changes — is logged here with a date and description. Part of FACTION\'s commitment to transparency.',
    related: ['fact-file', 'transparency'],
    learnMore: { label: 'Transparency', href: '/transparency' },
  },
  {
    id: 'transparency',
    term: 'Transparency',
    definition: 'FACTION discloses funding sources, editorial conflicts of interest, known limitations, and corrections policy. Individual Fact Files show a conflict of interest disclosure when relevant. All changes are logged in changelogs.',
    learnMore: { label: 'Transparency page', href: '/transparency' },
  },
  {
    id: 'embed',
    term: 'Embed Widget',
    definition: 'A compact iframe version of any Fact File that can be embedded into external websites, newsletters, or applications. Access via the "Embed" section at the bottom of any Fact File page.',
    related: ['fact-file'],
  },
  {
    id: 'source-type',
    term: 'Source Type',
    definition: 'The document category of an evidence item. Types include: government document, court filing, body cam footage, official statement, peer-reviewed study, statistical dataset, financial filing, official testimony, surveillance footage, press conference, legislative record, autopsy report, investigation report, and other Tier 3.',
    related: ['tier-1', 'tier-3', 'evidence'],
    learnMore: { label: 'Methodology', href: '/methodology' },
  },
  {
    id: 'archive-url',
    term: 'Archive URL',
    definition: 'A Wayback Machine backup URL stored alongside the original source URL. FACTION automatically archives evidence sources to protect against link rot. If the original URL goes dead, the archive URL provides a permanent copy.',
    related: ['evidence'],
  },
  {
    id: 'draft',
    term: 'Draft',
    definition: 'A Fact File in draft status is not visible to the public. Drafts are used by the editorial team while building out a new topic. Once published, a fact file becomes publicly accessible at /fact/[slug].',
    related: ['fact-file'],
  },
]

// Group terms alphabetically
const grouped = TERMS.reduce<Record<string, Term[]>>((acc, term) => {
  const letter = term.term[0].toUpperCase()
  if (!acc[letter]) acc[letter] = []
  acc[letter].push(term)
  return acc
}, {})

const letters = Object.keys(grouped).sort()

export default function GlossaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-400">Glossary</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0D1F3C] dark:text-slate-100 tracking-tight mb-2">
          Glossary
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Every term used on FACTION, defined precisely. {TERMS.length} entries.
        </p>
      </div>

      {/* Alphabet jump nav */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
        {letters.map(letter => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="text-xs font-mono font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Terms */}
      <div className="space-y-10">
        {letters.map(letter => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-black text-slate-200 dark:text-slate-700 font-mono select-none">
                {letter}
              </span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-5">
              {grouped[letter].map(term => (
                <div
                  key={term.id}
                  id={term.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 scroll-mt-20"
                >
                  <h2 className="text-base font-bold text-[#0D1F3C] dark:text-slate-100 mb-2">
                    {term.term}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {term.definition}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {term.related && term.related.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-slate-400">See also:</span>
                        {term.related.map(r => {
                          const relatedTerm = TERMS.find(t => t.id === r)
                          return relatedTerm ? (
                            <a
                              key={r}
                              href={`#${r}`}
                              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#EAF1FB] dark:hover:bg-slate-600 hover:text-[#1A4A8A] transition-colors"
                            >
                              {relatedTerm.term}
                            </a>
                          ) : null
                        })}
                      </div>
                    )}
                    {term.learnMore && (
                      <Link
                        href={term.learnMore.href}
                        className="ml-auto text-xs text-[#2A7DE1] hover:underline shrink-0"
                      >
                        {term.learnMore.label} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600">
        Missing a term?{' '}
        <Link href="/submit?type=correction" className="text-[#2A7DE1] hover:underline">
          Submit a suggestion →
        </Link>
      </div>
    </div>
  )
}
