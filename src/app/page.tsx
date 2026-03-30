import { getAllFactFiles } from '@/lib/content'
import { HomePageClient } from '@/components/HomePageClient'

export default async function HomePage() {
  const factFiles = await getAllFactFiles()

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#0D1F3C] mb-2 tracking-tight">
          The same board.<br />
          <span className="text-[#2A7DE1]">The same facts.</span>
        </h1>
        <p className="text-slate-500 text-base max-w-xl leading-relaxed">
          Primary-source evidence on the topics that matter — so every debate starts on the same playing field.
          No editorial spin. No interpretation. Just the record.
        </p>
      </div>

      {/* Priority queue label */}
      <div className="mb-4">
        <h2 className="font-semibold text-slate-800 text-sm">Priority Queue</h2>
      </div>

      {/* Search, filter, and topic grid — all client-side */}
      <HomePageClient factFiles={factFiles} />

      {/* FACTION principles */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '⬡', title: 'Primary sources only', body: 'Every claim links directly to an official document, footage, or verified institutional source. No secondhand reporting.' },
          { icon: '⚖', title: 'No interpretation', body: 'FACTION presents. You decide. Editorialising, framing, and spin are policy violations — not design choices.' },
          { icon: '◎', title: 'Transparent process', body: 'Source tiers are visible. Priority rankings are rules-based. Contested claims appear only when primary sources genuinely conflict.' },
        ].map(p => (
          <div key={p.title} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="text-sm font-semibold text-slate-800 mb-1">{p.title}</div>
            <p className="text-xs text-slate-500 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
