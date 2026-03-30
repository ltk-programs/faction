import { NextRequest, NextResponse } from 'next/server'
import { getFactFile } from '@/lib/content'

/**
 * GET /out/[slug]/[evidenceId]
 *
 * Privacy-first click tracking for evidence links.
 * - No cookies, no JS tracker, no fingerprinting
 * - Logs a click event server-side to the console (picked up by Vercel logs)
 * - Immediately 302-redirects to the original source URL
 *
 * Use this as the href on external source links to capture engagement data
 * without any client-side tracking code.
 *
 * Vercel log format:
 *   EVIDENCE_CLICK slug=<slug> evidenceId=<id> url=<url>
 *
 * You can query these in Vercel's log drain or Vercel's built-in log explorer.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; evidenceId: string }> }
) {
  const { slug, evidenceId } = await params

  const ff = await getFactFile(slug)
  if (!ff) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const evidence = ff.evidence.find(e => e.id === evidenceId)
  if (!evidence) {
    return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
  }

  // Server-side event log (no client tracking)
  console.log(
    `EVIDENCE_CLICK slug=${slug} evidenceId=${evidenceId} url=${evidence.url} title="${evidence.title}"`
  )

  // 302 redirect to the original source — preserves browser back button
  return NextResponse.redirect(evidence.url, { status: 302 })
}
