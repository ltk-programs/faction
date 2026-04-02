'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      className="text-slate-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 text-base leading-none"
    >
      {theme === 'dark' ? '☀︎' : '◑'}
    </button>
  )
}
