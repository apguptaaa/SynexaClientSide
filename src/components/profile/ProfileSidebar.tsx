import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { User } from '../../types/chat'
import { IcoCamera } from '../common/Icons'
import { Avatar } from '../common/Avatar'
import { X } from 'lucide-react'

export function ProfileSidebar({
  showProfile,
  setShowProfile,
  me,
  editName,
  setEditName,
  editAvatarUrl,
  editPhone,
  setEditPhone,
  editBio,
  setEditBio,
  savingProfile,
  saveProfile,
  profileFileRef,
  handleProfileAvatarUpload,
  uploadingAvatar,
  onLogout
}: {
  showProfile: boolean
  setShowProfile: (show: boolean) => void
  me: User | null
  editName: string
  setEditName: (name: string) => void
  editAvatarUrl: string
  editPhone: string
  setEditPhone: (phone: string) => void
  editBio: string
  setEditBio: (bio: string) => void
  savingProfile: boolean
  saveProfile: () => void
  profileFileRef: React.RefObject<HTMLInputElement | null>
  handleProfileAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadingAvatar: boolean
  onLogout?: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const activeAvatar = editAvatarUrl || me?.avatarUrl

  if (!showProfile) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center font-sans p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowProfile(false)
      }}
    >
      {/* Centered Modal Card */}
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-[460px] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden border border-gray-100 dark:border-slate-800 animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#1f2937] dark:text-slate-100 m-0 tracking-[-0.01em]">My Profile</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveProfile()
                    setIsEditing(false)
                  }}
                  disabled={savingProfile}
                  className="px-4 h-8 rounded-full flex items-center justify-center border-none bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-xs font-bold text-white shadow-md hover:shadow-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {savingProfile ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
            <button 
              onClick={() => {
                setIsEditing(false)
                setShowProfile(false)
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100 cursor-pointer transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fb] dark:bg-[#0b0f19] max-h-[75vh]">
          {/* Avatar Zone */}
          <div className="flex flex-col items-center pt-8 pb-6 bg-white dark:bg-[#0f172a] border-b border-gray-100/80 dark:border-slate-800 relative">
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" ref={profileFileRef as React.RefObject<HTMLInputElement>} onChange={handleProfileAvatarUpload} />

            {/* Clickable Avatar */}
            <div
              className={`relative w-[120px] h-[120px] rounded-full overflow-hidden shadow-[0_8px_32px_rgba(140,8,23,0.2)] ring-4 ring-blue-100 dark:ring-blue-900/50 transition-all duration-300 ${isEditing ? 'cursor-pointer hover:shadow-[0_12px_40px_rgba(140,8,23,0.3)] hover:ring-red-200 group' : ''}`}
              onClick={() => {
                if (isEditing) {
                  if (!uploadingAvatar) profileFileRef.current?.click()
                } else {
                  setImagePreviewOpen(true)
                }
              }}
              title={isEditing ? 'Change photo' : 'View photo'}
            >
              <Avatar name={editName || me?.name || 'User'} src={activeAvatar} size={120} />

              {/* Overlay */}
              {isEditing && (
                <div className={`absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center transition-all duration-300 ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {uploadingAvatar ? (
                    <svg width={32} height={32} viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="60 34" strokeLinecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.8s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  ) : (
                    <IcoCamera color="#fff" />
                  )}
                  <span className="text-white text-[0.72rem] font-bold mt-1 uppercase tracking-widest">
                    {uploadingAvatar ? 'Uploading…' : 'Change'}
                  </span>
                </div>
              )}
            </div>

            {isEditing ? (
              <p className="mt-3 text-[0.82rem] text-gray-400 dark:text-slate-400 font-medium">Tap photo to change</p>
            ) : (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Now
              </div>
            )}
          </div>

          {/* Name Edit Card */}
          <div className="bg-white dark:bg-[#0f172a] mx-5 mt-4 rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2563eb] dark:text-blue-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">Display Name</label>
            </div>
            {isEditing ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border-none border-b-2 border-gray-200 dark:border-slate-700 outline-none text-[1.02rem] text-[#111827] dark:text-slate-100 bg-transparent pb-1 font-bold box-border focus:border-[#2563eb] dark:focus:border-blue-500 transition-colors"
                />
                <p className="mt-2 text-[0.78rem] text-gray-400 dark:text-slate-400 font-normal leading-relaxed">This name is visible to your contacts.</p>
              </>
            ) : (
              <div className="text-[1.02rem] text-[#111827] dark:text-slate-100 font-bold">
                {editName || me?.name || 'User'}
              </div>
            )}
          </div>

          {/* Email Card */}
          {me?.email && (
            <div className="bg-white dark:bg-[#0f172a] mx-5 mt-3 rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2563eb] dark:text-blue-400">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">Email</label>
              </div>
              <p className="text-[0.95rem] text-gray-700 dark:text-slate-200 font-semibold m-0">{me.email}</p>
            </div>
          )}

          {/* Phone Number Card */}
          <div className="bg-white dark:bg-[#0f172a] mx-5 mt-3 rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2563eb] dark:text-blue-400">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">Phone Number</label>
            </div>
            {isEditing ? (
              <input
                type="tel"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full border-none border-b-2 border-gray-200 dark:border-slate-700 outline-none text-[0.95rem] text-[#111827] dark:text-slate-100 bg-transparent pb-1 font-semibold box-border focus:border-[#2563eb] dark:focus:border-blue-500 transition-colors"
              />
            ) : (
              <p className="text-[0.95rem] text-gray-700 dark:text-slate-200 font-semibold m-0">
                {editPhone || me?.phone || me?.phoneNumber || 'Not specified'}
              </p>
            )}
          </div>

          {/* Bio Card */}
          <div className="bg-white dark:bg-[#0f172a] mx-5 mt-3 rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2563eb] dark:text-blue-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block">Bio</label>
            </div>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-[0.92rem] text-[#111827] dark:text-slate-100 bg-transparent font-medium box-border focus:border-[#2563eb] dark:focus:border-blue-500 transition-colors resize-none"
              />
            ) : (
              <p className="text-[0.92rem] text-gray-600 dark:text-slate-300 font-medium m-0 leading-relaxed whitespace-pre-wrap">
                {editBio || me?.bio || 'No bio added yet'}
              </p>
            )}
          </div>

          {/* Log Out Section */}
          {!isEditing && onLogout && (
            <div className="px-5 pt-4 pb-6">
              <button
                onClick={() => {
                  setShowProfile(false)
                  onLogout()
                }}
                className="w-full rounded-2xl py-3 text-[0.88rem] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-red-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-red-200/80 dark:border-blue-900/50 cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Log Out
              </button>
            </div>
          )}
          {isEditing && <div className="pb-6"></div>}
        </div>
      </div>

      {imagePreviewOpen && (
        createPortal(
          <div
            role="presentation"
            onClick={() => setImagePreviewOpen(false)}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm sm:p-6"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${editName || me?.name || 'User'}'s profile photo`}
              onClick={event => event.stopPropagation()}
              className="w-full max-w-[420px] overflow-hidden rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.2)] animate-[scaleIn_0.18s_ease-out] dark:border-slate-700 dark:bg-[#0f172a] sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-gray-200 pb-3 dark:border-slate-700">
                <div className="flex min-w-0 items-center gap-2.5">
                  <h3 className="m-0 truncate text-lg font-bold text-gray-900 dark:text-slate-100">
                    {editName || me?.name || 'User'}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active now
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close photo preview"
                  onClick={() => setImagePreviewOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-gray-50 p-2 dark:bg-slate-900/70 sm:min-h-[240px]">
                {activeAvatar
                  ? <img src={activeAvatar} alt={`${editName || me?.name || 'User'}'s profile`} className="max-h-[min(40vh,300px)] max-w-full rounded-xl object-contain shadow-sm" />
                  : <Avatar name={editName || me?.name || 'User'} size={180} />}
              </div>
            </div>
          </div>,
          document.body,
        )
      )}
    </div>
  )
}
