/**
 * Email sender via Resend REST API — no npm package, just fetch.
 * Set RESEND_API_KEY in your environment to enable.
 */

import { generateUnsubToken } from './subscribers'

const RESEND_API = 'https://api.resend.com/emails'
const FROM = process.env.RESEND_FROM ?? 'FACTION <updates@faction-news.com>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://faction-tawny.vercel.app'

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

interface SendOptions {
  to: string
  subject: string
  html: string
}

async function send(opts: SendOptions): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) return // silently skip if not configured

  await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  })
}

export async function sendUpdateNotification(opts: {
  to: string
  slug: string
  factFileTitle: string
  changeDescription: string
  changeType: string
}): Promise<void> {
  const { to, slug, factFileTitle, changeDescription, changeType } = opts

  const unsubToken = await generateUnsubToken(to, slug)
  const factFileUrl = `${BASE_URL}/fact/${slug}`
  const unsubUrl = `${BASE_URL}/api/unsubscribe?token=${unsubToken}`

  const typeLabel: Record<string, string> = {
    addition: 'New evidence added',
    correction: 'Correction issued',
    update: 'Updated',
    'status-change': 'Status changed',
  }
  const label = typeLabel[changeType] ?? 'Updated'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FACTION Update</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0D1F3C;padding:20px 32px;">
              <span style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:-0.5px;">F FACTION</span>
            </td>
          </tr>

          <!-- Label -->
          <tr>
            <td style="padding:24px 32px 0;">
              <span style="display:inline-block;background:#EAF1FB;color:#1A4A8A;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:4px 10px;border-radius:6px;border:1px solid #C5D8F5;">
                ${label}
              </span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:12px 32px 0;">
              <h1 style="margin:0;font-size:20px;font-weight:800;color:#0D1F3C;line-height:1.3;">
                ${factFileTitle}
              </h1>
            </td>
          </tr>

          <!-- Change description -->
          <tr>
            <td style="padding:12px 32px 0;">
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;background:#f8fafc;border-left:3px solid #2A7DE1;padding:12px 16px;border-radius:0 8px 8px 0;">
                ${changeDescription}
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 32px;">
              <a href="${factFileUrl}" style="display:inline-block;background:#2A7DE1;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
                View fact file →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                You're receiving this because you subscribed to updates for this fact file.
                Primary sources only · No editorial interpretation · No advertising.<br>
                <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe from this topic</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  await send({
    to,
    subject: `[FACTION] ${label}: ${factFileTitle}`,
    html,
  })
}
