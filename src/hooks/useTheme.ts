import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

function getSavedTheme(): ThemeMode {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDOM(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
  localStorage.setItem('theme', theme)
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getSavedTheme)

  useEffect(() => {
    applyThemeToDOM(theme)
  }, [theme])

  useEffect(() => {
    const handleSync = () => {
      const current = getSavedTheme()
      setThemeState(current)
      applyThemeToDOM(current)
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('theme-change', handleSync)

    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('theme-change', handleSync)
    }
  }, [])

  const setTheme = (newTheme: ThemeMode) => {
    applyThemeToDOM(newTheme)
    setThemeState(newTheme)
    window.dispatchEvent(new Event('theme-change'))
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return { theme, toggleTheme, setTheme, isDark: theme === 'dark' }
}
