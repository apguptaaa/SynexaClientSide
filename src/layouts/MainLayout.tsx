import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from '../components/layout/Sidebar'
import { Menu } from 'lucide-react'

type MainLayoutProps = {
  title?: string
  children: ReactNode
}

export function MainLayout({ title, children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="main-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="main-content-wrapper">
        <header className="top-header">
          <button
            className="hamburger-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="header-title">
            <strong>{title ?? 'Synexa'}</strong>
          </div>
        </header>

        <main style={{ padding: '2rem 1.5rem', maxWidth: '72rem', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
