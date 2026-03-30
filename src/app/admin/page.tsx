import Link from 'next/link'
import { getAllFactFilesIncludingDrafts, getSubmissions, getViewCounts } from '@/lib/content'
import { StatusBadge } from '@/components/StatusBadge'

export default async function AdminDashboard() {
  const factFiles = await getAllFactFilesIncludingDrafts()
  const pendingSubmissions = (await getSubmissions()).filter(s => s.status === 'pending').length
  const draftCount = factFiles.filter(f => f.is_draft).length
  const viewCounts = await getViewCounts(factFiles.map(f => f.slug))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Fact File Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {factFiles.length} fact file{factFiles.length !== 1 ? 's' : ''}
            {draftCount > 0 && <span className="ml-2 text-yellow-600">· {draftCount} draft{draftCount !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/link-health"
            className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:border-slate-300 transition-colors"
          >
            🔗 Link Health
          </Link>
          <Link
            href="/admin/submissions"
            className="relative px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:border-slate-300 transition-colors"
          >
            📥 Submissions
            {pendingSubmissions > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingSubmissions}
              </span>
            )}
          </Link>
          <Link
            href="/admin/import"
            className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:border-slate-300 transition-colors"
          >
            📥 Bulk Import
          </Link>
          <Link
            href="/admin/new"
            className="px-4 py-2 bg-[#1A4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#0D1F3C] transition-colors"
          >
            + New Fact File
          </Link>
        </div>
      </div>

      {factFiles.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center bg-white">
          <p className="text-slate-400 text-sm mb-3">No Fact Files yet.</p>
          <Link href="/admin/new" className="text-sm text-[#2A7DE1] hover:underline">
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sources</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Views</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Votes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factFiles.map(ff => (
                <tr key={ff.slug} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 leading-snug">{ff.title}</div>
                    {ff.subtitle && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{ff.subtitle}</div>}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {ff.category.map(c => (
                        <span key={c} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StatusBadge status={ff.status} />
                      {ff.is_draft && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200 font-semibold">
                          DRAFT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600 font-mono text-xs">{ff.evidence_count}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {viewCounts[ff.slug] != null
                      ? <span className="text-slate-700">{viewCounts[ff.slug].toLocaleString()}</span>
                      : <span className="text-slate-300" title="KV not configured — views tracked in production">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600 font-mono text-xs">{ff.priority_votes}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(ff.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/fact/${ff.slug}${ff.is_draft ? '?preview=true' : ''}`} className="text-xs text-slate-400 hover:text-slate-600">
                        {ff.is_draft ? 'Preview' : 'View'}
                      </Link>
                      <Link href={`/admin/${ff.slug}`} className="text-xs text-[#2A7DE1] hover:underline font-medium">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
