'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/admin/login')
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
