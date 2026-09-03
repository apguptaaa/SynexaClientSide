import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4M12 15v2" />
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('https://synexabackend.onrender.com/api/auth/login', {
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
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[55%] bg-[#991b1b] text-white relative overflow-hidden flex-col h-screen">
        {/* Background Waves/Circles */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] border-[50px] border-[#a51d1d] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[20%] w-[600px] h-[600px] border-[40px] border-[#b91c1c] rounded-full"></div>

        <div className="px-12 py-8 relative z-10 flex-col h-full flex justify-center overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-sm">
              <img src="/assets/logos/synexa-logo.svg" alt="Synexa" width={22} height={22} className="mix-blend-multiply opacity-90" />
            </div>
            <span className="text-[1.6rem] font-extrabold tracking-tight">Synexa</span>
          </div>

          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-white/20 rounded-full text-[0.65rem] font-bold tracking-widest mb-4 bg-white/5 backdrop-blur-sm self-start">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
            CONNECTED IN REAL TIME
          </div>

          <h1 className="text-[clamp(2.5rem,4vw,4rem)] font-black leading-[1.05] tracking-tight mb-3 drop-shadow-sm">
            Make work feel<br />more human.
          </h1>

          <p className="text-red-100/90 text-[1rem] max-w-[26rem] font-medium leading-relaxed mb-4">
            One shared space for the conversations, decisions, and files that move your team forward.
          </p>

          {/* Scaled-down Animated Engineering Chat Mockup */}
          <div className="relative w-full max-w-[360px] z-20 flex-shrink min-h-0">
            <div className="bg-white rounded-[1.25rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[0.95rem]">
                    <span className="text-slate-400 font-medium">#</span> engineering
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5">3 online · 1 away</span>
                </div>
                <div className="flex -space-x-1.5">
                  <div className="w-7 h-7 rounded-full bg-pink-500 border-2 border-white text-[9px] text-white flex items-center justify-center font-bold z-40 shadow-sm relative">
                    MC
                    <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-emerald-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-[9px] text-white flex items-center justify-center font-bold z-30 shadow-sm relative">
                    DP
                    <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-emerald-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-500 border-2 border-white text-[9px] text-white flex items-center justify-center font-bold z-20 shadow-sm relative">
                    SK
                    <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-amber-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white text-[9px] text-white flex items-center justify-center font-bold z-10 shadow-sm relative">
                    LN
                    <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-slate-300 border-2 border-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 space-y-5 bg-slate-50/50">
                {/* Maya Chen Message */}
                <div className="flex gap-3">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">MC</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="font-bold text-slate-900 text-[0.85rem]">Maya Chen</span>
                      <span className="text-[10px] text-slate-400 font-semibold">09:42</span>
                    </div>

                    {/* PDF Attachment */}
                    <div className="mt-1 flex items-start gap-3 p-3 border border-slate-200 rounded-[14px] rounded-tl-sm bg-white shadow-sm max-w-[260px]">
                      <div className="bg-[#8c0817] px-2.5 py-2 rounded-xl text-white font-black text-[10px] h-9 flex items-center justify-center shrink-0 shadow-sm">
                        PDF
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="font-bold text-[0.8rem] truncate text-slate-800">load-test-results.pdf</div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">2.4 MB • Uploaded</div>
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden flex">
                          <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full w-[100%] rounded-full shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dev Patel Message */}
                <div className="flex gap-3">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">DP</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="font-bold text-slate-900 text-[0.85rem]">Dev Patel</span>
                      <span className="text-[10px] text-slate-400 font-semibold">09:43</span>
                    </div>
                    <div className="bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-[14px] rounded-tl-sm text-[0.8rem] font-medium leading-relaxed shadow-sm border border-slate-200/60 max-w-[95%]">
                      JWT refresh rotation is merged too — tokens expire in 15m, refresh in 7d.
                    </div>
                  </div>
                </div>

                {/* SK Typing indicator */}
                <div className="flex gap-3 items-end">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">SK</div>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-[14px] rounded-tl-sm px-3.5 shadow-sm flex items-center h-[2.5rem]">
                    <div className="flex gap-[4px] items-center">
                      <span className="typing-dot bg-slate-400 w-1.5 h-1.5"></span>
                      <span className="typing-dot bg-slate-400 w-1.5 h-1.5"></span>
                      <span className="typing-dot bg-slate-400 w-1.5 h-1.5"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Input */}
              <div className="px-4 py-3 bg-white border-t border-slate-100 z-10">
                <div className="bg-slate-50 border border-slate-200 rounded-full pl-3 pr-1 py-1 flex items-center justify-between hover:border-slate-300 transition-all cursor-text shadow-sm inset-shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 w-full">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                    <span className="text-[0.8rem] font-medium">Message #engineering...</span>
                  </div>
                  <div className="w-7 h-7 bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-colors">
                    <span className="transform -rotate-90">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel Form */}
      <div className="w-full lg:w-[45%] h-full flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16 relative bg-white overflow-y-auto">
        <div className="w-full max-w-[400px] py-6 sm:py-0">
          <h2 className="text-[2rem] sm:text-[2.2rem] font-bold text-slate-900 tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-slate-500 text-[0.95rem] mb-6 sm:mb-10 font-medium">
            New to Synexa? <a href="/signup" className="text-red-700 font-bold hover:text-red-800 transition-colors">Create an account</a>
          </p>

          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 text-slate-800 font-bold text-[0.95rem] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm mb-6 sm:mb-8" type="button">
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <hr className="flex-1 border-slate-100" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              OR CONTINUE WITH EMAIL
            </span>
            <hr className="flex-1 border-slate-100" />
          </div>

          <form onSubmit={handleLogin} className="grid gap-4 sm:gap-6 w-full">
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg text-[0.85rem] font-semibold w-full text-center">
                {error}
              </div>
            )}

            <Input
              label="Work email"
              type="email"
              placeholder="you@company.com"
              name="email"
              iconLeft={<MailIcon />}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <div className="flex justify-between absolute right-0 -top-[1.6rem]">
                <a href="/forgot" className="text-[0.8rem] font-bold text-red-700 hover:text-red-800">Forgot password?</a>
              </div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                name="password"
                iconLeft={<LockIcon />}
                iconRight={<button type="button" className="hover:text-slate-600 transition-colors cursor-pointer outline-none"><EyeIcon /></button>}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              className="w-full !bg-[#8c0817] hover:!bg-[#7a0613] py-3.5 shadow-[0_8px_20px_-6px_rgba(140,8,23,0.4)] border-none text-[1rem] flex items-center justify-center gap-2 group transition-all mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to Synexa'}
              {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
            </Button>
          </form>

          <p className="text-center mt-6 sm:mt-10 text-[0.9rem] text-slate-500 font-medium">
            Don't have a workspace? <a href="/signup" className="text-red-700 font-bold hover:text-red-800 transition-colors">Explore Synexa</a>
          </p>

          <div className="flex justify-center mt-6 sm:mt-8">
            <span className="text-[0.7rem] text-slate-400 flex items-center gap-1.5 font-semibold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-wider">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4M12 15v2" /><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /></svg>
              Protected with JWT authentication
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}