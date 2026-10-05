import type { Room, User } from '../../types/chat'
import { IcoGroup } from '../common/Icons'
import { Avatar } from '../common/Avatar'
import { seedColor, fmtTime } from '../../utils/chatHelpers'

export function ContactInfoSidebar({
  showContactProfile,
  setShowContactProfile,
  activeRoom,
  curName,
  curAvatar,
  curOther,
  onRemoveContact,
  onViewCallHistory,
}: {
  showContactProfile: boolean
  setShowContactProfile: (show: boolean) => void
  activeRoom: Room | null
  curName: string
  curAvatar: string | null
  curOther: User | undefined
  onRemoveContact: () => void
  onViewCallHistory?: () => void
}) {
  if (!showContactProfile) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center font-sans p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowContactProfile(false)
      }}
    >
      {/* Centered Modal Card */}
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-[440px] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden border border-gray-100 dark:border-slate-800 animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#1f2937] dark:text-slate-100 m-0 tracking-[-0.01em]">Contact Info</h2>
          </div>
          <button 
            onClick={() => setShowContactProfile(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100 cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fb] dark:bg-[#0b0f19] max-h-[75vh] pb-6">
          {/* Avatar Zone & Info */}
          <div className="flex flex-col items-center pt-8 px-6 pb-6 bg-white dark:bg-[#0f172a] border-b border-gray-100/80 dark:border-slate-800">
            <div className="relative mb-4">
              {activeRoom?.isGroup ? (
                <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] ring-4 ring-gray-100 dark:ring-slate-800 text-white" style={{ background: seedColor(curName) }}>
                  <IcoGroup size={44} />
                </div>
              ) : (
                <div className="ring-4 ring-blue-100 dark:ring-blue-900/50 rounded-full shadow-[0_8px_32px_rgba(37,99,235,0.15)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(37,99,235,0.25)] hover:ring-blue-200">
                  <Avatar name={curName} src={curAvatar} size={120} online={curOther?.isOnline} />
                </div>
              )}

              {/* Online indicator for non-group */}
              {!activeRoom?.isGroup && curOther?.isOnline && (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
              )}
            </div>

            <h2 className="m-0 mb-1 text-[1.3rem] font-bold text-[#1f2937] dark:text-slate-100 text-center tracking-[-0.01em]">{curName}</h2>
            <div className="text-[0.85rem] text-gray-500 dark:text-slate-400 font-semibold flex items-center gap-2">
              {activeRoom?.isGroup
                ? (
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {activeRoom.members.length} members
                  </span>
                )
                : curOther?.isOnline ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    <span className="text-green-600 dark:text-green-400">Online</span>
                  </span>
                )
                : curOther?.lastSeenAt ? `Last seen ${fmtTime(curOther.lastSeenAt)}`
                  : 'Offline'}
            </div>
          </div>

          {/* Call History Button */}
          {onViewCallHistory && activeRoom && (
            <div className="mx-5 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowContactProfile(false)
                  onViewCallHistory()
                }}
                className="w-full h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 border-0 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                View Call History
              </button>
            </div>
          )}

          {/* Info Cards */}
          {!activeRoom?.isGroup && curOther?.email && (
            <div className="bg-white dark:bg-[#0f172a] mx-5 mt-4 rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-slate-800">
              <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block mb-1">Email</label>
              <div className="text-[0.98rem] text-[#111827] dark:text-slate-200 font-semibold">{curOther.email}</div>
            </div>
          )}

          {/* About / Bio placeholder */}
          <div className="bg-white dark:bg-[#0f172a] mx-5 mt-3 rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-slate-800">
            <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block mb-1">About</label>
            <div className="text-[0.92rem] text-gray-500 dark:text-slate-400 font-medium italic">Hey there! I am using Synexa</div>
          </div>

          {/* Encryption badge */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4M12 15v2" />
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            </svg>
            <span className="text-[0.78rem] text-gray-400 dark:text-slate-400 font-semibold">End-to-end encrypted</span>
          </div>
          {!activeRoom?.isGroup && curOther && (
            <button
              type="button"
              onClick={onRemoveContact}
              className="mx-5 mt-6 w-[calc(100%-2.5rem)] rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Remove contact
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
