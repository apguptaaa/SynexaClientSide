type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#4b5563' }}>
      <h3 style={{ margin: '0 0 0.5rem' }}>{title}</h3>
      {description ? <p style={{ margin: 0 }}>{description}</p> : null}
    </div>
  )
}
