import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, SESSION_MAX_AGE, generateSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('[auth] ADMIN_PASSWORD env var is not set')
      return NextResponse.json({ error: 'Auth not configured on this server' }, { status: 500 })
    }

    // Small constant delay to limit brute-force
    await new Promise(r => setTimeout(r, 200 + Math.random() * 100))

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const token = await generateSessionToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
