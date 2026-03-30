import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Admin — FACTION' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>
}) {
  const { from, error } = await searchParams
  return (
    <div className="min-h-screen bg-[#0D1F3C] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1 mb-3">
            <span className="text-[#2A7DE1] font-black text-3xl">F</span>
            <span className="text-white font-black text-3xl">ACTION</span>
          </div>
          <p className="text-slate-400 text-sm">Editorial admin</p>
        </div>
        <LoginForm redirectTo={from ?? '/admin'} initialError={error} />
      </div>
    </div>
  )
}
