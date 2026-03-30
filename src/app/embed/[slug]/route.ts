import { NextRequest } from 'next/server'
import { getFactFile } from '@/lib/content'

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  open:       { bg: '#FFF7ED', text: '#9A3412', dot: '#F97316' },
  developing: { bg: '#EFF6FF', text: '#1E40AF', dot: '#3B82F6' },
  resolved:   { bg: '#F0FDF4', text: '#14532D', dot: '#22C55E' },
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const ff = await getFactFile(slug)
  if (!ff) return new Response('Not found', { status: 404 })

  // Draft embeds are hidden
  if (ff.is_draft) return new Response('Not found', { status: 404 })

  const style = STATUS_STYLES[ff.status] ?? STATUS_STYLES.open
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const statusLabel = ff.status.charAt(0).toUpperCase() + ff.status.slice(1)

  const catHtml = ff.category
    .slice(0, 2)
    .map(cat => `<span class="cat">${escapeHtml(cat)}</span>`)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: #0D1F3C;
      color: #fff;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .brand { font-size: 11px; font-weight: 800; color: #2A7DE1; letter-spacing: 0.05em; }
    .status-badge {
      font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
      background: ${style.bg}; color: ${style.text};
      display: flex; align-items: center; gap: 4px;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: ${style.dot}; }
    .body { padding: 14px; }
    .title { font-size: 15px; font-weight: 800; color: #0D1F3C; line-height: 1.3; margin-bottom: 6px; }
    .summary {
      font-size: 12px; color: #64748b; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
      overflow: hidden; margin-bottom: 10px;
    }
    .meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .cat { font-size: 10px; padding: 2px 7px; border-radius: 999px; background: #f1f5f9; color: #64748b; }
    .cta { margin-left: auto; font-size: 11px; font-weight: 600; color: #2A7DE1; text-decoration: none; white-space: nowrap; }
    .cta:hover { text-decoration: underline; }
    .evidence-count { font-size: 10px; color: #94a3b8; margin-left: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <span class="brand">FACTION</span>
    <span class="status-badge">
      <span class="status-dot"></span>
      ${statusLabel}
    </span>
  </div>
  <div class="body">
    <div class="title">${escapeHtml(ff.title)}</div>
    <div class="summary">${escapeHtml(ff.summary)}</div>
    <div class="meta">
      ${catHtml}
      <span class="evidence-count">${ff.evidence.length} source${ff.evidence.length !== 1 ? 's' : ''}</span>
      <a href="${BASE_URL}/fact/${escapeHtml(ff.slug)}" target="_blank" rel="noopener noreferrer" class="cta">
        View full file &rarr;
      </a>
    </div>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
