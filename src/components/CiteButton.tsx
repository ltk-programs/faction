'use client'

import { useState } from 'react'
import type { Evidence } from '@/types'

interface Props {
  evidence: Evidence
  factFileTitle: string
}

type Format = 'apa' | 'mla' | 'chicago'

function buildCitation(e: Evidence, factFileTitle: string, format: Format): string {
  const year = e.date_issued ? e.date_issued.slice(0, 4) : 'n.d.'
  const fullDate = e.date_issued
    ? new Date(e.date_issued + 'T12:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'n.d.'
  const shortDate = e.date_issued
    ? new Date(e.date_issued + 'T12:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : 'n.d.'
  const accessDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const authority = e.issuing_authority
  const title = e.title
  const url = e.url

  switch (format) {
    case 'apa':
      return `${authority}. (${year}). ${title}. Retrieved ${accessDate}, from ${url}`
    case 'mla':
      return `"${title}." ${authority}, ${shortDate}, ${url}. Accessed ${accessDate}.`
    case 'chicago':
      return `${authority}. "${title}." ${fullDate}. ${url}.`
  }
}

export function CiteButton({ evidence, factFileTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<Format | null>(null)

  async function copy(format: Format) {
    const text = buildCitation(evidence, factFileTitle, format)
    await navigator.clipboard.writeText(text)
    setCopied(format)
    setTimeout(() => setCopied(null), 2000)
  }

  const formats: { key: Format; label: string }[] = [
    { key: 'apa', label: 'APA' },
    { key: 'mla', label: 'MLA' },
    { key: 'chicago', label: 'Chicago' },
  ]

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-400 hover:border-[#2A7DE1] hover:text-[#2A7DE1] transition-colors whitespace-nowrap"
        aria-label="Copy citation"
      >
        Cite ↗
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-full mt-1.5 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-lg p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Copy citation
            </p>

            {formats.map(({ key, label }) => {
              const text = buildCitation(evidence, factFileTitle, key)
              const isCopied = copied === key
              return (
                <div key={key} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-500">{label}</span>
                    <button
                      onClick={() => copy(key)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors font-medium ${
                        isCopied
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#2A7DE1] hover:text-[#2A7DE1]'
                      }`}
                    >
                      {isCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 leading-relaxed font-mono break-words">
                    {text}
                  </p>
                </div>
              )
            })}

            <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
              Source authenticated by FACTION editorial team.{' '}
              <a href="/methodology" className="text-[#2A7DE1] hover:underline">
                Our standards →
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  )
}
