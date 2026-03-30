import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { ContentPage } from '@/components/ContentPage'

export const metadata: Metadata = {
  title: 'About',
  description: 'What FACTION is, what it is not, and why it exists.',
}

export default function AboutPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), 'content', 'pages', 'about.md'),
    'utf-8'
  )
  return <ContentPage markdown={md} breadcrumb="About" />
}
