import type { MetadataRoute } from 'next'
import { getAllFactFiles } from '@/lib/content'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const factFiles = await getAllFactFiles()

  const factFileEntries: MetadataRoute.Sitemap = factFiles.map(ff => ({
    url: `${BASE_URL}/fact/${ff.slug}`,
    lastModified: new Date(ff.last_updated),
    changeFrequency: ff.status === 'resolved' ? 'monthly' : 'weekly',
    priority: ff.status === 'open' ? 0.9 : 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/transparency`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...factFileEntries,
  ]
}
