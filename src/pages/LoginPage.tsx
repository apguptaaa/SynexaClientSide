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

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingBackend, setCheckingBackend] = useState(true)

  useEffect(() => {
    let isMounted = true

    const pingBackend = async () => {
      try {
<<<<<<< HEAD
        const res = await fetch('https://synexabackend.onrender.com/health')
=======
        const res = await fetch(`${BACKEND_URL}/health`)
>>>>>>> c01430c2f22be63fef534046970c075ab3886c45
        if (isMounted && res.ok) {
          setCheckingBackend(false)
        } else {
          setTimeout(pingBackend, 3000)
        }
      } catch {
        if (isMounted) setTimeout(pingBackend, 3000)
      }
    }

    pingBackend()
    return () => { isMounted = false }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password')
      }

      localStorage.setItem('accessToken', data.accessToken)

      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      window.location.href = '/home'
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during login')
      } else {
        setError('An error occurred during login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (checkingBackend) return

<<<<<<< HEAD
    const google = (window as any).google
    if (!google?.accounts?.id) {
      setError('Google Sign-In is still loading. Please try again.')
      setGoogleLoading(false)
      return
    }

    google.accounts.id.initialize({
      client_id: '644066194449-mj91v7cjpl8d8rtsfstuvdt4rrjl068t.apps.googleusercontent.com',
      callback: async (response: any) => {
        try {
          const res = await fetch('https://synexabackend.onrender.com/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: response.credential })
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.message || 'Google login failed')
=======
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
              throw new Error(data.message || `Server returned ${res.status}: ${res.statusText || 'Google login route not found'}`)
            }

            localStorage.setItem('accessToken', data.accessToken)
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken)
            }

            window.location.href = '/home'
          } catch (err: unknown) {
            if (err instanceof Error) {
              setError(err.message || 'Google login failed')
            } else {
              setError('Google login failed')
            }
          } finally {
            setGoogleLoading(false)
>>>>>>> c01430c2f22be63fef534046970c075ab3886c45
          }

          localStorage.setItem('accessToken', data.accessToken)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }

          window.location.href = '/home'
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message || 'Google login failed')
          } else {
            setError('Google login failed')
          }
        } finally {
          setGoogleLoading(false)
        }
      }
    })

<<<<<<< HEAD
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap not available, fall back to button-style popup
        google.accounts.id.renderButton(
          document.createElement('div'),
          { type: 'standard' }
        )
        // Use the popup flow instead
        google.accounts.oauth2.initTokenRequest // not needed, use prompt
        // Trigger the sign-in popup manually
        const popupDiv = document.getElementById('google-signin-popup')
        if (popupDiv) {
          google.accounts.id.renderButton(popupDiv, {
            theme: 'outline',
            size: 'large',
            width: '100%'
          })
          (popupDiv.querySelector('div[role="button"]') as HTMLElement | null)?.click()
        }
        setGoogleLoading(false)
      }
    })
  }
=======
      const container = document.getElementById('google-login-btn')
      if (container) {
        container.innerHTML = ''
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          width: 380,
          logo_alignment: 'left'
        })
      }
    }

    initGoogle()
    return () => clearTimeout(timer)
  }, [checkingBackend])
>>>>>>> c01430c2f22be63fef534046970c075ab3886c45

  // Backend Health / Loading Screen with new 3D logo
  if (checkingBackend) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fafbfc] font-sans relative overflow-hidden p-6">
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          {/* 3D Logo */}
          <div className="w-20 h-20 rounded-3xl shadow-[0_12px_36px_rgba(140,8,23,0.15)] mb-6 animate-pulse flex items-center justify-center">
            <SynexaLogo size={80} variant="color" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-[-0.01em] mb-1.5">
            Connecting to Synexa
          </h2>
          <p className="text-xs text-gray-400 font-medium mb-6">
            Establishing secure workspace connection...
          </p>

          {/* Clean Dots loader */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8c0817] animate-[bounce_1.4s_infinite_0s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#8c0817] animate-[bounce_1.4s_infinite_0.2s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#8c0817] animate-[bounce_1.4s_infinite_0.4s]"></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fc] font-sans">
      {/* Left Brand Panel (Desktop only) */}
      <div className="hidden lg:flex w-[50%] xl:w-[52%] bg-gradient-to-br from-[#8c0817] via-[#a31222] to-[#680410] text-white relative overflow-hidden flex-col justify-between p-12 select-none">
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex items-center justify-center">
            <SynexaLogo size={44} variant="white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Synexa</span>
        </div>

        {/* Center Hero Mockup & Content */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[0.72rem] font-bold tracking-wider uppercase mb-5 text-red-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Enterprise Real-time Messaging
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.12] tracking-[-0.02em] text-white mb-4">
            Connect, collaborate, and chat in real time.
          </h1>

          <p className="text-red-100/80 text-sm xl:text-base font-normal leading-relaxed mb-8 max-w-md">
            The secure unified communication platform designed for fast-moving teams and modern organizations.
          </p>

          {/* Interactive Chat Bubble Preview */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl space-y-3 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-[#8c0817] font-bold text-xs flex items-center justify-center shadow-sm">
                SC
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">Sarah Chen</div>
                <div className="text-[0.7rem] text-red-200">Product Lead • Just now</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="bg-white/90 text-gray-800 text-xs font-medium px-3.5 py-2.5 rounded-xl rounded-tl-sm shadow-sm leading-relaxed">
              Design files and sprint goals are ready for review! 🚀
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-red-200/80 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          256-bit encrypted enterprise workspace
        </div>
      </div>

      {/* Right Login Form Panel (Responsive across all screens) */}
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
            href="/signup"
            className="text-xs font-bold text-[#8c0817] hover:text-red-900 transition-colors"
          >
            Create account →
          </a>
        </div>

        {/* Center Form Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          {/* Logo badge on top of card */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center">
              <SynexaLogo size={48} variant="color" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 leading-tight">Synexa Workspace</div>
              <div className="text-xs text-gray-400 font-medium">Enterprise Communications</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-[-0.01em] m-0 mb-1.5">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 font-medium m-0">
              New to Synexa?{' '}
              <a href="/signup" className="text-[#8c0817] font-bold hover:text-red-900 transition-colors">
                Create an account
              </a>
            </p>
          </div>

          {/* Google Sign-in */}
          <div className="w-full flex justify-center min-h-[44px]">
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs sm:text-sm">
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></span>
                <span>Signing in with Google…</span>
              </div>
            ) : (
              <div id="google-login-btn" className="w-full flex justify-center [&>div]:w-full [&_iframe]:!w-full"></div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[0.68rem] font-bold text-gray-400 tracking-wider uppercase">
              Or continue with email
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-red-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#8c0817] focus:ring-4 focus:ring-red-50 transition-all bg-[#fafbfc]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#8c0817] focus:ring-4 focus:ring-red-50 transition-all bg-[#fafbfc]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent p-0 flex items-center justify-center transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl border-none bg-gradient-to-r from-[#8c0817] to-[#b91c1c] text-white font-bold text-sm cursor-pointer shadow-[0_6px_20px_rgba(140,8,23,0.35)] hover:shadow-[0_8px_24px_rgba(140,8,23,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Synexa</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          Protected by Synexa Enterprise Security • End-to-End Encrypted
        </div>
      </div>
    </div>
  )
}