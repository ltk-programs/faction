import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { updateEvidence } from '@/lib/actions'
import { SOURCE_TYPE_OPTIONS } from '@/components/SourceTypeLabel'

const MEDIA_TYPE_OPTIONS = ['', 'document', 'video', 'dataset', 'webpage', 'audio']

export default async function EditEvidencePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const ev = ff.evidence.find(e => e.id === id)
  if (!ev) notFound()

  const save = updateEvidence.bind(null, slug, id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <Link href={`/admin/${slug}`} className="hover:text-slate-600">{ff.title}</Link>
        <span>/</span>
        <span className="text-slate-600">Edit Evidence</span>
        <span>/</span>
        <span className="font-mono text-slate-500">{ev.id}</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Evidence Item</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={save} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Title <span className="text-red-400">*</span></label>
            <input name="title" required defaultValue={ev.title}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Source Type <span className="text-red-400">*</span></label>
              <select name="source_type" required defaultValue={ev.source_type}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
                {SOURCE_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tier <span className="text-red-400">*</span></label>
              <select name="tier" required defaultValue={String(ev.tier)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
                <option value="1">Tier 1 — Verified official</option>
                <option value="3">Tier 3 — Community-verified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">URL <span className="text-red-400">*</span></label>
            <input name="url" required type="url" defaultValue={ev.url}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] font-mono" />
            <div className="mt-1">
              <a href={ev.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#2A7DE1] hover:underline">
                Test current URL ↗
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Issuing Authority <span className="text-red-400">*</span></label>
              <input name="issuing_authority" required defaultValue={ev.issuing_authority}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date Issued <span className="text-red-400">*</span></label>
              <input name="date_issued" required type="date" defaultValue={ev.date_issued}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Media Type</label>
            <select name="media_type" defaultValue={ev.media_type ?? ''}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
              {MEDIA_TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>{t || '(none)'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
            <textarea name="description" rows={4} defaultValue={ev.description}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="submit"
              className="px-4 py-2 bg-[#1A4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F3C] transition-colors">
              Save changes
            </button>
            <Link href={`/admin/${slug}`} className="text-sm text-slate-400 hover:text-slate-600">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
