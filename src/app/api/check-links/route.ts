import { NextResponse } from 'next/server'
import { checkAllLinks, saveLinkCheckResults } from '@/lib/content'

// POST /api/check-links — runs a live check and saves results to disk
export async function POST() {
  try {
    const results = await checkAllLinks()
    const checkedAt = new Date().toISOString()
    await saveLinkCheckResults({ checkedAt, results })
    return NextResponse.json({ ok: true, checkedAt, count: results.length })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// GET /api/check-links — returns cached results
export async function GET() {
  const { getLinkCheckResults } = await import('@/lib/content')
  const cached = await getLinkCheckResults()
  if (!cached) {
    return NextResponse.json({ ok: false, error: 'No check run yet' }, { status: 404 })
  }
  return NextResponse.json(cached)
}
