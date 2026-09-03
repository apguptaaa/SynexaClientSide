export function Loader() {
  return (
    <div
      aria-label="Loading"
      style={{
        width: '2.25rem',
        height: '2.25rem',
        border: '3px solid rgba(148, 163, 184, 0.35)',
        borderTopColor: '#111827',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}
