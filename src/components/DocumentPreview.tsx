'use client'

import { useState } from 'react'

interface Props {
  url: string
  archiveUrl?: string
  mediaType?: string
  title: string
}

/**
 * Expandable inline preview panel for evidence cards.
 * Uses iframe for PDFs and documents. Falls back to archive URL if available.
 * Many sites block iframe embedding — we surface a direct-link fallback in that case.
 */
export function DocumentPreview({ url, archiveUrl, mediaType, title }: Props) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)

  // Only show for previewable types
  const previewable = mediaType === 'document' || mediaType === 'webpage' || !mediaType
  if (!previewable) return null

  const isPdf = url.toLowerCase().includes('.pdf')
  const previewUrl = isPdf ? url : (archiveUrl ?? url)

  return (
    <div className="mt-2">
      <button
        onClick={() => { setOpen(o => !o); setFailed(false) }}
        className="text-[11px] text-slate-400 hover:text-[#2A7DE1] transition-colors flex items-center gap-1"
      >
        <span>{open ? '▲' : '▼'}</span>
        <span>{open ? 'Close preview' : 'Preview source'}</span>
      </button>

      {open && (
        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          {failed ? (
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-slate-500 mb-3">
                This source blocks inline preview — open it directly or view the archived copy.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-[#2A7DE1] text-white rounded-lg hover:bg-[#1A4A8A] transition-colors"
                >
                  Open source ↗
                </a>
                {archiveUrl && (
                  <a
                    href={archiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:border-slate-400 transition-colors"
                  >
                    🗃 Archived copy ↗
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
                <span className="text-[11px] text-slate-400 truncate flex-1 mr-2">{title}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#2A7DE1] hover:underline whitespace-nowrap shrink-0"
                >
                  Open in new tab ↗
                </a>
              </div>
              <iframe
                src={previewUrl}
                title={title}
                className="w-full"
                style={{ height: '480px', border: 'none' }}
                onError={() => setFailed(true)}
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
