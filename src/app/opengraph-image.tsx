import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FACTION — Primary-source evidence on the topics that matter'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
          padding: '64px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top: wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#2A7DE1', fontSize: '42px', fontWeight: 900 }}>F</span>
          <span style={{ color: '#ffffff', fontSize: '32px', fontWeight: 700, letterSpacing: '0.12em' }}>
            FACTION
          </span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Facts First.
          </div>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '28px',
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: '720px',
            }}
          >
            Primary-source evidence on the topics that matter. No editorial spin — just documents.
          </div>
        </div>

        {/* Bottom: badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {['Government records', 'Court filings', 'Official reports'].map(label => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(42,125,225,0.15)',
                border: '1px solid rgba(42,125,225,0.4)',
                borderRadius: '999px',
                padding: '8px 20px',
                color: '#93c5fd',
                fontSize: '18px',
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
