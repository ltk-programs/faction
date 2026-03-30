import type { Metadata } from 'next'
import { getAllFactFiles } from '@/lib/content'
import { SubmitForm } from './SubmitForm'

export const metadata: Metadata = {
  title: 'Submit a tip',
  description: 'Suggest a new topic, submit a primary source, or flag a correction for the FACTION editorial team.',
}

interface Props {
  searchParams: Promise<{ slug?: string; type?: string }>
}

export default async function SubmitPage({ searchParams }: Props) {
  const factFiles = await getAllFactFiles()
  const { slug, type } = await searchParams

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <a href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">← Home</a>
      </div>
      <SubmitForm
        factFiles={factFiles}
        prefilledSlug={slug}
        prefilledType={type as 'new_topic' | 'new_evidence' | 'correction' | undefined}
      />
    </div>
  )
}
