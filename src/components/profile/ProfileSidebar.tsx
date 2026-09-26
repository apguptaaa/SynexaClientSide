import { useState } from 'react'
import type { User } from '../../types/chat'
import { IcoCamera } from '../common/Icons'
import { Avatar } from '../common/Avatar'

export function ProfileSidebar({
  showProfile,
  setShowProfile,
  me,
  editName,
  setEditName,
  editAvatarUrl,
  savingProfile,
  saveProfile,
  profileFileRef,
  handleProfileAvatarUpload,
  uploadingAvatar
}: {
  showProfile: boolean
  setShowProfile: (show: boolean) => void
  me: User | null
  editName: string
  setEditName: (name: string) => void
  editAvatarUrl: string
  savingProfile: boolean
  saveProfile: () => void
  profileFileRef: React.RefObject<HTMLInputElement | null>
  handleProfileAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadingAvatar: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)

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
                className="px-3 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-transparent text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-transparent text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
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
          <div className="flex flex-col items-center pt-8 pb-6 bg-white dark:bg-[#0f172a] border-b border-gray-100/80 dark:border-slate-800">
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" ref={profileFileRef as React.RefObject<HTMLInputElement>} onChange={handleProfileAvatarUpload} />

            {/* Clickable Avatar */}
            <div
              className={`relative w-[120px] h-[120px] rounded-full overflow-hidden shadow-[0_8px_32px_rgba(140,8,23,0.2)] ring-4 ring-red-100 dark:ring-red-900/50 transition-all duration-300 ${isEditing ? 'cursor-pointer hover:shadow-[0_12px_40px_rgba(140,8,23,0.3)] hover:ring-red-200 group' : ''}`}
              onClick={() => isEditing && !uploadingAvatar && profileFileRef.current?.click()}
            >
              <Avatar name={editName || me?.name || 'User'} src={editAvatarUrl} size={120} />

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
              <p className="mt-3 text-[0.82rem] text-gray-400 dark:text-slate-400 font-medium">Tap to change photo</p>
            ) : (
              <div className="h-5 mt-3"></div>
            )}
          </div>

          {/* Name Edit Card */}
          <div className="bg-white dark:bg-[#0f172a] mx-5 mt-4 rounded-2xl px-5 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-slate-800">
            <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
            {isEditing ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border-none border-b-2 border-gray-200 dark:border-slate-700 outline-none text-[1.05rem] text-[#111827] dark:text-slate-100 bg-transparent pb-2 font-bold box-border focus:border-[#8c0817] dark:focus:border-red-500 transition-colors"
                />
                <p className="mt-2.5 text-[0.78rem] text-gray-400 dark:text-slate-400 font-normal leading-relaxed">This name is visible to your contacts.</p>
              </>
            ) : (
              <div className="text-[1.05rem] text-[#111827] dark:text-slate-100 font-bold pb-2">
                {editName || me?.name || 'User'}
              </div>
            )}
          </div>

          {/* Email Card */}
          {me?.email && (
            <div className="bg-white dark:bg-[#0f172a] mx-5 mt-3 rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-slate-800">
              <label className="text-[0.72rem] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-widest block mb-1">Email</label>
              <p className="text-[0.95rem] text-gray-700 dark:text-slate-200 font-semibold m-0">{me.email}</p>
            </div>
          )}

          {/* Save Button */}
          {isEditing && (
            <div className="px-5 pt-5 pb-6">
              <button
                onClick={() => {
                  saveProfile()
                  setIsEditing(false)
                }}
                disabled={savingProfile}
                className={`w-full rounded-2xl py-3.5 text-[0.95rem] font-extrabold text-white transition-all duration-300 tracking-wide ${savingProfile ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#8c0817] to-[#b91c1c] cursor-pointer shadow-[0_8px_24px_rgba(140,8,23,0.3)] hover:shadow-[0_12px_32px_rgba(140,8,23,0.4)] hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
          {!isEditing && <div className="pb-6"></div>}
        </div>
      </div>
    </div>
  )
}
