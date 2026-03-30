/**
 * Renders a Markdown content page with FACTION styling.
 * Parses the Markdown manually (no remark/unified dependency needed)
 * by converting to HTML-like sections for Next.js rendering.
 *
 * Supported elements: h1, h2, h3, p, ul/li, ol/li, hr, strong, em,
 * inline code, links, blockquotes.
 */

import Link from 'next/link'

// ─── Inline parser ────────────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Patterns: **bold**, *em*, `code`, [text](url)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[(.+?)\]\((.+?)\))/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index))
    }
    if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold text-slate-800">{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={match.index} className="italic">{match[3]}</em>)
    } else if (match[4]) {
      parts.push(<code key={match.index} className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">{match[4]}</code>)
    } else if (match[5] && match[6]) {
      const href = match[6]
      const label = match[5]
      if (href.startsWith('/')) {
        parts.push(<Link key={match.index} href={href} className="text-[#2A7DE1] hover:underline">{label}</Link>)
      } else {
        parts.push(<a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="text-[#2A7DE1] hover:underline">{label}</a>)
      }
    }
    lastIdx = regex.lastIndex
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx))
  }

  return parts
}

// ─── Block parser ─────────────────────────────────────────────────────────────

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'hr' }
  | { type: 'blockquote'; text: string }

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      i++
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      i++
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() })
      i++
    } else if (line.startsWith('---')) {
      blocks.push({ type: 'hr' })
      i++
    } else if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', text: line.slice(2) })
      i++
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push({ type: 'ul', items })
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
    } else if (line.trim() !== '') {
      // Paragraph — collect until blank line
      const paras: string[] = []
      while (i < lines.length && lines[i].trim() !== '') {
        paras.push(lines[i])
        i++
      }
      blocks.push({ type: 'p', text: paras.join(' ') })
    } else {
      i++
    }
  }

  return blocks
}

// ─── Render ───────────────────────────────────────────────────────────────────

function RenderBlock({ block, idx }: { block: Block; idx: number }) {
  switch (block.type) {
    case 'h1':
      return <h1 className="text-3xl font-black text-[#0D1F3C] tracking-tight mt-2 mb-6">{parseInline(block.text)}</h1>
    case 'h2':
      return <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3 pt-6 border-t border-slate-100">{parseInline(block.text)}</h2>
    case 'h3':
      return <h3 className="text-base font-semibold text-slate-700 mt-6 mb-2">{parseInline(block.text)}</h3>
    case 'p':
      return <p className="text-slate-600 leading-relaxed mb-4">{parseInline(block.text)}</p>
    case 'ul':
      return (
        <ul className="list-disc list-outside ml-5 space-y-1.5 mb-4">
          {block.items.map((item, j) => (
            <li key={j} className="text-slate-600 leading-relaxed">{parseInline(item)}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="list-decimal list-outside ml-5 space-y-1.5 mb-4">
          {block.items.map((item, j) => (
            <li key={j} className="text-slate-600 leading-relaxed">{parseInline(item)}</li>
          ))}
        </ol>
      )
    case 'hr':
      return <hr key={idx} className="border-slate-200 my-8" />
    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-[#2A7DE1] pl-4 italic text-slate-500 my-4">
          {parseInline(block.text)}
        </blockquote>
      )
  }
}

interface Props {
  markdown: string
  breadcrumb: string
}

export function ContentPage({ markdown, breadcrumb }: Props) {
  const blocks = parseBlocks(markdown)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link href="/" className="hover:text-[#2A7DE1] transition-colors">FACTION</Link>
        <span>/</span>
        <span className="text-slate-600">{breadcrumb}</span>
      </div>

      <article>
        {blocks.map((block, idx) => (
          <RenderBlock key={idx} block={block} idx={idx} />
        ))}
      </article>

      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-400">
        <Link href="/methodology" className="hover:text-slate-600 hover:underline">Methodology</Link>
        <Link href="/about" className="hover:text-slate-600 hover:underline">About</Link>
        <Link href="/transparency" className="hover:text-slate-600 hover:underline">Transparency</Link>
        <Link href="/submit" className="hover:text-slate-600 hover:underline">Submit a tip</Link>
      </div>
    </div>
  )
}
