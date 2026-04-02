import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Use FACTION',
  description: 'A practical guide to reading, citing, and contributing to FACTION — the primary-source evidence platform.',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-xl font-black text-[#0D1F3C] dark:text-slate-100 mb-4 flex items-center gap-3">
        <span className="w-1 h-6 bg-[#2A7DE1] rounded-full inline-block shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function Callout({ type, children }: { type: 'note' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    note:    'bg-[#EAF1FB] dark:bg-slate-800 border-[#C5D8F5] dark:border-slate-700 text-[#1A4A8A] dark:text-blue-300',
    warning: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300',
    tip:     'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300',
  }
  const icons = { note: 'ℹ', warning: '⚠', tip: '✦' }
  return (
    <div className={`border rounded-xl px-4 py-3 flex gap-3 ${styles[type]}`}>
      <span className="shrink-0 font-bold">{icons[type]}</span>
      <div>{children}</div>
    </div>
  )
}

const TOC = [
  { id: 'what-is-faction',   label: 'What is FACTION?' },
  { id: 'reading-fact-files', label: 'Reading Fact Files' },
  { id: 'evidence-tiers',    label: 'Evidence Tiers Explained' },
  { id: 'confidence-score',  label: 'Confidence Score' },
  { id: 'contested-claims',  label: 'Contested Claims' },
  { id: 'voting',            label: 'Priority Voting' },
  { id: 'citing',            label: 'Citing FACTION Sources' },
  { id: 'submitting',        label: 'Submitting Tips' },
  { id: 'keyboard',          label: 'Keyboard Shortcuts' },
]

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#2A7DE1]">Topics</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-400">How to Use FACTION</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
        {/* Main content */}
        <article>
          <div className="mb-10">
            <h1 className="text-3xl font-black text-[#0D1F3C] dark:text-slate-100 tracking-tight mb-3">
              How to Use FACTION
            </h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              FACTION is a primary-source evidence platform. Every claim you read here traces directly to
              an official document, legal filing, or verified institutional source. This guide explains how
              to read, use, and contribute to the database.
            </p>
          </div>

          <Section id="what-is-faction" title="What is FACTION?">
            <p>
              FACTION is built on a single premise: most public debates are stuck because people are arguing
              from different facts. FACTION fixes the foundation — not the argument. We find, verify, and
              present primary source evidence so that when you read a FACTION fact file, you are looking
              at the same documents as everyone else.
            </p>
            <p>
              We do not editorialize, interpret, or take positions. FACTION presents. You decide.
            </p>
            <Callout type="note">
              FACTION is not a news site. We do not report on events — we document them with primary
              sources. A court filing is more reliable than a news article about that court filing.
            </Callout>
          </Section>

          <Section id="reading-fact-files" title="Reading Fact Files">
            <p>
              Each <strong>Fact File</strong> covers one topic, case, or event. It has four tabs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              {[
                { tab: 'Evidence Index', desc: 'All primary sources for this topic, each with tier, type, issuing authority, and a link to the original document.' },
                { tab: 'Timeline', desc: 'Documented events in chronological order, each traceable to a specific evidence item.' },
                { tab: 'Contested Claims', desc: 'Points where two or more primary sources directly contradict each other. Only genuine factual disputes qualify.' },
                { tab: 'Data Panels', desc: 'Charts and datasets from official sources, with full methodology notes.' },
              ].map(item => (
                <div key={item.tab} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{item.tab}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p>
              At the top of every fact file, a <strong>Confidence Meter</strong> shows how well-documented
              the topic is. A <strong>Status Badge</strong> tells you whether the record is still evolving
              (Open or Developing) or whether the factual record is settled (Resolved).
            </p>
          </Section>

          <Section id="evidence-tiers" title="Evidence Tiers Explained">
            <p>
              Every source in FACTION is assigned to one of two tiers — not to rank importance, but to
              communicate the nature of the source:
            </p>
            <div className="space-y-3 my-4">
              <div className="border border-blue-200 dark:border-blue-900 rounded-xl p-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#1A4A8A] text-white px-2 py-0.5 rounded">
                    TIER 1
                  </span>
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Verified Official</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Government documents, court filings, peer-reviewed studies, official testimony,
                  autopsy reports, legislative records. The issuing authority is a primary institution.
                  This is the gold standard.
                </p>
              </div>
              <div className="border border-amber-200 dark:border-amber-900 rounded-xl p-4 bg-amber-50 dark:bg-amber-950">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white px-2 py-0.5 rounded">
                    TIER 3
                  </span>
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Community Verified</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Citizen footage, official social media posts, released-but-unverified documents.
                  The content appears authentic, but the chain of custody is less certain. Always
                  clearly labelled.
                </p>
              </div>
            </div>
            <Callout type="warning">
              There is no Tier 2. We intentionally do not tier news articles, op-eds, or secondhand
              reporting. If a source cannot reach Tier 3 standards, it is not included.
            </Callout>
          </Section>

          <Section id="confidence-score" title="Confidence Score">
            <p>
              The Confidence Score (0–100) is a machine-computed indicator, not an editorial judgment.
              It reflects:
            </p>
            <ul className="list-none space-y-2 my-3">
              {[
                { factor: 'Tier 1 source ratio', weight: '60 pts max', desc: 'The proportion of Tier 1 sources drives the score most.' },
                { factor: 'Evidence volume', weight: '20 pts max', desc: 'More sources = more confidence, up to ~15 sources.' },
                { factor: 'Verification ratio', weight: '10 pts max', desc: 'Editorial team has confirmed source authenticity.' },
                { factor: 'Resolved status', weight: '+10 pts', desc: 'A definitive record has been established.' },
                { factor: 'Contested claims', weight: '-5 pts each', desc: 'Genuine factual disputes reduce certainty.' },
              ].map(f => (
                <li key={f.factor} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{f.factor}</span>
                    <span className="text-slate-500 dark:text-slate-400"> — {f.desc}</span>
                  </div>
                  <span className="font-mono text-xs text-[#2A7DE1] shrink-0 mt-0.5">{f.weight}</span>
                </li>
              ))}
            </ul>
            <Callout type="note">
              A low score does not mean a topic is false. It means the documentary record is thin.
              That is often true of developing events.
            </Callout>
          </Section>

          <Section id="contested-claims" title="Contested Claims">
            <p>
              A Contested Claim appears only when two or more primary sources directly and specifically
              contradict each other on a factual point. This is not manufactured balance — it requires
              genuine documentary conflict.
            </p>
            <p>
              FACTION does not adjudicate contested claims. We present both sides with their supporting
              sources. The ⚡ icon marks evidence items that are involved in a contested claim.
            </p>
            <Callout type="tip">
              When you see a Contested Claim, read both supporting source lists and check the issuing
              authorities. Often the conflict reveals what is genuinely uncertain versus what is being
              misrepresented.
            </Callout>
          </Section>

          <Section id="voting" title="Priority Voting">
            <p>
              The <strong>▲ Vote priority</strong> button on every fact file casts one vote per day per
              topic. High-vote topics surface to the top of the priority queue, signalling to our editorial
              team which records need deeper investigation.
            </p>
            <p>
              Votes do not represent agreement or disagreement with a topic — they represent a request for
              more thorough documentation. You can vote on any published fact file, once per day.
            </p>
          </Section>

          <Section id="citing" title="Citing FACTION Sources">
            <p>
              Each evidence card has a <strong>Cite</strong> button that generates formatted citations in
              APA, MLA, and Chicago style. The citation includes the issuing authority, source title,
              original URL, and the access date.
            </p>
            <Callout type="tip">
              When citing for academic or professional use, always cite the original primary source
              directly (the URL in the evidence card), not the FACTION page itself. FACTION is an index,
              not a primary source.
            </Callout>
            <p>
              Each evidence item also has a permanent deep-link URL at{' '}
              <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                /fact/[slug]/evidence/[id]
              </code>{' '}
              so you can link directly to a specific piece of evidence.
            </p>
          </Section>

          <Section id="submitting" title="Submitting Tips">
            <p>
              FACTION accepts three types of public submissions:
            </p>
            <div className="space-y-2 my-3">
              {[
                { type: 'New Topic', desc: 'Propose a new fact file. Include the subject, why it is in the public interest, and any initial sources you have found.' },
                { type: 'New Evidence', desc: 'Suggest a primary source for an existing fact file. Must be a direct link to an official document — no news articles.' },
                { type: 'Correction', desc: 'Flag a factual error, dead link, outdated information, or editorial policy violation.' },
              ].map(s => (
                <div key={s.type} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{s.type}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p>
              All submissions are reviewed by the FACTION editorial team before publication. Only verified
              primary sources are added to the index.
            </p>
            <div className="mt-4">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A7DE1] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4A8A] transition-colors"
              >
                Submit a tip →
              </Link>
            </div>
          </Section>

          <Section id="keyboard" title="Keyboard Shortcuts">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-300">Shortcut</th>
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { keys: ['⌘', 'K'], action: 'Open command palette (search all fact files)' },
                    { keys: ['Ctrl', 'K'], action: 'Open command palette (Windows/Linux)' },
                    { keys: ['Esc'], action: 'Close command palette or mobile menu' },
                    { keys: ['↑', '↓'], action: 'Navigate results in command palette' },
                    { keys: ['Enter'], action: 'Open selected result' },
                  ].map(row => (
                    <tr key={row.action}>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1">
                          {row.keys.map(k => (
                            <kbd
                              key={k}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono text-slate-700 dark:text-slate-300"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </article>

        {/* Sidebar ToC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                On this page
              </p>
              <nav className="space-y-1" aria-label="Table of contents">
                {TOC.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-slate-500 dark:text-slate-400 hover:text-[#2A7DE1] py-1 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="mt-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Questions?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Submit via our form and we&apos;ll address it.</p>
              <Link href="/submit" className="inline-block mt-2 text-xs text-[#2A7DE1] hover:underline">
                Contact us →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
