'use client'

import { useState } from 'react'

interface Props {
  slug: string
  factFileTitle: string
}

export function SubscribeForm({ slug, factFileTitle }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setState('loading')
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email: email.trim() }),
      })
      const data = await res.json() as { ok: boolean; error?: string }

      if (data.ok) {
        setState('success')
      } else {
        setError(data.error ?? 'Something went wrong.')
        setState('error')
      }
    } catch {
      setError('Could not connect. Please try again.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="mt-6 border border-green-200 bg-green-50 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-lg mt-0.5">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-800">You&apos;re subscribed</p>
            <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
              We&apos;ll email you when <span className="font-medium">{factFileTitle}</span> is updated —
              new evidence, corrections, or status changes. Unsubscribe any time from the email.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 border border-slate-200 rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Get updates on this topic
        </span>
      </div>

      <div className="px-5 py-4">
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          Enter your email to be notified when this fact file is updated —
          new primary sources, corrections, or status changes.
          No marketing. No other emails. Unsubscribe any time.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2A7DE1] focus:ring-1 focus:ring-[#2A7DE1] transition-colors"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="px-4 py-2 bg-[#2A7DE1] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4A8A] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {state === 'loading' ? 'Subscribing…' : 'Notify me'}
          </button>
        </form>

        {state === 'error' && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
