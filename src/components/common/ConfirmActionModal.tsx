import { useState } from 'react'

export function ConfirmActionModal({
  show,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  show: boolean
  title: string
  message: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  if (!show) return null

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-action-title" className="flex w-full max-w-[380px] flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h3 id="confirm-action-title" className="mb-1.5 text-lg font-bold text-[#1f2937] dark:text-slate-100">{title}</h3>
        <p className="mb-6 text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400">{message}</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} disabled={busy} className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-wait dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button type="button" onClick={() => { void confirm() }} disabled={busy} className="flex-1 cursor-pointer rounded-xl border-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] disabled:cursor-wait disabled:opacity-70">
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}