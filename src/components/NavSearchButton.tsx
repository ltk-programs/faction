'use client'

import { useCommandPalette } from './CommandPalette'

/**
 * Search button in the global nav.
 * Opens the Cmd+K command palette.
 * Must be a separate 'use client' component because layout.tsx is a server component.
 */
export function NavSearchButton() {
  const { open } = useCommandPalette()

  return (
    <button
      onClick={open}
      aria-label="Search (⌘K)"
      className="flex items-center gap-2 text-xs text-slate-400 border border-slate-600 hover:border-slate-400 hover:text-slate-200 rounded-lg px-3 py-1.5 transition-colors bg-[#0D1F3C] hover:bg-[#1A4A8A]"
    >
      <span className="text-base leading-none">⌕</span>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden md:inline font-mono text-[10px] text-slate-500 border border-slate-700 rounded px-1 py-0.5">⌘K</kbd>
    </button>
  )
}
