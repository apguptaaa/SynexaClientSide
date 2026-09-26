import React from 'react'

export function IconBtn({ onClick, title, children, disabled }: {
  onClick?: () => void; title?: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      border: 'none', background: 'none', cursor: disabled ? 'default' : 'pointer',
      padding: 8, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s',
      opacity: disabled ? 0.5 : 1
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(0,0,0,0.07)' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'none' }}
    >
      {children}
    </button>
  )
}
