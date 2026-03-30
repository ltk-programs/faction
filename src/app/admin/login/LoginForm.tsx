'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  redirectTo: string
  initialError?: string
}

export function LoginForm({ redirectTo, initialError }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(initialError)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value
    setError(undefined)
    startTransition(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.replace(redirectTo)
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Incorrect password')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          autoFocus
          disabled={isPending}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2A7DE1] focus:ring-1 focus:ring-[#2A7DE1] text-sm disabled:opacity-60"
          placeholder="Enter admin password"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-[#2A7DE1] text-white font-semibold text-sm hover:bg-[#1A4A8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Signing in…' : 'Sign in →'}
      </button>

      <p className="text-center text-xs text-slate-600 pt-2">
        Set <code className="text-slate-500">ADMIN_PASSWORD</code> and <code className="text-slate-500">AUTH_SECRET</code> in your environment
      </p>
    </form>
  )
}
