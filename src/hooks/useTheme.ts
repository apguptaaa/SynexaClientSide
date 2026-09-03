import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateTheme = () => setTheme(mediaQuery.matches ? 'dark' : 'light')

    updateTheme()
    mediaQuery.addEventListener?.('change', updateTheme)

    return () => mediaQuery.removeEventListener?.('change', updateTheme)
  }, [])

  return { theme }
}
