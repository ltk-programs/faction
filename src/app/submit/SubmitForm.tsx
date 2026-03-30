'use client'

import { useState, useTransition, useRef } from 'react'
import { submitSuggestion } from '@/lib/actions'
import type { FactFileSummary, SubmissionType } from '@/types'

const TYPE_OPTIONS: { value: SubmissionType; label: string; desc: string }[] = [
  { value: 'new_topic',   label: '📌 New topic',   desc: 'Suggest a new fact file we should cover' },
  { value: 'new_evidence', label: '🔗 New evidence', desc: 'Add a primary source to an existing fact file' },
  { value: 'correction',  label: '⚠️ Correction',   desc: 'Flag a factual error, outdated link, or mislabelled source' },
]

interface Props {
  factFiles: FactFileSummary[]
  prefilledSlug?: string
  prefilledType?: SubmissionType
}

export function SubmitForm({ factFiles, prefilledSlug, prefilledType }: Props) {
  const [type, setType]         = useState<SubmissionType>(prefilledType ?? 'new_topic')
  const [isPending, startTrans] = useTransition()
  const [charCounts, setChar]   = useState<Record<string, number>>({})
  const formRef                 = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTrans(async () => { await submitSuggestion(data) })
  }

  function trackChars(name: string, value: string) {
    setChar(prev => ({ ...prev, [name]: value.length }))
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Submit a suggestion</h1>
      <p className="text-sm text-slate-500 mb-6">
        All submissions enter a queue reviewed by the editorial team. Only verified primary sources are published.
      </p>

      {/* Editorial standards notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <strong>Editorial review required.</strong>{' '}
        We only publish primary sources — official government documents, court filings, peer-reviewed studies,
        verified footage. No secondhand news articles. No opinion pieces. Expect a response within 5 business days.
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="type" value={type} />

        {/* Type selector */}
        <fieldset>
          <legend className="block text-sm font-medium text-slate-700 mb-2">What are you submitting?</legend>
          <div className="grid gap-2">
            {TYPE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  type === opt.value
                    ? 'border-[#2A7DE1] bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="_type_selector"
                  value={opt.value}
                  checked={type === opt.value}
                  onChange={() => setType(opt.value)}
                  className="mt-0.5 accent-[#2A7DE1]"
                />
                <div>
                  <span className="text-sm font-medium text-slate-800">{opt.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* ── New topic ────────────────────────────────────────────────────── */}
        {type === 'new_topic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Topic title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="topic_title"
                required
                maxLength={200}
                placeholder="e.g. NATO Article 5 invocations — historical record"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Why this topic?{' '}
                <span className="text-slate-400 font-normal">
                  ({charCounts['topic_description'] ?? 0}/500)
                </span>
              </label>
              <textarea
                name="topic_description"
                rows={3}
                maxLength={500}
                onChange={e => trackChars('topic_description', e.target.value)}
                placeholder="Why is this topic important? What primary sources exist for it?"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1] resize-none"
              />
            </div>
          </div>
        )}

        {/* ── New evidence ─────────────────────────────────────────────────── */}
        {type === 'new_evidence' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Which fact file? <span className="text-red-500">*</span>
              </label>
              <select
                name="existing_slug"
                required
                defaultValue={prefilledSlug ?? ''}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1] bg-white"
              >
                <option value="" disabled>Select a fact file…</option>
                {factFiles.map(ff => (
                  <option key={ff.slug} value={ff.slug}>
                    {ff.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Evidence title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="evidence_title"
                required
                maxLength={200}
                placeholder="e.g. DOJ press release — federal indictment unsealed"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL to primary source <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="evidence_url"
                required
                placeholder="https://www.justice.gov/…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1] font-mono text-xs"
              />
              <p className="text-xs text-slate-400 mt-1">Must be a direct link to the official source — not a news article about it.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Issuing authority <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="evidence_source"
                placeholder="e.g. U.S. Department of Justice"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1]"
              />
            </div>
          </div>
        )}

        {/* ── Correction ───────────────────────────────────────────────────── */}
        {type === 'correction' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Which fact file? <span className="text-slate-400 font-normal">(optional — helps us route faster)</span>
              </label>
              <select
                name="existing_slug"
                defaultValue={prefilledSlug ?? ''}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1] bg-white"
              >
                <option value="">Not sure / multiple files</option>
                {factFiles.map(ff => (
                  <option key={ff.slug} value={ff.slug}>
                    {ff.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Describe the correction{' '}
                <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">
                  ({charCounts['correction_detail'] ?? 0}/1000)
                </span>
              </label>
              <textarea
                name="correction_detail"
                required
                rows={5}
                maxLength={1000}
                onChange={e => trackChars('correction_detail', e.target.value)}
                placeholder="Which source is wrong? What does it say vs. what the primary source actually says? Include a working URL if available."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1] resize-none"
              />
            </div>
          </div>
        )}

        {/* Always present: additional notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Additional notes{' '}
            <span className="text-slate-400 font-normal">
              (optional · {charCounts['submitter_note'] ?? 0}/300)
            </span>
          </label>
          <textarea
            name="submitter_note"
            rows={2}
            maxLength={300}
            onChange={e => trackChars('submitter_note', e.target.value)}
            placeholder="Any context that would help the editorial team process this submission."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A7DE1] resize-none"
          />
        </div>

        {/* Tier standards reminder */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-600">Source tier standards</p>
          <p><span className="font-semibold text-slate-700">Tier 1</span> — Government documents, court filings, peer-reviewed studies, official institutional reports. These are published without a disclaimer.</p>
          <p><span className="font-semibold text-slate-700">Tier 3</span> — Verified citizen footage, official social media posts, released-but-unverified documents. Published with a clear Tier 3 label.</p>
          <p className="text-slate-400">News articles, op-eds, and secondhand reporting are never published regardless of tier.</p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-[#2A7DE1] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4A8A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Submitting…' : 'Submit for editorial review →'}
        </button>
      </form>
    </div>
  )
}
