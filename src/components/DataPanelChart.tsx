'use client'

import React, { useState } from 'react'
import type { DataPanel } from '@/types'

// Pure SVG chart — no external dependencies needed for Phase 0
export function DataPanelChart({ panel }: { panel: DataPanel }) {
  const W = 600
  const H = 280
  const PAD = { top: 20, right: 20, bottom: 60, left: 50 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const allValues = panel.datasets.flatMap(d => d.data)
  const maxVal = Math.max(...allValues, 1)
  const minVal = Math.min(...allValues, 0)
  const range = maxVal - minVal || 1

  const COLORS = ['#2A7DE1', '#E16B2A', '#2AE17D', '#E12A7D']

  if (panel.chart_type === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600">Label</th>
              {panel.datasets.map((ds, i) => (
                <th key={i} className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600">{ds.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.labels.map((label, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-200 px-3 py-2 text-xs text-slate-700">{label}</td>
                {panel.datasets.map((ds, j) => (
                  <td key={j} className="border border-slate-200 px-3 py-2 text-xs text-slate-700">{ds.data[i] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const n = panel.labels.length
  const barWidth = chartW / (n * (panel.datasets.length + 0.5))
  const groupWidth = barWidth * panel.datasets.length

  // Y-axis tick count
  const tickCount = 5
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    minVal + (range * i) / tickCount
  )

  const xScale = (i: number, dsIdx: number) =>
    PAD.left + (i / n) * chartW + (i / n) * (chartW / n - groupWidth) / 2 + dsIdx * barWidth

  const yScale = (v: number) =>
    PAD.top + chartH - ((v - minVal) / range) * chartH

  if (panel.chart_type === 'bar') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label={panel.title}>
        {/* Y-axis grid lines and labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={yScale(t)}
              x2={W - PAD.right} y2={yScale(t)}
              stroke="#e2e8f0" strokeWidth="1"
            />
            <text x={PAD.left - 6} y={yScale(t)} textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="#94a3b8">
              {Number.isInteger(t) ? t : t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {panel.datasets.map((ds, dsIdx) =>
          ds.data.map((val, i) => {
            const x = xScale(i, dsIdx)
            const y = yScale(val)
            const bh = yScale(minVal) - y
            const color = ds.color || COLORS[dsIdx % COLORS.length]
            return (
              <g key={`${dsIdx}-${i}`}>
                <rect x={x} y={y} width={barWidth - 2} height={Math.max(bh, 0)}
                  fill={color} rx="2" opacity="0.85" />
                <text x={x + (barWidth - 2) / 2} y={y - 4} textAnchor="middle"
                  fontSize="9" fill="#475569" fontWeight="600">
                  {val}
                </text>
              </g>
            )
          })
        )}

        {/* X-axis labels */}
        {panel.labels.map((label, i) => (
          <text key={i}
            x={PAD.left + (i + 0.5) * (chartW / n)}
            y={H - PAD.bottom + 14}
            textAnchor="middle" fontSize="10" fill="#64748b">
            {label.length > 12 ? label.slice(0, 12) + '…' : label}
          </text>
        ))}

        {/* Legend */}
        {panel.datasets.map((ds, i) => (
          <g key={i} transform={`translate(${PAD.left + i * 120}, ${H - 18})`}>
            <rect width="10" height="10" fill={ds.color || COLORS[i % COLORS.length]} rx="2" />
            <text x="14" y="9" fontSize="10" fill="#475569">{ds.label}</text>
          </g>
        ))}

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    )
  }

  // Line chart
  const points = (dsIdx: number) =>
    panel.datasets[dsIdx].data
      .map((v, i) => {
        const x = PAD.left + (i / (n - 1 || 1)) * chartW
        const y = yScale(v)
        return `${x},${y}`
      })
      .join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label={panel.title}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={yScale(t)} x2={W - PAD.right} y2={yScale(t)}
            stroke="#e2e8f0" strokeWidth="1" />
          <text x={PAD.left - 6} y={yScale(t)} textAnchor="end" dominantBaseline="middle"
            fontSize="10" fill="#94a3b8">
            {Number.isInteger(t) ? t : t.toFixed(1)}
          </text>
        </g>
      ))}

      {panel.datasets.map((ds, dsIdx) => {
        const color = ds.color || COLORS[dsIdx % COLORS.length]
        return (
          <g key={dsIdx}>
            <polyline points={points(dsIdx)} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
            {ds.data.map((v, i) => {
              const x = PAD.left + (i / (n - 1 || 1)) * chartW
              const y = yScale(v)
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill={color} />
                  <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">{v}</text>
                </g>
              )
            })}
          </g>
        )
      })}

      {panel.labels.map((label, i) => (
        <text key={i}
          x={PAD.left + (i / (n - 1 || 1)) * chartW}
          y={H - PAD.bottom + 14}
          textAnchor="middle" fontSize="10" fill="#64748b">
          {label.length > 10 ? label.slice(0, 10) + '…' : label}
        </text>
      ))}

      {panel.datasets.map((ds, i) => (
        <g key={i} transform={`translate(${PAD.left + i * 120}, ${H - 18})`}>
          <rect width="10" height="3" fill={ds.color || COLORS[i % COLORS.length]} rx="1" y="3.5" />
          <text x="14" y="9" fontSize="10" fill="#475569">{ds.label}</text>
        </g>
      ))}

      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#cbd5e1" strokeWidth="1" />
    </svg>
  )
}

export function DataPanelView({ panel }: { panel: DataPanel }) {
  const [showTable, setShowTable] = useState(false)

  const isAlreadyTable = panel.chart_type === 'table'

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">{panel.title}</h3>
          {panel.description && (
            <p className="text-xs text-slate-500 mt-0.5">{panel.description}</p>
          )}
        </div>
        {!isAlreadyTable && (
          <button
            onClick={() => setShowTable(v => !v)}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
          >
            {showTable ? '📊 Chart' : '⊞ Table'}
          </button>
        )}
      </div>

      {/* Chart or table view */}
      <div className="p-4">
        {showTable && !isAlreadyTable ? (
          <RawDataTable panel={panel} />
        ) : (
          <DataPanelChart panel={panel} />
        )}
      </div>

      {/* Methodology footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-1">
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-800 select-none flex items-center gap-1">
            <span className="group-open:rotate-90 inline-block transition-transform">▶</span>
            Methodology & calculation
          </summary>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed pl-3 border-l-2 border-slate-200">
            {panel.methodology_note}
          </p>
        </details>
        <div className="text-xs">
          <a href={panel.data_source_url} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline">
            ↗ Primary data source
          </a>
        </div>
      </div>
    </div>
  )
}

// Raw data table — shown when user toggles chart → table view
function RawDataTable({ panel }: { panel: DataPanel }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600">Label</th>
            {panel.datasets.map((ds, i) => (
              <th key={i} className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600">
                {ds.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {panel.labels.map((label, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border border-slate-200 px-3 py-2 text-xs text-slate-700 font-medium">{label}</td>
              {panel.datasets.map((ds, j) => (
                <td key={j} className="border border-slate-200 px-3 py-2 text-xs text-slate-700 font-mono">
                  {ds.data[i] !== undefined ? ds.data[i] : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
