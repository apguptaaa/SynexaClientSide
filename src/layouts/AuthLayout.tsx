import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
  title?: string
}

export function AuthLayout({ children, title = 'Welcome' }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 30%), linear-gradient(135deg, #0f172a 0%, #111827 28%, #1f2937 100%)',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '32rem',
          padding: '2rem',
          borderRadius: '1.5rem',
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.22)',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img
            src="/assets/logos/synexa-logo.svg"
            alt="Synexa logo"
            width={64}
            height={64}
            style={{ display: 'block' }}
          />
        </div>
        <h2
          style={{
            textAlign: 'center',
            marginTop: 0,
            marginBottom: '1.5rem',
            color: '#f8fafc',
            fontSize: '2rem',
            letterSpacing: '-0.05em',
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
