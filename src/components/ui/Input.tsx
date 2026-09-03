import React, { useState } from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export function Input({
  label,
  iconLeft,
  iconRight,
  className = '',
  type = 'text',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setShowPassword(!showPassword)
          }}
          className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none flex outline-none"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )
    }
    return iconRight
  }

  const hasRightElement = isPassword || !!iconRight

  return (
    <label className="grid gap-1.5 font-medium text-slate-900 w-full relative group">
      {label ? (
        <span className="text-left text-slate-700 text-[0.85rem] font-semibold">
          {label}
        </span>
      ) : null}
      <div className="relative flex items-center w-full">
        {iconLeft && (
          <div className="absolute left-3 text-slate-400 flex items-center justify-center pointer-events-none">
            {iconLeft}
          </div>
        )}
        <input
          {...props}
          type={inputType}
          className={`w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 
                     text-[0.95rem] outline-none placeholder:text-slate-400
                     focus:border-red-700 focus:ring-1 focus:ring-red-700
                     transition-all text-left ${iconLeft ? 'pl-10' : ''} ${hasRightElement ? 'pr-10' : ''} ${className}`}
        />
        {hasRightElement && (
          <div className="absolute right-3 flex items-center justify-center">
            {renderRightIcon()}
          </div>
        )}
      </div>
    </label>
  )
}
