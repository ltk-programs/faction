import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { addEvidence } from '@/lib/actions'
import { SOURCE_TYPE_OPTIONS } from '@/components/SourceTypeLabel'

export default async function AddEvidencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const addEv = addEvidence.bind(null, slug)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <Link href={`/admin/${ff.slug}`} className="hover:text-slate-600">{ff.title}</Link>
        <span>/</span>
        <span className="text-slate-600">Add Evidence</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Add Evidence</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-700">
        <strong>Rule:</strong> The URL must link directly to the original source on an official domain (e.g. .gov, court portal, .edu). No file uploads. No secondhand links.
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={addEv} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Title <span className="text-red-400">*</span></label>
            <input name="title" required placeholder="Official title of the document/footage"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Source Type <span className="text-red-400">*</span></label>
              <select name="source_type" required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
                {SOURCE_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tier <span className="text-red-400">*</span></label>
              <select name="tier" required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
                <option value="1">Tier 1 — Verified official</option>
                <option value="3">Tier 3 — Community-verified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              URL <span className="text-red-400">*</span>
              <span className="text-slate-400 font-normal ml-1">— must be direct link to original official source</span>
            </label>
            <input name="url" required type="url" placeholder="https://..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Issuing Authority <span className="text-red-400">*</span></label>
              <input name="issuing_authority" required placeholder="e.g. Hennepin County Medical Examiner"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date Issued <span className="text-red-400">*</span></label>
              <input name="date_issued" required type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Description
              <span className="text-slate-400 font-normal ml-1">— neutral, ≤100 words, no interpretation</span>
            </label>
            <textarea name="description" rows={3}
              placeholder="What this document contains. Facts only. No framing."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Editorial Verification</label>
            <select name="verified"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
              <option value="true">✓ Verified — source authenticity confirmed</option>
              <option value="false">Pending — awaiting editorial review</option>
            </select>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="submit"
              className="px-4 py-2 bg-[#1A4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F3C] transition-colors">
              Add to Evidence Index →
            </button>
            <Link href={`/admin/${ff.slug}`} className="text-sm text-slate-400 hover:text-slate-600">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
