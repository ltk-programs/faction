'use client'

import { useState } from 'react'

interface Props {
  slug: string
  title: string
  summary: string
}

export function ShareFactFileButton({ slug, title, summary }: Props) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://faction.news'
  const pageUrl = `${BASE_URL}/fact/${slug}`
  const shareText = `${title} — primary source evidence on FACTION`
  const shortSummary = summary.slice(0, 140)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = pageUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Native share API (mobile browsers)
  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shortSummary,
          url: pageUrl,
        })
      } catch {
        // User cancelled
      }
      return
    }
    setOpen(v => !v)
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const shareLinks = [
    {
      label: 'Share on X',
      icon: '𝕏',
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`,
    },
    {
      label: 'Share on LinkedIn',
      icon: 'in',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    },
    {
      label: 'Share via Email',
      icon: '✉',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shortSummary}\n\n${pageUrl}`)}`,
    },
  ]

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Copy link */}
        <button
          onClick={copyLink}
          title="Copy link"
          aria-label={copied ? 'Link copied!' : 'Copy link to clipboard'}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            copied
              ? 'border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400'
              : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-400 hover:text-slate-700 dark:hover:border-slate-500 dark:hover:text-slate-300'
          }`}
        >
          {copied ? '✓ Copied' : '⎋ Copy link'}
        </button>

        {/* Share button (opens dropdown or native share) */}
        {hasNativeShare ? (
          <button
            onClick={nativeShare}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-400 hover:text-slate-700 dark:hover:border-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            ↑ Share
          </button>
        ) : (
          <>
            <button
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-label="Share options"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-400 hover:text-slate-700 transition-colors"
            >
              ↑ Share
            </button>
            {open && (
              <>
                {/* Click outside to close */}
                <div
                  className="fixed inset-0 z-40"
                  aria-hidden
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[180px]">
                  {shareLinks.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('mailto') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-base font-bold w-5 text-center text-slate-500 dark:text-slate-400">
                        {link.icon}
                      </span>
                      {link.label}
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
