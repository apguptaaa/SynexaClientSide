import { WA_GREEN } from '../../utils/constants'
import { seedColor, initials } from '../../utils/chatHelpers'

export function Avatar({ name, src, size = 40, online }: {
  name: string; src?: string | null; size?: number; online?: boolean
}) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {src ? (
        <img src={src} alt={name}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: seedColor(name), color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: size * 0.36, userSelect: 'none',
        }}>
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: online ? WA_GREEN : '#ccc', border: '2px solid #fff',
        }} />
      )}
    </div>
  )
}
