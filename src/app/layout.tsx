import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getAllFactFiles } from '@/lib/content'
import { CommandPaletteProvider } from '@/components/CommandPalette'
import { NavSearchButton } from '@/components/NavSearchButton'
import { Analytics } from '@/components/Analytics'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: 'FACTION — Facts First',
    template: '%s — FACTION',
  },
  description: 'Primary-source evidence on the topics that matter. Facts first. Arguments second.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    siteName: 'FACTION',
    title: 'FACTION — Facts First',
    description: 'Primary-source evidence on the topics that matter. No editorial spin — just documents.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FACTION — Facts First',
    description: 'Primary-source evidence on the topics that matter. No editorial spin — just documents.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    types: {
      'application/rss+xml': `${BASE_URL}/rss.xml`,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FACTION',
  },
  formatDetection: {
    telephone: false,
  },
}

// Viewport must be a separate export in Next.js 15+
export const viewport: Viewport = {
  themeColor: '#0D1F3C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Loaded server-side once per request and passed down to the client palette
  const factFiles = await getAllFactFiles()

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CommandPaletteProvider factFiles={factFiles}>
          {/* Skip to main content — keyboard / screen reader accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#2A7DE1] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
          >
            Skip to main content
          </a>

          {/* Global nav */}
          <header className="bg-[#0D1F3C] text-white sticky top-0 z-40 border-b border-[#1A4A8A]" role="banner">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight" aria-label="FACTION home">
                <span className="text-[#2A7DE1] font-black text-xl" aria-hidden="true">F</span>
                <span>FACTION</span>
              </a>

              <nav className="flex items-center gap-3 text-sm" aria-label="Main navigation">
                <a href="/" className="text-slate-300 hover:text-white transition-colors hidden sm:block">
                  Topics
                </a>
                <a href="/timeline" className="text-slate-300 hover:text-white transition-colors hidden sm:block text-xs">
                  Timeline
                </a>
                <a href="/methodology" className="text-slate-300 hover:text-white transition-colors hidden sm:block text-xs">
                  Methodology
                </a>
                <a href="/submit" className="text-slate-300 hover:text-white transition-colors hidden sm:block text-xs">
                  Submit
                </a>

                {/* Search button — opens Cmd+K palette */}
                <NavSearchButton />
              </nav>
            </div>
          </header>

          <main className="flex-1" id="main-content">
            {children}
          </main>

          <footer className="mt-auto border-t border-slate-200 bg-white">
            <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-slate-400">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="font-medium text-slate-500">FACTION</span>
                <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer navigation">
                  <a href="/search" className="hover:text-slate-600 transition-colors">Search</a>
                  <a href="/methodology" className="hover:text-slate-600 transition-colors">Methodology</a>
                  <a href="/about" className="hover:text-slate-600 transition-colors">About</a>
                  <a href="/transparency" className="hover:text-slate-600 transition-colors">Transparency</a>
                  <a href="/sources" className="hover:text-slate-600 transition-colors">Sources</a>
                  <a href="/submit" className="hover:text-slate-600 transition-colors">Submit a tip</a>
                  <a href="/rss.xml" className="hover:text-slate-600 transition-colors">RSS</a>
                </nav>
              </div>
              <p className="mt-3 text-slate-400">Primary sources only · No editorial interpretation · No advertising</p>
            </div>
          </footer>
        </CommandPaletteProvider>
        <Analytics />
      </body>
    </html>
  )
}
