import type { ReactNode } from 'react'

type DropdownProps = {
  trigger: ReactNode
  children: ReactNode
}

export function Dropdown({ trigger, children }: DropdownProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, background: '#ffffff', borderRadius: '0.75rem', padding: '0.75rem', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)', minWidth: '12rem' }}>
        {children}
      </div>
    </div>
  )
}
