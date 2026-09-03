type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {

  const baseClasses = "px-4 py-3 rounded-[0.9rem] font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"

  const variants = {
    primary: "bg-red-700 hover:bg-red-800 text-white border border-transparent dark:bg-red-700/90 dark:hover:bg-red-600",
    secondary: "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:text-white dark:border-white/10",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent dark:text-gray-300 dark:hover:bg-white/5"
  }

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
