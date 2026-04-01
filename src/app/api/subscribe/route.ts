import { NextResponse } from 'next/server'
import { addSubscriber } from '@/lib/subscribers'

export async function POST(req: Request) {
  try {
    const { slug, email } = await req.json() as { slug?: string; email?: string }

    if (!slug || !email) {
      return NextResponse.json({ ok: false, error: 'Missing slug or email.' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email address.' }, { status: 400 })
    }

    await addSubscriber(slug, email)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 })
  }
}
