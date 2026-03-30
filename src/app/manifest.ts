import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FACTION — Facts First',
    short_name: 'FACTION',
    description: 'Primary-source evidence on the topics that matter. Facts first.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D1F3C',
    theme_color: '#0D1F3C',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['news', 'education', 'reference'],
    shortcuts: [
      {
        name: 'Search',
        short_name: 'Search',
        description: 'Search all fact files',
        url: '/search',
      },
      {
        name: 'Submit a tip',
        short_name: 'Submit',
        description: 'Submit a primary source or correction',
        url: '/submit',
      },
    ],
  }
}
