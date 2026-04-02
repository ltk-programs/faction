'use client'

import { useState, useTransition } from 'react'
import { bulkImportEvidence } from '@/lib/actions'
import type { FactFileSummary } from '@/types'

const EXAMPLE_CSV = `title,url,issuing_authority,date_issued,source_type,tier,description
DOJ Press Release — Indictment,https://www.justice.gov/example,U.S. Department of Justice,2023-06-15,government_document,1,Federal charges filed against defendant.
Senate Hearing Transcript,https://www.govinfo.gov/example,U.S. Senate,2022-11-03,official_testimony,1,Expert testimony on policy failures.`

interface Props {
  factFiles: FactFileSummary[]
}

type ParsedRow = {
  title: string
  url: string
  issuing_authority: string
  date_issued: string
  source_type: string
  tier: string
  description: string
  _error?: string
}

function parseCSV(csv: string): ParsedRow[] {
  const lines = csv.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const required = ['title', 'url', 'issuing_authority', 'date_issued', 'source_type', 'tier']

  return lines.slice(1).map((line, i) => {
    // Handle quoted values
    const values: string[] = []
    let current = ''
    let inQuote = false
    for (const char of line) {
      if (char === '"') { inQuote = !inQuote }
      else if (char === ',' && !inQuote) { values.push(current); current = '' }
      else { current += char }
    }
    values.push(current)

    const row: ParsedRow = {
      title: '',
      url: '',
      issuing_authority: '',
      date_issued: '',
      source_type: 'government_document',
      tier: '1',
      description: '',
    }

    headers.forEach((h, idx) => {
      if (h in row) (row as Record<string, string>)[h] = (values[idx] ?? '').trim()
    })

    const missing = required.filter(r => !row[r as keyof ParsedRow])
    if (missing.length > 0) row._error = `Row ${i + 2}: missing ${missing.join(', ')}`

    return row
  })
}

export function BulkImportForm({ factFiles }: Props) {
  const [csv, setCsv]         = useState('')
  const [slug, setSlug]       = useState('')
  const [parsed, setParsed]   = useState<ParsedRow[] | null>(null)
  const [result, setResult]   = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTrans] = useTransition()

  function handleParse() {
    const rows = parseCSV(csv)
    setParsed(rows)
    setResult(null)
  }

  function handleImport() {
    if (!parsed || !slug) return
    const validRows = parsed.filter(r => !r._error)
    const formData = new FormData()
    formData.set('slug', slug)
    formData.set('rows', JSON.stringify(validRows))

    startTrans(async () => {
      const res = await bulkImportEvidence(formData)
      setResult(res)
      if (res.ok) { setParsed(null); setCsv('') }
    })
  }

  const validRows   = parsed?.filter(r => !r._error) ?? []
  const invalidRows = parsed?.filter(r => r._error)  ?? []

  return (
    <div className="space-y-6">
      {/* Format reference */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-600 mb-2">Expected CSV columns:</p>
        <code className="block text-xs font-mono text-slate-500">
          title, url, issuing_authority, date_issued, source_type, tier, description
        </code>
        <div className="mt-2 text-xs text-slate-400 space-y-0.5">
          <p><strong>source_type</strong>: government_document | court_filing | official_statement | peer_reviewed_study | official_testimony | investigation_report | other_tier3 | …</p>
          <p><strong>tier</strong>: 1 (verified official) | 3 (community-verified)</p>
          <p><strong>date_issued</strong>: YYYY-MM-DD</p>
        </div>
        <button
          type="button"
          onClick={() => setCsv(EXAMPLE_CSV)}
          className="mt-2 text-xs text-[#2A7DE1] hover:underline"
        >
          Load example →
        </button>
      </div>

      {/* Target fact file */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Import into fact file <span className="text-red-500">*</span>
        </label>
        <select
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2A7DE1] bg-white"
        >
          <option value="">Select a fact file…</option>
          {factFiles.map(ff => (
            <option key={ff.slug} value={ff.slug}>
              {ff.title} {ff.is_draft ? '(draft)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* CSV input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          CSV data <span className="text-red-500">*</span>
        </label>
        <textarea
          value={csv}
          onChange={e => { setCsv(e.target.value); setParsed(null) }}
          rows={10}
          placeholder={`title,url,issuing_authority,date_issued,source_type,tier,description\n...`}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2A7DE1] resize-y"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleParse}
          disabled={!csv.trim() || !slug}
          className="text-sm px-4 py-2 rounded-lg border border-[#2A7DE1] text-[#2A7DE1] hover:bg-[#EFF6FF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Preview import
        </button>
        {parsed && validRows.length > 0 && (
          <button
            type="button"
            onClick={handleImport}
            disabled={isPending}
            className="text-sm px-4 py-2 rounded-lg bg-[#1A4A8A] text-white hover:bg-[#0D1F3C] transition-colors disabled:opacity-60"
          >
            {isPending ? 'Importing…' : `Import ${validRows.length} row${validRows.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-lg p-4 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.ok ? '✓' : '✗'} {result.message}
        </div>
      )}

      {/* Preview */}
      {parsed && (
        <div className="space-y-3">
          {invalidRows.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">{invalidRows.length} invalid row{invalidRows.length !== 1 ? 's' : ''} (will be skipped):</p>
              {invalidRows.map((r, i) => (
                <p key={i} className="text-xs text-red-600">{r._error}</p>
              ))}
            </div>
          )}

          {validRows.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{validRows.length} valid row{validRows.length !== 1 ? 's' : ''} to import:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {validRows.map((r, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-3 text-xs">
                    <div className="font-medium text-slate-800">{r.title}</div>
                    <div className="text-slate-400 font-mono truncate">{r.url}</div>
                    <div className="text-slate-500">{r.issuing_authority} · {r.date_issued} · Tier {r.tier}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
