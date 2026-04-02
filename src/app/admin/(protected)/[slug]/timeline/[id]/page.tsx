import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { updateTimelineEvent } from '@/lib/actions'

export default async function EditTimelineEventPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const event = ff.timeline.find(e => e.id === id)
  if (!event) notFound()

  const save = updateTimelineEvent.bind(null, slug, id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <Link href={`/admin/${slug}`} className="hover:text-slate-600">{ff.title}</Link>
        <span>/</span>
        <span className="text-slate-600">Edit Timeline Event</span>
        <span>/</span>
        <span className="font-mono text-slate-500">{event.id}</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Timeline Event</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={save} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date <span className="text-red-400">*</span></label>
              <input name="date" required type="date" defaultValue={event.date}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Time <span className="text-slate-400 font-normal">(optional, HH:MM 24h)</span>
              </label>
              <input name="time" type="time" defaultValue={event.time ?? ''}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Title <span className="text-red-400">*</span></label>
            <input name="title" required defaultValue={event.title}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea name="description" required rows={4} defaultValue={event.description}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Evidence IDs <span className="text-slate-400 font-normal">(comma-separated, e.g. e001, e003)</span>
            </label>
            <input name="evidence_ids" defaultValue={event.evidence_ids.join(', ')}
              placeholder="e001, e002"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] font-mono" />
            {ff.evidence.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {ff.evidence.map(e => (
                  <span key={e.id} className="text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                    {e.id}
                  </span>
                ))}
              </div>
            )}
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
