import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { addDataPanel } from '@/lib/actions'

export default async function AddDataPanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const addPanel = addDataPanel.bind(null, slug)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <Link href={`/admin/${ff.slug}`} className="hover:text-slate-600">{ff.title}</Link>
        <span>/</span>
        <span className="text-slate-600">Add Data Panel</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Add Data Panel</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={addPanel} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Chart Title <span className="text-red-400">*</span></label>
            <input name="title" required placeholder="e.g. 4th-Quarter Play Call Success Rate (2023 Season)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
            <input name="description" placeholder="Brief neutral description of what the chart shows"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Primary Data Source URL <span className="text-red-400">*</span>
            </label>
            <input name="data_source_url" required type="url" placeholder="https://..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Methodology Note <span className="text-red-400">*</span>
              <span className="text-slate-400 font-normal ml-1">— what data, what period, what is NOT shown</span>
            </label>
            <textarea name="methodology_note" required rows={2}
              placeholder="e.g. Data from NFL official play-by-play records, weeks 1–18, 2023 regular season. Excludes preseason and playoff data. Success defined as gaining the required yards for a first down or touchdown."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Chart Type</label>
            <select name="chart_type"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]">
              <option value="bar">Bar chart</option>
              <option value="line">Line chart</option>
              <option value="table">Table</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              X-axis Labels <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input name="labels" placeholder="e.g. Week 1, Week 2, Week 3" required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Dataset Label</label>
            <input name="data_label" placeholder="e.g. Success rate (%)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Data Values <span className="text-slate-400 font-normal">(comma-separated numbers, matching label order)</span>
            </label>
            <input name="data" placeholder="e.g. 65, 70, 58, 72, 61" required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2A7DE1]" />
            <p className="text-xs text-slate-400 mt-1">Note: For Phase 1, multi-dataset support will allow comparison charts. Currently one dataset per panel.</p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="submit"
              className="px-4 py-2 bg-[#1A4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F3C] transition-colors">
              Add Data Panel →
            </button>
            <Link href={`/admin/${ff.slug}`} className="text-sm text-slate-400 hover:text-slate-600">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
