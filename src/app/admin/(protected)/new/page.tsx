import Link from 'next/link'
import { createFactFile } from '@/lib/actions'

export default function NewFactFilePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-600">← Admin</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-800">New Fact File</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={createFactFile} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Derek Chauvin / George Floyd — Minneapolis, May 2020"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] focus:ring-1 focus:ring-[#2A7DE1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Subtitle
            </label>
            <input
              name="subtitle"
              placeholder="Optional short descriptor"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Categories <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              name="category"
              placeholder="e.g. policing, criminal justice, usa"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Summary <span className="text-red-400">*</span>
              <span className="text-slate-400 font-normal ml-1">— neutral, facts only, no interpretation</span>
            </label>
            <textarea
              name="summary"
              required
              rows={4}
              placeholder="A neutral, primary-source-referenced description of what is known. No adjectives. No framing. Events in factual order."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Situation Context
              <span className="text-slate-400 font-normal ml-1">— background: who, where, when. No adjectives.</span>
            </label>
            <textarea
              name="situation_context"
              rows={3}
              placeholder="Background context relevant to understanding the primary source record."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Reopen Threshold <span className="text-red-400">*</span>
              <span className="text-slate-400 font-normal ml-1">— what specific new evidence would justify reopening</span>
            </label>
            <textarea
              name="reopen_threshold"
              required
              rows={2}
              placeholder="e.g. New primary source document becomes publicly available, or an existing source is formally retracted or shown to be fabricated."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1A4A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#0D1F3C] transition-colors"
            >
              Create Fact File →
            </button>
            <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-600">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
