import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { StatusBadge } from '@/components/StatusBadge'
import { TierBadge } from '@/components/TierBadge'
import { SourceTypeLabel } from '@/components/SourceTypeLabel'
import {
  updateFactFileMeta, removeEvidence, toggleEvidenceVerified,
  removeTimelineEvent, removeContestedClaim, removeDataPanel,
  addChangelogEntry, toggleDraftMode,
} from '@/lib/actions'
import { SOURCE_TYPE_OPTIONS } from '@/components/SourceTypeLabel'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'developing', label: 'Developing' },
  { value: 'resolved', label: 'Resolved' },
]

export default async function AdminFactFilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const updateMeta = updateFactFileMeta.bind(null, ff.slug)
  const publishAction = toggleDraftMode.bind(null, ff.slug, false)
  const draftAction   = toggleDraftMode.bind(null, ff.slug, true)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/admin" className="hover:text-slate-600">Admin</Link>
            <span>/</span>
            <span className="text-slate-600">{ff.title}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{ff.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={ff.status} />
          {ff.is_draft && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-200 font-semibold">
              DRAFT
            </span>
          )}
          {ff.is_draft ? (
            <form action={publishAction}>
              <button type="submit" className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                ✓ Publish
              </button>
            </form>
          ) : (
            <form action={draftAction}>
              <button type="submit" className="text-xs px-3 py-1.5 rounded border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors">
                Move to draft
              </button>
            </form>
          )}
          <Link
            href={`/fact/${ff.slug}${ff.is_draft ? '?preview=true' : ''}`}
            target="_blank"
            className="text-xs px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors"
          >
            {ff.is_draft ? 'Preview ↗' : 'View public page ↗'}
          </Link>
        </div>
      </div>

      {/* ── Edit Meta ─────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Edit Fact File</h2>
        <form action={updateMeta} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
              <input name="title" defaultValue={ff.title} required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select name="status" defaultValue={ff.status}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Subtitle</label>
            <input name="subtitle" defaultValue={ff.subtitle || ''}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Categories (comma-separated)</label>
            <input name="category" defaultValue={ff.category.join(', ')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Summary</label>
            <textarea name="summary" defaultValue={ff.summary} rows={4} required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Situation Context</label>
            <textarea name="situation_context" defaultValue={ff.situation_context} rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Reopen Threshold</label>
            <textarea name="reopen_threshold" defaultValue={ff.reopen_threshold} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          {ff.status === 'resolved' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Resolution Note</label>
              <textarea name="resolution_note" defaultValue={ff.resolution_note || ''} rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
            </div>
          )}

          <button type="submit"
            className="px-4 py-2 bg-[#1A4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F3C] transition-colors">
            Save changes
          </button>
        </form>
      </section>

      {/* ── Evidence ──────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Evidence Index <span className="text-slate-400 font-normal">({ff.evidence.length})</span>
          </h2>
          <Link href={`/admin/${ff.slug}/evidence/new`}
            className="text-xs px-3 py-1.5 rounded bg-[#EAF1FB] text-[#1A4A8A] hover:bg-[#C5D8F5] transition-colors font-medium">
            + Add evidence
          </Link>
        </div>

        {ff.evidence.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No evidence yet.</p>
        ) : (
          <div className="space-y-3">
            {ff.evidence.map((ev, i) => {
              const toggleVerified = toggleEvidenceVerified.bind(null, ff.slug, ev.id)
              const removeEv = removeEvidence.bind(null, ff.slug, ev.id)
              return (
                <div key={ev.id} className="border border-slate-200 rounded-lg p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-slate-400">#{String(i + 1).padStart(2, '0')}</span>
                        <TierBadge tier={ev.tier} />
                        <SourceTypeLabel type={ev.source_type} />
                      </div>
                      <div className="flex items-start gap-2">
                        <a href={ev.url} target="_blank" rel="noopener noreferrer"
                          className="font-medium text-blue-700 hover:underline text-xs truncate block flex-1">{ev.title}</a>
                        <a href={ev.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2 py-0.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 flex-shrink-0 whitespace-nowrap"
                          title="Open URL to verify it works">
                          Verify ↗
                        </a>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{ev.issuing_authority} · {ev.date_issued} · ID: <code className="font-mono">{ev.id}</code></div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link
                        href={`/admin/${ff.slug}/evidence/${ev.id}`}
                        className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-500 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors"
                      >
                        Edit
                      </Link>
                      <form action={toggleVerified}>
                        <button type="submit" className={`text-xs px-2 py-1 rounded border transition-colors ${ev.verified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                          {ev.verified ? '✓ Verified' : 'Mark verified'}
                        </button>
                      </form>
                      <form action={removeEv}>
                        <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          onClick={e => { if (!confirm('Remove this evidence?')) e.preventDefault() }}>
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Timeline <span className="text-slate-400 font-normal">({ff.timeline.length})</span>
          </h2>
          <Link href={`/admin/${ff.slug}/timeline/new`}
            className="text-xs px-3 py-1.5 rounded bg-[#EAF1FB] text-[#1A4A8A] hover:bg-[#C5D8F5] transition-colors font-medium">
            + Add event
          </Link>
        </div>

        {ff.timeline.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No timeline events yet.</p>
        ) : (
          <div className="space-y-2">
            {ff.timeline.map(event => {
              const removeEvent = removeTimelineEvent.bind(null, ff.slug, event.id)
              return (
                <div key={event.id} className="border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{event.date}{event.time ? ` ${event.time}` : ''}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-700">{event.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{event.description}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/admin/${ff.slug}/timeline/${event.id}`}
                      className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-500 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors"
                    >
                      Edit
                    </Link>
                    <form action={removeEvent}>
                      <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 flex-shrink-0"
                        onClick={e => { if (!confirm('Remove this event?')) e.preventDefault() }}>
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Contested Claims ──────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Contested Claims <span className="text-slate-400 font-normal">({ff.contested_claims.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Only add when two primary sources directly contradict each other on a specific factual point.</p>
          </div>
          <Link href={`/admin/${ff.slug}/claims/new`}
            className="text-xs px-3 py-1.5 rounded bg-[#EAF1FB] text-[#1A4A8A] hover:bg-[#C5D8F5] transition-colors font-medium">
            + Add claim
          </Link>
        </div>

        {ff.contested_claims.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No contested claims. This is correct if the primary source record is unambiguous.</p>
        ) : (
          <div className="space-y-2">
            {ff.contested_claims.map(claim => {
              const removeClaim = removeContestedClaim.bind(null, ff.slug, claim.id)
              return (
                <div key={claim.id} className="border border-amber-200 rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">{claim.claim}</div>
                    <div className="text-xs text-slate-500 mt-0.5">A: {claim.side_a.position.slice(0, 80)}…</div>
                    <div className="text-xs text-slate-500">B: {claim.side_b.position.slice(0, 80)}…</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/admin/${ff.slug}/claims/${claim.id}`}
                      className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-500 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors"
                    >
                      Edit
                    </Link>
                    <form action={removeClaim}>
                      <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 flex-shrink-0"
                        onClick={e => { if (!confirm('Remove this claim?')) e.preventDefault() }}>
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Data Panels ──────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Data Panels <span className="text-slate-400 font-normal">({ff.data_panels.length})</span>
          </h2>
          <Link href={`/admin/${ff.slug}/data/new`}
            className="text-xs px-3 py-1.5 rounded bg-[#EAF1FB] text-[#1A4A8A] hover:bg-[#C5D8F5] transition-colors font-medium">
            + Add panel
          </Link>
        </div>

        {ff.data_panels.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No data panels yet.</p>
        ) : (
          <div className="space-y-2">
            {ff.data_panels.map(panel => {
              const removePanel = removeDataPanel.bind(null, ff.slug, panel.id)
              return (
                <div key={panel.id} className="border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{panel.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{panel.chart_type} · {panel.labels.length} data points</div>
                  </div>
                  <form action={removePanel}>
                    <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 flex-shrink-0"
                      onClick={e => { if (!confirm('Remove this panel?')) e.preventDefault() }}>
                      Remove
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Changelog ────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">
          Corrections & Updates Log
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          All editorial changes must be logged here for public transparency. Corrections appear highlighted on the public page.
        </p>

        {/* Log new entry */}
        <form action={addChangelogEntry.bind(null, ff.slug)} className="border border-slate-200 rounded-lg p-4 mb-4 space-y-3 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                type="date"
                name="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
              <select name="entry_type" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] bg-white">
                <option value="correction">Correction</option>
                <option value="addition">Addition</option>
                <option value="update">Update</option>
                <option value="status-change">Status change</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="description"
              required
              maxLength={200}
              placeholder="What changed and why? (200 chars max)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]"
            />
          </div>
          <button type="submit" className="text-xs px-4 py-2 rounded bg-[#0D1F3C] text-white hover:bg-[#1A4A8A] transition-colors font-medium">
            Log entry
          </button>
        </form>

        {/* Existing log */}
        {!ff.changelog || ff.changelog.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No changelog entries yet.</p>
        ) : (
          <div className="space-y-2">
            {[...(ff.changelog)].sort((a,b) => b.date.localeCompare(a.date)).map(entry => (
              <div key={entry.id} className="flex items-start gap-3 text-sm border border-slate-100 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-400 font-mono w-20 shrink-0">{entry.date}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 font-medium ${
                  entry.type === 'correction' ? 'bg-red-100 text-red-700' :
                  entry.type === 'addition' ? 'bg-blue-100 text-blue-700' :
                  entry.type === 'status-change' ? 'bg-purple-100 text-purple-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{entry.type}</span>
                <p className="text-slate-600 text-xs">{entry.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
