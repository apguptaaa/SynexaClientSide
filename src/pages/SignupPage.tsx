import React, { useState, useEffect } from 'react'
import { SynexaLogo } from '../components/common/SynexaLogo'
import { BACKEND_URL, GOOGLE_CLIENT_ID } from '../constants/config'



const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      localStorage.setItem('accessToken', data.accessToken)

      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      window.location.href = '/home'
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during registration')
      } else {
        setError('An error occurred during registration')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let timer: any
    const initGoogle = () => {
      const google = (window as any).google
      if (!google?.accounts?.id) {
        timer = setTimeout(initGoogle, 200)
        return
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          setGoogleLoading(true)
          setError('')
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: response.credential })
            })

            let data: any = {}
            const text = await res.text()
            try {
              data = text ? JSON.parse(text) : {}
            } catch {
              data = {}
            }

            if (!res.ok) {
              throw new Error(data.message || `Server returned ${res.status}: ${res.statusText || 'Google signup route not found'}`)
            }

            localStorage.setItem('accessToken', data.accessToken)
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken)
            }

            window.location.href = '/home'
          } catch (err: unknown) {
            if (err instanceof Error) {
              setError(err.message || 'Google signup failed')
            } else {
              setError('Google signup failed')
            }
          } finally {
            setGoogleLoading(false)
          }
        }
      })

      const container = document.getElementById('google-signup-btn')
      if (container) {
        container.innerHTML = ''
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signup_with',
          shape: 'rectangular',
          width: 380,
          logo_alignment: 'left'
        })
      }
    }

    initGoogle()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fc] font-sans">
      {/* Left Brand Panel (Desktop only) */}
      <div className="hidden lg:flex w-[50%] xl:w-[52%] bg-gradient-to-br from-[#2563eb] via-[#a31222] to-[#680410] text-white relative overflow-hidden flex-col justify-between p-12 select-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex items-center justify-center">
            <SynexaLogo size={44} variant="white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Synexa</span>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[0.72rem] font-bold tracking-wider uppercase mb-5 text-blue-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Join thousands of teams
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.12] tracking-[-0.02em] text-white mb-4">
            Build your team workspace in seconds.
          </h1>

          <p className="text-blue-100/80 text-sm xl:text-base font-normal leading-relaxed mb-8 max-w-md">
            Direct messaging, channels, video meetings, and encrypted file sharing all in one seamless application.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="text-white font-bold text-xs mb-0.5">End-to-End Encrypted</div>
              <div className="text-red-200 text-[0.72rem]">256-bit AES protection</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="text-white font-bold text-xs mb-0.5">HD Audio & Video</div>
              <div className="text-red-200 text-[0.72rem]">Zero-latency calling</div>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-red-200/80 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Enterprise Grade Compliance & Encryption
        </div>
      </div>

      {/* Right Signup Form Panel */}
      <div className="w-full lg:w-[50%] xl:w-[48%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 overflow-y-auto bg-white">
        {/* Mobile Header with 3D Logo */}
        <div className="flex lg:hidden items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <SynexaLogo size={40} variant="color" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Synexa</span>
          </div>
          <a
            href="/login"
            className="text-xs font-bold text-[#2563eb] hover:text-blue-900 transition-colors"
          >
            Sign in →
          </a>
        </div>

        {/* Center Form Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center">
              <SynexaLogo size={48} variant="color" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 leading-tight">Create Workspace Account</div>
              <div className="text-xs text-gray-400 font-medium">Free for teams of any size</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-[-0.01em] m-0 mb-1.5">
              Get started with Synexa
            </h2>
            <p className="text-sm text-gray-500 font-medium m-0">
              Already have an account?{' '}
              <a href="/login" className="text-[#2563eb] font-bold hover:text-blue-900 transition-colors">
                Sign in
              </a>
            </p>
          </div>

          <div className="w-full flex justify-center min-h-[44px]">
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs sm:text-sm">
                <span className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></span>
                <span>Signing in with Google…</span>
              </div>
            ) : (
              <div id="google-signup-btn" className="w-full flex justify-center [&>div]:w-full [&_iframe]:!w-full"></div>
            )}
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[0.68rem] font-bold text-gray-400 tracking-wider uppercase">
              Or register with email
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-red-200 text-blue-700 text-xs font-semibold flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-blue-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all bg-[#fafbfc]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all bg-[#fafbfc]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all bg-[#fafbfc]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent p-0 flex items-center justify-center transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all bg-[#fafbfc]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl border-none bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white font-bold text-sm cursor-pointer shadow-[0_6px_20px_rgba(140,8,23,0.35)] hover: hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Synexa Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          By signing up, you agree to Synexa's Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  )
}

