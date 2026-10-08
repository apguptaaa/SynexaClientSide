import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { User } from '../../types/chat'
import { IcoCamera } from '../common/Icons'
import { Avatar } from '../common/Avatar'
import { X, ArrowLeft } from 'lucide-react'

interface ProfileViewProps {
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
}

export function ProfileView({
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
  onLogout,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  const activeAvatar = editAvatarUrl || me?.avatarUrl
  const displayName = editName || me?.name || 'User'

  const handleSaveAndClose = () => {
    saveProfile()
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#f5f6fa] dark:bg-[#0b0f19] font-sans overflow-hidden">
      {/* ── Mobile Top Header ─────────────────────────────────── */}
      <header className="h-14 px-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 -ml-1 rounded-xl text-gray-600 dark:text-slate-300 border-0 bg-transparent cursor-pointer flex items-center justify-center"
              aria-label="Cancel editing"
            >
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <h1 className="text-base font-bold text-gray-900 dark:text-slate-100 m-0">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="h-8 px-3.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-transparent text-[#2563eb] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="h-8 px-3 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 bg-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndClose}
                disabled={savingProfile}
                className="h-8 px-4 rounded-xl text-xs font-bold bg-[#2563eb] text-white border-0 hover:bg-[#1d4ed8] cursor-pointer transition-colors disabled:opacity-60 shadow-sm"
              >
                {savingProfile ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Scrollable Body ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Avatar Hero Section */}
        <div className="bg-white dark:bg-[#0f172a] flex flex-col items-center pt-8 pb-7 border-b border-gray-100 dark:border-slate-800">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            ref={profileFileRef as React.RefObject<HTMLInputElement>}
            onChange={handleProfileAvatarUpload}
          />

          {/* Avatar */}
          <div
            className="relative w-[100px] h-[100px] rounded-full overflow-hidden shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/40 cursor-pointer group transition-all duration-200"
            onClick={() => {
              if (isEditing) {
                if (!uploadingAvatar) profileFileRef.current?.click()
              } else {
                setImageModalOpen(true)
              }
            }}
            title={isEditing ? 'Change photo' : 'View photo'}
          >
            <Avatar name={displayName} src={activeAvatar} size={100} />

            {/* Overlay */}
            {isEditing ? (
              <div className={`absolute inset-0 bg-black/55 flex flex-col items-center justify-center transition-opacity duration-200 ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {uploadingAvatar ? (
                  <svg width={28} height={28} viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="60 34" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.8s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                ) : (
                  <IcoCamera color="#fff" />
                )}
                <span className="text-white text-[0.65rem] font-bold mt-1 uppercase tracking-wider">
                  {uploadingAvatar ? 'Uploading…' : 'Change'}
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span className="text-white text-[0.7rem] font-bold">View</span>
              </div>
            )}
          </div>

          <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-slate-100">{displayName}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mt-0.5">{me?.email || ''}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[0.72rem] font-semibold text-emerald-600 dark:text-emerald-400">Active Now</span>
          </div>

          {isEditing && (
            <p className="mt-2 text-[0.72rem] text-blue-500 dark:text-blue-400 font-medium">
              Tap photo to change
            </p>
          )}
        </div>

        {/* Info Fields */}
        <div className="px-4 py-4 space-y-3">

          {/* Display Name */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl px-4 py-4 border border-gray-100 dark:border-slate-800 shadow-sm">
            <label className="text-[0.68rem] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2 block">
              Display Name
            </label>
            {isEditing ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-slate-100 bg-transparent outline-none focus:border-[#2563eb] dark:focus:border-blue-500 transition-colors"
                placeholder="Your display name"
              />
            ) : (
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 m-0">{displayName}</p>
            )}
          </div>

          {/* Email (read-only) */}
          {me?.email && (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl px-4 py-4 border border-gray-100 dark:border-slate-800 shadow-sm">
              <label className="text-[0.68rem] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2 block">
                Email
              </label>
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 m-0">{me.email}</p>
            </div>
          )}

          {/* Phone */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl px-4 py-4 border border-gray-100 dark:border-slate-800 shadow-sm">
            <label className="text-[0.68rem] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2 block">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-slate-100 bg-transparent outline-none focus:border-[#2563eb] dark:focus:border-blue-500 transition-colors"
              />
            ) : (
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 m-0">
                {editPhone || me?.phone || me?.phoneNumber || (
                  <span className="text-gray-400 dark:text-slate-500 font-normal">Not specified</span>
                )}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl px-4 py-4 border border-gray-100 dark:border-slate-800 shadow-sm">
            <label className="text-[0.68rem] font-extrabold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2 block">
              About / Bio
            </label>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Write something about yourself…"
                rows={3}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-slate-100 bg-transparent outline-none focus:border-[#2563eb] dark:focus:border-blue-500 transition-colors resize-none font-medium"
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-slate-300 font-medium m-0 leading-relaxed whitespace-pre-wrap">
                {editBio || me?.bio || (
                  <span className="text-gray-400 dark:text-slate-500 font-normal italic">No bio yet</span>
                )}
              </p>
            )}
          </div>

          {/* Log Out */}
          {!isEditing && onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-1 rounded-2xl py-3.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/40 cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* ── Image Preview Modal ───────────────────────────────── */}
      {imageModalOpen && (
        createPortal(
          <div
            role="presentation"
            onClick={() => setImageModalOpen(false)}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm sm:p-6"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${displayName}'s profile photo`}
              onClick={event => event.stopPropagation()}
              className="w-full max-w-[420px] overflow-hidden rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.2)] animate-[scaleIn_0.18s_ease-out] dark:border-slate-700 dark:bg-[#0f172a] sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-gray-200 pb-3 dark:border-slate-700">
                <div className="flex min-w-0 items-center gap-2.5">
                  <h3 className="m-0 truncate text-lg font-bold text-gray-900 dark:text-slate-100">{displayName}</h3>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active now
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close photo preview"
                  onClick={() => setImageModalOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-gray-50 p-2 dark:bg-slate-900/70 sm:min-h-[240px]">
                {activeAvatar
                  ? <img src={activeAvatar} alt={displayName} className="max-h-[min(40vh,300px)] max-w-full rounded-xl object-contain shadow-sm" />
                  : <Avatar name={displayName} size={180} />}
              </div>
            </div>
          </div>,
          document.body,
        )
      )}
    </div>
  )
}
