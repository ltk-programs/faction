import { NextResponse } from 'next/server'
import { kv, isKvConfigured } from '@/lib/kv'

/**
 * POST /api/views/[slug]
 * Privacy-first view counter — no cookies, no fingerprinting, no PII.
 * Just an atomic increment stored in KV. No-ops silently when KV is not configured.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Silently skip in dev (no KV configured)
  if (!isKvConfigured()) {
    return NextResponse.json({ ok: true, views: null })
  }

  try {
    const views = await kv.incr(`faction:views:${slug}`)
    return NextResponse.json({ ok: true, views })
  } catch {
    // Never surface KV errors to the client
    return NextResponse.json({ ok: true, views: null })
  }
}
