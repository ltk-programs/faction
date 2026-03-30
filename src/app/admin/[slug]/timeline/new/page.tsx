import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { addTimelineEvent } from '@/lib/actions'

export default async function AddTimelinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const addEvent = addTimelineEvent.bind(null, slug)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <Link href={`/admin/${ff.slug}`} className="hover:text-slate-600">{ff.title}</Link>
        <span>/</span>
        <span className="text-slate-600">Add Timeline Event</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Add Timeline Event</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={addEvent} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date <span className="text-red-400">*</span></label>
              <input name="date" required type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Time <span className="text-slate-400 font-normal">(optional)</span></label>
              <input name="time" type="time" placeholder="HH:MM"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Event Title <span className="text-red-400">*</span></label>
            <input name="title" required placeholder="Short factual label"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
            <textarea name="description" rows={3}
              placeholder="Neutral, factual description. No interpretation."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Linked Evidence IDs
              <span className="text-slate-400 font-normal ml-1">(comma-separated evidence IDs from the index)</span>
            </label>
            {ff.evidence.length > 0 && (
              <div className="mb-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 space-y-1 max-h-32 overflow-y-auto">
                {ff.evidence.map((e, i) => (
                  <div key={e.id}><code className="font-mono text-blue-600">{e.id}</code> — {e.title}</div>
                ))}
              </div>
            )}
            <input name="evidence_ids" placeholder="e.g. abc12345, def67890"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="submit"
              className="px-4 py-2 bg-[#1A4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F3C] transition-colors">
              Add Event →
            </button>
            <Link href={`/admin/${ff.slug}`} className="text-sm text-slate-400 hover:text-slate-600">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
