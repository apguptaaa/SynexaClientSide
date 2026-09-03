type AvatarProps = {
  src?: string
  alt?: string
  size?: number
  fallback?: string
}

export function Avatar({ src, alt = 'User avatar', size = 40, fallback = 'S' }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#e5e7eb',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        fontWeight: 700,
        color: '#111827',
      }}
    >
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : fallback}
    </div>
  )
}
