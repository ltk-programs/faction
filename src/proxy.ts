import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/auth'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }
  const token = req.cookies.get(SESSION_COOKIE)?.value ?? ''
  const valid = await verifySession(token)
  if (!valid) {
    const loginUrl = new URL('/admin/login', req.url)
    if (pathname !== '/admin') loginUrl.searchParams.set('from', pathname)
    const res = NextResponse.redirect(loginUrl)
    if (token) res.cookies.delete(SESSION_COOKIE)
    return res
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
