import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { ContentPage } from '@/components/ContentPage'

export const metadata: Metadata = {
  title: 'Transparency',
  description: 'Funding, conflicts of interest, known limitations, and corrections policy.',
}

export default function TransparencyPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), 'content', 'pages', 'transparency.md'),
    'utf-8'
  )
  return <ContentPage markdown={md} breadcrumb="Transparency" />
}
