import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { addContestedClaim } from '@/lib/actions'

export default async function AddClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const addClaim = addContestedClaim.bind(null, slug)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <Link href={`/admin/${ff.slug}`} className="hover:text-slate-600">{ff.title}</Link>
        <span>/</span>
        <span className="text-slate-600">Add Contested Claim</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-2">Add Contested Claim</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-700">
        <strong>Only add a contested claim if two primary sources directly contradict each other on this specific factual point.</strong> Do not manufacture controversy where the primary source record is one-sided.
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={addClaim} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Contested Factual Question <span className="text-red-400">*</span></label>
            <input name="claim" required
              placeholder="e.g. Where exactly was the officer's knee positioned during restraint?"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Context <span className="text-slate-400 font-normal">(neutral background)</span></label>
            <textarea name="context" rows={2}
              placeholder="Brief neutral context for why this question is in dispute."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          {/* Evidence IDs reference */}
          {ff.evidence.length > 0 && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 space-y-1 max-h-32 overflow-y-auto">
              <div className="font-semibold text-slate-600 mb-1">Available evidence IDs:</div>
              {ff.evidence.map(e => (
                <div key={e.id}><code className="font-mono text-blue-600">{e.id}</code> — {e.title}</div>
              ))}
            </div>
          )}

          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Position A</div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Position statement <span className="text-red-400">*</span></label>
              <textarea name="side_a_position" required rows={2}
                placeholder="The factual position that Side A's primary sources support."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Supporting evidence IDs <span className="text-slate-400">(comma-separated)</span></label>
              <input name="side_a_evidence_ids" placeholder="e.g. abc12345"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2A7DE1]" />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Position B</div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Position statement <span className="text-red-400">*</span></label>
              <textarea name="side_b_position" required rows={2}
                placeholder="The factual position that Side B's primary sources support."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Supporting evidence IDs <span className="text-slate-400">(comma-separated)</span></label>
              <input name="side_b_evidence_ids" placeholder="e.g. def67890"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2A7DE1]" />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="submit"
              className="px-4 py-2 bg-[#1A4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F3C] transition-colors">
              Add Contested Claim →
            </button>
            <Link href={`/admin/${ff.slug}`} className="text-sm text-slate-400 hover:text-slate-600">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
