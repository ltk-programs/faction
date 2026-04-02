import { getAllFactFiles, getAllFactFilesRaw, getTrendingFiles } from '@/lib/content'
import { HomePageClient } from '@/components/HomePageClient'
import Link from 'next/link'

export default async function HomePage() {
  const [factFiles, fullFiles, trending] = await Promise.all([
    getAllFactFiles(),
    getAllFactFilesRaw(),
    getTrendingFiles(5),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#0D1F3C] dark:text-slate-100 mb-2 tracking-tight">
          The same board.<br />
          <span className="text-[#2A7DE1]">The same facts.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
          Primary-source evidence on the topics that matter — so every debate starts on the same playing field.
          No editorial spin. No interpretation. Just the record.
        </p>
      </div>

      {/* Priority queue label */}
      <div className="mb-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Priority Queue</h2>
      </div>

      {/* Trending — only shown when we have view data */}
      {trending.length > 0 && (
        <div className="mb-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Trending now</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">by views</span>
          </div>
          <ol className="space-y-2">
            {trending.map((ff, i) => (
              <li key={ff.slug}>
                <Link
                  href={`/fact/${ff.slug}`}
                  className="flex items-center gap-3 group hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                >
                  <span className="text-xs font-mono text-slate-300 dark:text-slate-600 w-4 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#1A4A8A] dark:group-hover:text-blue-400 truncate">
                    {ff.title}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                    {ff.views.toLocaleString()} views
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Search, filter, and topic grid — all client-side */}
      <HomePageClient factFiles={factFiles} fullFiles={fullFiles} />

      {/* FACTION principles */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '⬡', title: 'Primary sources only', body: 'Every claim links directly to an official document, footage, or verified institutional source. No secondhand reporting.' },
          { icon: '⚖', title: 'No interpretation', body: 'FACTION presents. You decide. Editorialising, framing, and spin are policy violations — not design choices.' },
          { icon: '◎', title: 'Transparent process', body: 'Source tiers are visible. Priority rankings are rules-based. Contested claims appear only when primary sources genuinely conflict.' },
        ].map(p => (
          <div key={p.title} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{p.title}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      {/* Quick links to new pages */}
      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        <Link href="/stats" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors bg-white dark:bg-slate-800">
          📊 Platform Stats
        </Link>
        <Link href="/guide" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors bg-white dark:bg-slate-800">
          📖 How it works
        </Link>
        <Link href="/glossary" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors bg-white dark:bg-slate-800">
          📚 Glossary
        </Link>
        <Link href="/timeline" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors bg-white dark:bg-slate-800">
          🕐 Global Timeline
        </Link>
      </div>
    </div>
  )
}
