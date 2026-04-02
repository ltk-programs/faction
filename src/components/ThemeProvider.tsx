'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // On mount, read stored preference or system preference
  useEffect(() => {
    const stored = localStorage.getItem('faction-theme') as Theme | null
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const resolved = stored ?? system
    setTheme(resolved)
    applyTheme(resolved)
    setMounted(true)
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
    localStorage.setItem('faction-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'light', toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
