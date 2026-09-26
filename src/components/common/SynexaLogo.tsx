/**
 * SynexaLogo — Displays the official Synexa logo image.
 * Supports size, rounded corners, drop shadows, and optional wordmark.
 */
export function SynexaLogo({
  size = 40,
  variant = 'color',
  showWordmark = false,
  className = '',
}: {
  size?: number
  variant?: 'color' | 'white' | 'dark'
  showWordmark?: boolean
  className?: string
}) {
  const isWhite = variant === 'white'

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div
        className="rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(140,8,23,0.2)] transition-transform hover:scale-105 flex items-center justify-center bg-[#780016]"
        style={{ width: size, height: size }}
      >
        <img
          src="/assets/images/synexa-logo.png"
          alt="Synexa Logo"
          className="w-full h-full object-cover"
        />
      </div>

      {showWordmark && (
        <span
          className={`mt-2 font-bold tracking-tight text-center select-none ${
            isWhite ? 'text-[#780016]' : 'text-white'
          }`}
          style={{ fontSize: size * 0.22, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Synexa
        </span>
      )}
    </div>
  )
}
