import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllFactFilesIncludingDrafts } from '@/lib/content'
import { BulkImportForm } from './BulkImportForm'

export const metadata: Metadata = { title: 'Bulk Import — Admin' }

export default async function ImportPage() {
  const factFiles = await getAllFactFilesIncludingDrafts()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-slate-600">Admin</Link>
        <span>/</span>
        <span className="text-slate-600">Bulk Import</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-1">Bulk Evidence Import</h1>
      <p className="text-sm text-slate-500 mb-6">
        Paste a CSV of evidence rows to append to an existing fact file. All rows are added
        as unverified — use the admin editor to review and verify each one.
      </p>

      <BulkImportForm factFiles={factFiles} />
    </div>
  )
}
