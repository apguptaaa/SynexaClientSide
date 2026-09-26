export function LogoutConfirm({
  show,
  onCancel,
  onLogout
}: {
  show: boolean
  onCancel: () => void
  onLogout: () => void
}) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center font-sans p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 w-full max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-slate-800 flex flex-col">
        {/* Icon & Title */}
        <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-lg mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>

        <h3 className="m-0 mb-1.5 text-lg text-[#1f2937] dark:text-slate-100 font-bold tracking-[-0.01em]">Log out of Synexa?</h3>
        <p className="m-0 mb-6 text-xs text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
          You will need to enter your credentials again to access your messages and groups.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-bold text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="flex-1 py-2.5 px-4 rounded-xl border-none bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-extrabold cursor-pointer shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
