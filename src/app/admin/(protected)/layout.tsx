import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifySession } from '@/lib/auth'
import { LogoutButton } from './LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? ''
  const valid = await verifySession(token)
  if (!valid) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-[#0D1F3C] border-b border-[#1A4A8A] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/admin" className="flex items-center gap-1.5">
            <span className="text-[#2A7DE1] font-black text-base">F</span>
            <span className="text-white text-sm font-semibold tracking-tight">FACTION Admin</span>
          </a>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a href="/" className="text-slate-400 hover:text-slate-200 transition-colors" target="_blank" rel="noopener noreferrer">
            View site ↗
          </a>
          <span className="text-slate-700">|</span>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  )
}
