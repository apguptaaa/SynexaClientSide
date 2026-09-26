import { SynexaLogo } from '../common/SynexaLogo'

export function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0b0f19] gap-5 font-sans transition-colors duration-300">
      <div className="w-[120px] h-[120px] flex items-center justify-center animate-fade-in hover:scale-105 transition-transform">
        <SynexaLogo size={120} variant="color" />
      </div>

      <div className="text-center max-w-[360px]">
        <h2 className="text-[1.7rem] font-bold text-[#1f2937] dark:text-slate-100 m-0 mb-2 tracking-[-0.01em]">
          Synexa Web
        </h2>
        <p className="text-[0.95rem] text-gray-400 dark:text-slate-400 m-0 leading-relaxed font-medium">
          Select a conversation on the left or start a new chat.
        </p>
      </div>

      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 mt-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4M12 15v2" />
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        </svg>
        <span className="text-[0.8rem] text-gray-400 dark:text-slate-400 font-semibold">
          End-to-end encrypted
        </span>
      </div>
    </div>
  )
}
