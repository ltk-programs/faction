import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFactFile } from '@/lib/content'
import { updateContestedClaim } from '@/lib/actions'

export default async function EditContestedClaimPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const ff = await getFactFile(slug)
  if (!ff) notFound()

  const claim = ff.contested_claims.find(c => c.id === id)
  if (!claim) notFound()

  const save = updateContestedClaim.bind(null, slug, id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <Link href={`/admin/${slug}`} className="hover:text-slate-600">{ff.title}</Link>
        <span>/</span>
        <span className="text-slate-600">Edit Contested Claim</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-800 mb-2">Edit Contested Claim</h1>
      <p className="text-sm text-slate-500 mb-6">
        Only use contested claims when two primary sources directly contradict each other on a specific factual point. Keep language neutral.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form action={save} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              The claim / question in dispute <span className="text-red-400">*</span>
            </label>
            <input name="claim" required defaultValue={claim.claim}
              placeholder="State the specific factual question neutrally. E.g. 'Was the door locked?'"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Context</label>
            <textarea name="context" rows={2} defaultValue={claim.context}
              placeholder="Neutral background explaining why this point is contested."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Side A position <span className="text-red-400">*</span>
                <span className="text-slate-400 font-normal ml-1">— what one set of sources says</span>
              </label>
              <textarea name="side_a" required rows={3} defaultValue={claim.side_a.position}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Side B position <span className="text-red-400">*</span>
                <span className="text-slate-400 font-normal ml-1">— what the other set of sources says</span>
              </label>
              <textarea name="side_b" required rows={3} defaultValue={claim.side_b.position}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] resize-y" />
            </div>
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
