import Link from 'next/link'
import { getSubmissions } from '@/lib/content'
import { updateSubmissionStatus } from '@/lib/actions'
import { MergeButton } from './MergeButton'
import type { Submission } from '@/types'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<Submission['type'], string> = {
  new_topic:    '📌 New topic',
  new_evidence: '🔗 New evidence',
  correction:   '⚠️ Correction',
}

const STATUS_STYLES: Record<Submission['status'], string> = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

// Explains what "Accept" means for each type
const ACCEPT_HINT: Record<Submission['type'], string> = {
  new_evidence: 'Adds the source directly to the fact file as Tier 3 (unverified). You can review and adjust it in the editor.',
  correction:   'Marks as accepted. Apply the correction manually in the fact file editor.',
  new_topic:    'Marks as accepted. Create the new fact file using the admin editor.',
}

function SubmissionCard({ sub }: { sub: Submission }) {
  const rejectAction  = updateSubmissionStatus.bind(null, sub.id, 'rejected')
  const pendingAction = updateSubmissionStatus.bind(null, sub.id, 'pending')

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{TYPE_LABELS[sub.type]}</span>
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_STYLES[sub.status]}`}>
            {sub.status}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {new Date(sub.submitted_at).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2 text-sm">
        {sub.topic_title && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">Topic</span>
            <p className="font-medium text-slate-800">{sub.topic_title}</p>
          </div>
        )}
        {sub.topic_description && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">Description</span>
            <p className="text-slate-600">{sub.topic_description}</p>
          </div>
        )}
        {sub.existing_slug && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">Target fact file</span>
            <Link href={`/admin/${sub.existing_slug}`} className="text-[#2A7DE1] hover:underline font-mono text-xs">
              {sub.existing_slug}
            </Link>
          </div>
        )}
        {sub.evidence_title && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">Evidence title</span>
            <p className="text-slate-800 font-medium">{sub.evidence_title}</p>
          </div>
        )}
        {sub.evidence_url && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">URL</span>
            <a href={sub.evidence_url} target="_blank" rel="noopener noreferrer"
              className="text-[#2A7DE1] hover:underline font-mono text-xs break-all">
              {sub.evidence_url}
            </a>
          </div>
        )}
        {sub.evidence_source && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">Issuing authority</span>
            <p className="text-slate-600">{sub.evidence_source}</p>
          </div>
        )}
        {sub.correction_detail && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">Correction details</span>
            <p className="text-slate-600">{sub.correction_detail}</p>
          </div>
        )}
        {sub.submitter_note && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">Submitter note</span>
            <p className="text-slate-500 italic">{sub.submitter_note}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
        {sub.status !== 'accepted' && (
          <div className="flex flex-col gap-1">
            <MergeButton submissionId={sub.id} type={sub.type} />
            <span className="text-xs text-slate-400 max-w-xs leading-snug">{ACCEPT_HINT[sub.type]}</span>
          </div>
        )}
        {sub.status !== 'rejected' && (
          <form action={rejectAction}>
            <button className="text-xs px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors">
              ✗ Reject
            </button>
          </form>
        )}
        {sub.status !== 'pending' && (
          <form action={pendingAction}>
            <button className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-500 hover:border-slate-300 transition-colors">
              Reset to pending
            </button>
          </form>
        )}
        {sub.existing_slug && (
          <Link
            href={`/admin/${sub.existing_slug}`}
            className="ml-auto text-xs px-3 py-1.5 rounded border border-[#2A7DE1] text-[#2A7DE1] hover:bg-[#2A7DE1] hover:text-white transition-colors"
          >
            Open fact file →
          </Link>
        )}
      </div>
    </div>
  )
}

export default async function SubmissionsPage() {
  const all = await getSubmissions()
  const pending  = all.filter(s => s.status === 'pending')
  const reviewed = all.filter(s => s.status !== 'pending')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">← Admin</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">Submissions queue</h1>
        {pending.length > 0 && (
          <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>

      {all.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm">No submissions yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Submissions come in via the public{' '}
            <Link href="/submit" className="text-[#2A7DE1] hover:underline">/submit</Link> page.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Pending review ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map(s => <SubmissionCard key={s.id} sub={s} />)}
              </div>
            </section>
          )}
          {reviewed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Reviewed ({reviewed.length})
              </h2>
              <div className="space-y-4">
                {reviewed.map(s => <SubmissionCard key={s.id} sub={s} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
