import { useState } from 'react'
import type { User } from '../../types/chat'
import { Avatar } from '../common/Avatar'
import { SynexaLogo } from '../common/SynexaLogo'
import { useTheme } from '../../hooks/useTheme'

export function SettingsModal({
  isOpen,
  onClose,
  me,
  editName,
  setEditName,
  handleSaveProfile,
  savingProfile,
  profileFileRef,
  handleProfileAvatarUpload: _handleProfileAvatarUpload,
  uploadingAvatar
}: {
  isOpen: boolean
  onClose: () => void
  me: User | null
  editName: string
  setEditName: (v: string) => void
  handleSaveProfile: () => void
  savingProfile: boolean
  profileFileRef?: React.RefObject<HTMLInputElement | null>
  handleProfileAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadingAvatar?: boolean
}) {
  const [activeTab, setActiveTab] = useState<
    'general' | 'accounts' | 'privacy' | 'notifications' | 'chat' | 'devices' | 'about'
  >('general')

  // Setting States
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState('en-US')
  const [autoStart, setAutoStart] = useState(true)
  const [closeToTray, setCloseToTray] = useState(true)
  const [spellCheck, setSpellCheck] = useState(true)
  const [statusState, setStatusState] = useState<'online' | 'busy' | 'away' | 'dnd' | 'offline'>('online')
  const [statusMessage, setStatusMessage] = useState('Available to collaborate')
  
  // Privacy
  const [readReceipts, setReadReceipts] = useState(true)
  const [lastSeenVis, setLastSeenVis] = useState<'everyone' | 'contacts' | 'nobody'>('everyone')
  const [typingIndicator, setTypingIndicator] = useState(true)
  
  // Notifications
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [desktopBanners, setDesktopBanners] = useState(true)
  const [messagePreview, setMessagePreview] = useState(true)
  const [mentionAlerts, setMentionAlerts] = useState(true)

  // Chat
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [enterToSend, setEnterToSend] = useState(true)
  const [linkPreviews, setLinkPreviews] = useState(true)
  const [_autoDownloadMedia, _setAutoDownloadMedia] = useState('always')

  // Audio / Video
  const [noiseSuppression, setNoiseSuppression] = useState<'auto' | 'high' | 'low' | 'off'>('auto')
  const [isTestingAudio, setIsTestingAudio] = useState(false)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)

  if (!isOpen) return null

  const handleTestAudio = () => {
    setIsTestingAudio(true)
    setTimeout(() => setIsTestingAudio(false), 2000)
  }

  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true)
    setUpdateStatus(null)
    setTimeout(() => {
      setIsCheckingUpdate(false)
      setUpdateStatus('Synexa is up to date (v2.4.0-stable)')
    }, 1200)
  }

  const tabs = [
    {
      id: 'general' as const,
      label: 'General',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    },
    {
      id: 'accounts' as const,
      label: 'Accounts & Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    {
      id: 'privacy' as const,
      label: 'Privacy & Security',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      )
    },
    {
      id: 'chat' as const,
      label: 'Chats & Appearance',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      id: 'devices' as const,
      label: 'Devices & Calling',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      )
    },
    {
      id: 'about' as const,
      label: 'About Synexa',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      )
    }
  ]

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center font-sans p-4 animate-[fadeIn_0.2s_ease-out]">
      {/* Teams-like Dialog Box */}
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-[860px] h-full md:h-[640px] md:max-h-[90vh] md:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden border-0 md:border border-gray-100 dark:border-slate-800">
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-[#8c0817] dark:text-red-300 flex items-center justify-center font-bold text-sm border border-red-100 dark:border-red-900/40">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1f2937] dark:text-slate-100 tracking-[-0.01em]">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100 cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main Body: Left Nav + Right Pane */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left Teams Sidebar List - horizontal scroll on mobile, vertical on desktop */}
          <div className="md:w-60 bg-[#f8f9fb] dark:bg-[#0b0f19] border-b md:border-b-0 md:border-r border-gray-200/70 dark:border-slate-800 p-2 md:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-3.5 py-2 md:py-2.5 rounded-xl border-none text-left cursor-pointer transition-all duration-200 text-[0.82rem] md:text-[0.88rem] font-semibold whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-[#8c0817] dark:text-red-400 shadow-[0_2px_8px_rgba(140,8,23,0.08)] border border-red-100/60 dark:border-slate-700 font-bold'
                      : 'text-gray-600 dark:text-slate-300 bg-transparent hover:bg-gray-200/60 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${active ? 'text-[#8c0817] dark:text-red-400 scale-105' : 'text-gray-400 dark:text-slate-400'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Content Pane */}
          <div className="flex-1 overflow-y-auto p-4 md:p-7 bg-white dark:bg-[#0f172a] text-gray-800 dark:text-slate-100">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">General Preferences</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Manage theme, startup preferences, and language.</p>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3 border-b border-gray-100 pb-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Theme</label>
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    {[
                      { id: 'light', label: 'Light', desc: 'Default bright style', bg: 'bg-white border-gray-300' },
                      { id: 'dark', label: 'Dark', desc: 'Easy on the eyes', bg: 'bg-gray-900 text-white border-gray-800' },
                      { id: 'system', label: 'System', desc: 'Syncs with OS', bg: 'bg-gradient-to-r from-white to-gray-800 border-gray-300' }
                    ].map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          theme === t.id
                            ? 'border-[#8c0817] dark:border-red-500 bg-red-50/30 dark:bg-red-950/30 shadow-sm'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`h-8 rounded-lg mb-2 border ${t.bg} flex items-center justify-center text-xs font-bold`}>
                          {t.label}
                        </div>
                        <div className="text-xs font-bold text-gray-800 dark:text-slate-100">{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3 border-b border-gray-100 pb-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">App Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full max-w-sm px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-700 dark:text-slate-300 outline-none focus:border-[#8c0817]"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="es-ES">Spanish (Español)</option>
                    <option value="fr-FR">French (Français)</option>
                  </select>
                </div>

                {/* Startup & System Toggles */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Application Behavior</label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                      <div>
                        <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Auto-start Synexa</div>
                        <div className="text-xs text-gray-400">Launch Synexa automatically when you log in</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoStart}
                        onChange={(e) => setAutoStart(e.target.checked)}
                        className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                      <div>
                        <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Keep running in background</div>
                        <div className="text-xs text-gray-400">Minimize to system tray on window close</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={closeToTray}
                        onChange={(e) => setCloseToTray(e.target.checked)}
                        className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                      <div>
                        <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Enable spell check</div>
                        <div className="text-xs text-gray-400">Highlight typing errors inside chat messages</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={spellCheck}
                        onChange={(e) => setSpellCheck(e.target.checked)}
                        className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNTS & PROFILE TAB */}
            {activeTab === 'accounts' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Account & Profile</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Personalize your identity and presence.</p>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-red-50/50 via-white to-gray-50 border border-red-100/60 shadow-sm">
                  <div className="relative group">
                    <Avatar name={me?.name || 'User'} src={me?.avatarUrl} size={76} online={me?.isOnline} />
                    {profileFileRef && (
                      <button
                        onClick={() => profileFileRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold border-none cursor-pointer"
                      >
                        {uploadingAvatar ? '...' : 'Change'}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-gray-900 dark:text-slate-100 m-0 truncate">{me?.name || 'User'}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[0.7rem] font-extrabold bg-[#8c0817] text-white">PRO</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium truncate mt-0.5">{me?.email || 'user@synexa.com'}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-semibold text-emerald-700">Online & Ready</span>
                    </div>
                  </div>
                </div>

                {/* Edit Display Name */}
                <div className="space-y-2 border-b border-gray-100 pb-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Display Name</label>
                  <div className="flex gap-3 max-w-md">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your full name"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-[#8c0817] transition-colors"
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="px-5 py-2.5 rounded-xl border-none bg-gradient-to-r from-[#8c0817] to-[#b91c1c] text-white text-xs font-extrabold cursor-pointer hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Status message */}
                <div className="space-y-2 border-b border-gray-100 pb-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Status Message</label>
                  <input
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-sm font-medium text-gray-800 dark:text-slate-200 outline-none focus:border-[#8c0817]"
                  />
                </div>

                {/* Availability */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Availability Presence</label>
                  <div className="grid grid-cols-2 gap-2.5 max-w-md">
                    {[
                      { id: 'online', label: 'Available', dot: 'bg-emerald-500' },
                      { id: 'busy', label: 'Busy', dot: 'bg-red-500' },
                      { id: 'dnd', label: 'Do Not Disturb', dot: 'bg-rose-600' },
                      { id: 'away', label: 'Be Right Back / Away', dot: 'bg-amber-400' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStatusState(s.id as any)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          statusState === s.id
                            ? 'border-[#8c0817] bg-red-50/50 text-[#8c0817]'
                            : 'border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`}></span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY & SECURITY TAB */}
            {activeTab === 'privacy' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Privacy & Security</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Control who can see your activity and read receipts.</p>
                </div>

                <div className="space-y-4 border-b border-gray-100 pb-6">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Read Receipts (Blue Ticks)</div>
                      <div className="text-xs text-gray-400">Let others know when you have read their messages</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={readReceipts}
                      onChange={(e) => setReadReceipts(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Typing Indicators</div>
                      <div className="text-xs text-gray-400">Show typing animation when composing a message</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={typingIndicator}
                      onChange={(e) => setTypingIndicator(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Who can see my last seen</label>
                  <div className="flex gap-3 max-w-md">
                    {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setLastSeenVis(opt)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold capitalize cursor-pointer transition-all ${
                          lastSeenVis === opt
                            ? 'border-[#8c0817] bg-red-50 text-[#8c0817]'
                            : 'border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-800 dark:text-slate-200">End-to-End Encryption</div>
                    <div className="text-xs text-gray-400">Your direct messages are protected with 256-bit encryption</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[0.72rem]">
                    ACTIVE
                  </span>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Choose how and when you get alerted.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Desktop Banner Alerts</div>
                      <div className="text-xs text-gray-400">Show popup notification on the bottom right screen</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={desktopBanners}
                      onChange={(e) => setDesktopBanners(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Notification Sounds</div>
                      <div className="text-xs text-gray-400">Play pleasant chime sound on new message arrival</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Show Message Preview</div>
                      <div className="text-xs text-gray-400">Display sender name and snippet inside banner notifications</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={messagePreview}
                      onChange={(e) => setMessagePreview(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Mentions Alert (@)</div>
                      <div className="text-xs text-gray-400">Always notify when someone tags you in a group chat</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mentionAlerts}
                      onChange={(e) => setMentionAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* CHAT & APPEARANCE TAB */}
            {activeTab === 'chat' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Chats & Appearance</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Fine-tune your chat reading and sending preferences.</p>
                </div>

                {/* Font Size */}
                <div className="space-y-3 border-b border-gray-100 pb-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Message Text Size</label>
                  <div className="flex gap-3 max-w-sm">
                    {[
                      { id: 'small', label: 'Small (13px)' },
                      { id: 'medium', label: 'Medium (15px)' },
                      { id: 'large', label: 'Large (17px)' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFontSize(f.id as any)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          fontSize === f.id
                            ? 'border-[#8c0817] bg-red-50 text-[#8c0817]'
                            : 'border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Send action */}
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Press Enter to Send</div>
                      <div className="text-xs text-gray-400">Use Shift + Enter for new lines</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enterToSend}
                      onChange={(e) => setEnterToSend(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Rich Link Previews</div>
                      <div className="text-xs text-gray-400">Generate visual thumbnails for shared URLs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={linkPreviews}
                      onChange={(e) => setLinkPreviews(e.target.checked)}
                      className="w-4 h-4 accent-[#8c0817] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* DEVICES & CALLING TAB */}
            {activeTab === 'devices' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Audio & Video Devices</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Select your microphone, speakers, and camera devices.</p>
                </div>

                <div className="space-y-4">
                  {/* Microphone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Microphone</label>
                    <select className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-[#8c0817]">
                      <option>Default - Realtek High Definition Audio (Built-in)</option>
                      <option>Headset Microphone (Wireless Pro Audio)</option>
                    </select>
                  </div>

                  {/* Speaker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Speaker / Output</label>
                    <div className="flex gap-3 max-w-md">
                      <select className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-[#8c0817]">
                        <option>Default - Realtek High Definition Audio</option>
                        <option>Headphones (Wireless Stereo)</option>
                      </select>
                      <button
                        onClick={handleTestAudio}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 dark:bg-slate-800/80 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        {isTestingAudio ? 'Playing...' : 'Test Sound'}
                      </button>
                    </div>
                  </div>

                  {/* Camera */}
                  <div className="space-y-2 border-t border-gray-100 pt-5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Camera Device</label>
                    <select className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-[#8c0817]">
                      <option>Integrated HD Webcam (1080p 60fps)</option>
                    </select>
                  </div>

                  {/* Noise Suppression */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Noise Suppression</label>
                    <div className="flex gap-2 max-w-md">
                      {(['auto', 'high', 'low', 'off'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setNoiseSuppression(lvl)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase cursor-pointer transition-all ${
                            noiseSuppression === lvl
                              ? 'border-[#8c0817] bg-red-50 text-[#8c0817]'
                              : 'border-gray-200 bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">About Synexa</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Enterprise communications platform.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#fafbfc] border border-gray-200/80 flex flex-col items-center text-center max-w-md mx-auto">
                  <div className="w-16 h-16 flex items-center justify-center mb-4">
                    <SynexaLogo size={64} variant="color" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-slate-100 m-0">Synexa Desktop & Web Client</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">Version 2.4.0 (Enterprise Pro Edition)</p>

                  <div className="mt-5 w-full">
                    <button
                      onClick={handleCheckUpdate}
                      disabled={isCheckingUpdate}
                      className="w-full py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 dark:bg-slate-800/80 text-xs font-extrabold text-gray-800 dark:text-slate-200 cursor-pointer shadow-sm transition-all"
                    >
                      {isCheckingUpdate ? 'Checking for updates…' : 'Check for Updates'}
                    </button>
                    {updateStatus && (
                      <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {updateStatus}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-6 text-xs text-gray-400 font-semibold">
                  <a href="#" className="hover:text-[#8c0817] transition-colors">Terms of Service</a>
                  <span>•</span>
                  <a href="#" className="hover:text-[#8c0817] transition-colors">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" className="hover:text-[#8c0817] transition-colors">Licenses</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
