import { NextRequest, NextResponse } from 'next/server'
import { checkAllLinks, saveLinkCheckResults } from '@/lib/content'

/**
 * GET /api/cron/check-links
 *
 * Called automatically by Vercel Cron (see vercel.json).
 * Also callable manually with the correct CRON_SECRET.
 *
 * Vercel automatically injects `Authorization: Bearer <CRON_SECRET>`
 * on every cron invocation, so this endpoint is protected in production.
 *
 * Note: On Vercel, saveLinkCheckResults writes to /tmp which is ephemeral
 * per function instance. For persistent caching across invocations, add
 * Vercel KV and update saveLinkCheckResults / getLinkCheckResults to use it.
 * See DEPLOYMENT.md for instructions.
 */
export async function GET(request: NextRequest) {
  // Validate the cron secret if set
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const results = await checkAllLinks()
    const checkedAt = new Date().toISOString()
    await saveLinkCheckResults({ checkedAt, results })

    const broken = results.filter(r => !r.ok).length
    console.log(`[cron/check-links] ${results.length} checked, ${broken} broken — ${checkedAt}`)

    return NextResponse.json({
      ok: true,
      checkedAt,
      total: results.length,
      broken,
      results,
    })
  } catch (err) {
    console.error('[cron/check-links] error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
