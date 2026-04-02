'use client'

import { useState, useEffect, useRef } from 'react'

const NAV_LINKS = [
  { href: '/',            label: 'Topics'      },
  { href: '/timeline',    label: 'Timeline'    },
  { href: '/stats',       label: 'Stats'       },
  { href: '/search',      label: 'Search'      },
  { href: '/submit',      label: 'Submit a tip' },
  { href: '/guide',       label: 'How it works' },
  { href: '/glossary',    label: 'Glossary'    },
  { href: '/methodology', label: 'Methodology' },
  { href: '/about',       label: 'About'       },
  { href: '/transparency', label: 'Transparency' },
  { href: '/sources',     label: 'Sources'     },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef  = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current  && !btnRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="relative sm:hidden">
      {/* Hamburger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        className="text-slate-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 flex flex-col gap-1 items-center justify-center w-8 h-8"
      >
        <span className={`block w-4.5 h-0.5 bg-current rounded transition-all duration-200 ${open ? 'rotate-45 translate-y-1.5' : ''}`} style={{ width: '18px', height: '2px' }} />
        <span className={`block h-0.5 bg-current rounded transition-all duration-200 ${open ? 'opacity-0 scale-x-0' : ''}`} style={{ width: '18px', height: '2px' }} />
        <span className={`block h-0.5 bg-current rounded transition-all duration-200 ${open ? '-rotate-45 -translate-y-1.5' : ''}`} style={{ width: '18px', height: '2px' }} />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        id="mobile-nav-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#0D1F3C] shadow-2xl transform transition-transform duration-300 ease-in-out sm:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#1A4A8A]">
          <span className="font-bold text-white tracking-tight">
            <span className="text-[#2A7DE1] font-black">F</span> FACTION
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-[#1A4A8A]">
          <p className="text-[11px] text-slate-500">Primary sources only · No spin</p>
        </div>
      </div>
    </div>
  )
}
