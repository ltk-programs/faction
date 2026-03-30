import { ImageResponse } from 'next/og'
import { getFactFile } from '@/lib/content'

// Node.js runtime required — getFactFile() uses fs (dev) or KV fetch (prod),
// neither of which is reliably available on the Edge runtime
export const runtime = 'nodejs'
export const alt = 'FACTION fact file'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  open:       { bg: 'rgba(239,68,68,0.15)',  text: '#fca5a5', label: 'Open' },
  developing: { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', label: 'Developing' },
  resolved:   { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', label: 'Resolved' },
}

const CATEGORY_ICONS: Record<string, string> = {
  'Criminal Justice': '⚖️',
  'Aviation Safety':  '✈️',
  'Sports Analytics': '🏈',
  'Corporate Accountability': '🏢',
  'Government':       '🏛️',
  'Public Health':    '🏥',
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ff = await getFactFile(slug)

  if (!ff) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', backgroundColor: '#0D1F3C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '32px' }}>Not found</span>
      </div>,
      { ...size },
    )
  }

  const status = STATUS_COLORS[ff.status] ?? STATUS_COLORS.open
  const primaryCategory = Array.isArray(ff.category) ? ff.category[0] : ff.category
  const categoryIcon = CATEGORY_ICONS[primaryCategory] ?? '📋'
  const evidenceCount = ff.evidence.length
  const tier1Count = ff.evidence.filter(e => e.tier === 1).length
  const summary = ff.summary.length > 180 ? ff.summary.slice(0, 177) + '…' : ff.summary

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0D1F3C',
          padding: '56px 64px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top row: wordmark + status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#2A7DE1', fontSize: '32px', fontWeight: 900 }}>F</span>
            <span style={{ color: '#64748b', fontSize: '22px', fontWeight: 700, letterSpacing: '0.1em' }}>
              FACTION
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                backgroundColor: status.bg,
                color: status.text,
                fontSize: '16px',
                fontWeight: 600,
                padding: '6px 16px',
                borderRadius: '999px',
                border: `1px solid ${status.text}40`,
              }}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Middle: title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>{categoryIcon}</span>
            <span style={{ color: '#64748b', fontSize: '18px', fontWeight: 500 }}>{ff.category}</span>
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: ff.title.length > 40 ? '44px' : '52px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {ff.title}
          </div>
          {ff.subtitle && (
            <div style={{ color: '#94a3b8', fontSize: '22px', fontWeight: 400, lineHeight: 1.35 }}>
              {ff.subtitle}
            </div>
          )}
          <div style={{ color: '#64748b', fontSize: '18px', lineHeight: 1.5, marginTop: '4px' }}>
            {summary}
          </div>
        </div>

        {/* Bottom: stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 800 }}>{evidenceCount}</span>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Evidence items</span>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: '#1e3a5f' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#2A7DE1', fontSize: '28px', fontWeight: 800 }}>{tier1Count}</span>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Primary sources</span>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: '#1e3a5f' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 800 }}>{ff.timeline.length}</span>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Timeline events</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ color: '#1e3a5f', fontSize: '14px' }}>faction.app</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
