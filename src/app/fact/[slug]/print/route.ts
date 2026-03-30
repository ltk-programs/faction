import { NextRequest } from 'next/server'
import { getFactFile } from '@/lib/content'

const STATUS_LABELS: Record<string, string> = {
  open: 'OPEN',
  developing: 'DEVELOPING',
  resolved: 'RESOLVED',
}

const TIER_LABELS: Record<number, string> = {
  1: 'Tier 1 — Verified official',
  3: 'Tier 3 — Community-verified',
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
  if (ff.is_draft) return new Response('Not found', { status: 404 })

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const evidenceHtml = ff.evidence.map((ev, i) => `
    <div class="evidence-item">
      <div class="evidence-meta">
        #${String(i + 1).padStart(2, '0')}
        <span class="tier-badge tier-${ev.tier}">${escapeHtml(TIER_LABELS[ev.tier] ?? `Tier ${ev.tier}`)}</span>
      </div>
      <div class="evidence-title">${escapeHtml(ev.title)}</div>
      <div class="evidence-meta">${escapeHtml(ev.issuing_authority)} &middot; ${escapeHtml(ev.date_issued)}</div>
      <div class="evidence-url">${escapeHtml(ev.url)}</div>
      ${ev.description ? `<div class="evidence-desc">${escapeHtml(ev.description)}</div>` : ''}
    </div>
  `).join('')

  const timelineHtml = ff.timeline.length > 0 ? `
    <div class="section-head">Timeline (${ff.timeline.length} events)</div>
    ${ff.timeline.map(ev => `
      <div class="timeline-item">
        <div class="timeline-date">${escapeHtml(ev.date)}${ev.time ? ` &middot; ${escapeHtml(ev.time)}` : ''}</div>
        <div class="timeline-title">${escapeHtml(ev.title)}</div>
        <div class="timeline-desc">${escapeHtml(ev.description)}</div>
      </div>
    `).join('')}
  ` : ''

  const claimsHtml = ff.contested_claims.length > 0 ? `
    <div class="section-head">Contested Claims</div>
    ${ff.contested_claims.map(claim => `
      <div class="claimed-claim">
        <div style="font-weight:600;margin-bottom:6pt">${escapeHtml(claim.claim)}</div>
        <div style="font-size:9pt;color:#374151;margin-bottom:4pt">${escapeHtml(claim.context)}</div>
        <div style="font-size:9pt"><strong>Position A:</strong> ${escapeHtml(claim.side_a.position)}</div>
        <div style="font-size:9pt"><strong>Position B:</strong> ${escapeHtml(claim.side_b.position)}</div>
      </div>
    `).join('')}
  ` : ''

  const situationHtml = ff.situation_context ? `
    <div class="section-head">Situation Context</div>
    <p>${escapeHtml(ff.situation_context)}</p>
  ` : ''

  const resolutionHtml = ff.status === 'resolved' && ff.resolution_note ? `
    <div class="section-head">Resolution</div>
    <p>${escapeHtml(ff.resolution_note)}</p>
  ` : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(ff.title)} &mdash; FACTION</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt; line-height: 1.6; color: #111;
      background: white; max-width: 720px; margin: 0 auto; padding: 40px 32px;
    }
    @media screen {
      body { background: #f8fafc; }
      .page { background: white; padding: 48px; box-shadow: 0 0 0 1px #e2e8f0; border-radius: 8px; }
    }
    @media print {
      body { padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
      .page { padding: 0; box-shadow: none; }
      a { color: inherit; }
      h2 { page-break-after: avoid; }
      .evidence-item, .timeline-item { page-break-inside: avoid; }
    }
    .watermark {
      font-family: -apple-system, sans-serif; font-size: 8pt; color: #94a3b8;
      border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .brand { font-weight: 800; color: #0D1F3C; font-size: 10pt; }
    .status { font-size: 8pt; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: #f1f5f9; }
    h1 { font-size: 22pt; font-weight: 700; margin-bottom: 6pt; color: #0D1F3C; line-height: 1.2; }
    .subtitle { font-size: 12pt; color: #64748b; margin-bottom: 16pt; }
    .category { font-size: 8pt; color: #64748b; margin-bottom: 20pt; }
    .section-head {
      font-family: -apple-system, sans-serif; font-size: 8pt; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;
      border-top: 1px solid #e2e8f0; padding-top: 14pt; margin-top: 14pt; margin-bottom: 10pt;
    }
    p { margin-bottom: 8pt; }
    .evidence-item { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10pt; margin-bottom: 8pt; }
    .evidence-title { font-family: -apple-system, sans-serif; font-size: 10pt; font-weight: 600; color: #1e40af; margin-bottom: 3pt; }
    .evidence-meta { font-family: -apple-system, sans-serif; font-size: 8pt; color: #64748b; margin-bottom: 4pt; }
    .evidence-url { font-family: monospace; font-size: 7pt; color: #94a3b8; word-break: break-all; }
    .evidence-desc { font-size: 9.5pt; margin-top: 4pt; }
    .tier-badge { font-family: -apple-system, sans-serif; font-size: 7.5pt; font-weight: 600; padding: 1pt 5pt; border-radius: 3px; margin-left: 6pt; }
    .tier-1 { background: #dbeafe; color: #1e40af; }
    .tier-3 { background: #fef3c7; color: #92400e; }
    .timeline-item { padding: 6pt 0; border-bottom: 1px solid #f1f5f9; }
    .timeline-date { font-family: -apple-system, sans-serif; font-size: 8pt; color: #94a3b8; font-weight: 600; }
    .timeline-title { font-family: -apple-system, sans-serif; font-size: 10pt; font-weight: 600; }
    .timeline-desc { font-size: 9.5pt; color: #374151; margin-top: 2pt; }
    .claimed-claim { background: #fafafa; border-left: 3px solid #e2e8f0; padding: 8pt; margin-bottom: 8pt; }
    .footer {
      font-family: -apple-system, sans-serif; font-size: 8pt; color: #94a3b8;
      border-top: 1px solid #e2e8f0; margin-top: 24pt; padding-top: 12pt; text-align: center;
    }
    .print-bar {
      font-family: system-ui, sans-serif; margin-bottom: 24px;
      display: flex; gap: 12px; align-items: center;
    }
    .print-btn {
      background: #0D1F3C; color: white; border: none; border-radius: 8px;
      padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: system-ui, sans-serif;
    }
    .print-btn:hover { background: #1A4A8A; }
    .back-link { font-size: 13px; color: #2A7DE1; text-decoration: none; }
    .back-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <button class="print-btn" onclick="window.print()">&#128424; Print / Save as PDF</button>
    <a href="/fact/${escapeHtml(ff.slug)}" class="back-link">&larr; Back to fact file</a>
  </div>

  <div class="page">
    <div class="watermark">
      <span>
        <span class="brand">FACTION</span>
        &nbsp;&mdash; Primary sources only &middot; No editorial interpretation
      </span>
      <span>Exported ${exportDate} &middot; ${BASE_URL}/fact/${escapeHtml(ff.slug)}</span>
    </div>

    <span class="status">${escapeHtml(STATUS_LABELS[ff.status] ?? ff.status.toUpperCase())}</span>
    <br><br>
    <h1>${escapeHtml(ff.title)}</h1>
    ${ff.subtitle ? `<div class="subtitle">${escapeHtml(ff.subtitle)}</div>` : ''}
    <div class="category">
      ${escapeHtml(ff.category.join(' \u00b7 '))} &nbsp;|&nbsp;
      ${ff.evidence.length} source${ff.evidence.length !== 1 ? 's' : ''} &nbsp;|&nbsp;
      Updated ${new Date(ff.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>

    <div class="section-head">Summary</div>
    <p>${escapeHtml(ff.summary)}</p>

    ${situationHtml}
    ${resolutionHtml}

    <div class="section-head">Evidence Index (${ff.evidence.length} source${ff.evidence.length !== 1 ? 's' : ''})</div>
    ${evidenceHtml}

    ${timelineHtml}
    ${claimsHtml}

    <div class="section-head">Reopen Threshold</div>
    <p style="font-size:9pt;color:#6b7280">${escapeHtml(ff.reopen_threshold)}</p>

    <div class="footer">
      FACTION &middot; ${BASE_URL} &middot; Primary sources only &middot; No editorial interpretation<br>
      Document exported ${exportDate} &middot; All URLs verified as of that date
    </div>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
