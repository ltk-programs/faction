import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { ContentPage } from '@/components/ContentPage'

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'How FACTION selects, tiers, and presents primary source evidence. Source tier definitions, status criteria, and editorial policies.',
}

export default function MethodologyPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), 'content', 'pages', 'methodology.md'),
    'utf-8'
  )
  return <ContentPage markdown={md} breadcrumb="Methodology" />
}
