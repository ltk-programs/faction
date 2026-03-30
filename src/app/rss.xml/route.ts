import { getAllFactFiles } from '@/lib/content'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    open: '[OPEN] ',
    developing: '[DEVELOPING] ',
    resolved: '[RESOLVED] ',
  }
  return map[status] ?? ''
}

export async function GET() {
  const files = await getAllFactFiles()

  // Sort by most recently updated
  const sorted = [...files].sort(
    (a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
  )

  const items = sorted.map(ff => {
    const url     = `${BASE_URL}/fact/${ff.slug}`
    const title   = escapeXml(`${statusLabel(ff.status)}${ff.title}`)
    const summary = escapeXml(ff.summary)
    const cats    = ff.category.map(c => `<category>${escapeXml(c)}</category>`).join('')
    const pubDate = new Date(ff.last_updated).toUTCString()

    return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${summary}</description>
      <pubDate>${pubDate}</pubDate>
      ${cats}
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FACTION — Facts First</title>
    <link>${BASE_URL}</link>
    <description>Primary-source evidence on the topics that matter. No editorial spin — just the record.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/opengraph-image</url>
      <title>FACTION</title>
      <link>${BASE_URL}</link>
    </image>
${items.join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
