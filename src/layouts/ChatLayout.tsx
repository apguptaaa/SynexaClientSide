import type { ReactNode } from 'react'

type ChatLayoutProps = {
  children: ReactNode
  sidebar?: ReactNode
}

export function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '280px 1fr', background: '#f8fafc' }}>
      <aside style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '1rem' }}>
        {sidebar ?? <div>Conversations</div>}
      </aside>
      <main style={{ padding: '1.5rem' }}>{children}</main>
    </div>
  )
}
