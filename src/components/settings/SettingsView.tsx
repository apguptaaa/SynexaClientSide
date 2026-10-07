import { useEffect, useState } from 'react'
import type { User, UserPrivacySettings } from '../../types/chat'
import { getCallMediaDevices, saveCallMediaDevice } from '../../utils/mediaDevicePreferences'
import { Avatar } from '../common/Avatar'
import { SynexaLogo } from '../common/SynexaLogo'
import { useTheme } from '../../hooks/useTheme'
import { Bluetooth, ArrowLeft, MessageCircle, X } from 'lucide-react'
import { chatService } from '../../services/chatService'

export function SettingsView({
  me,
  editName,
  setEditName,
  handleSaveProfile,
  savingProfile,
  profileFileRef,
  uploadingAvatar
}: {
  me: User | null
  editName: string
  setEditName: (v: string) => void
  handleSaveProfile: () => void
  savingProfile: boolean
  profileFileRef?: React.RefObject<HTMLInputElement | null>
  handleProfileAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadingAvatar?: boolean
}) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'general' | 'accounts' | 'privacy' | 'notifications' | 'chat' | 'devices' | 'about'
  >('general')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

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
  const [e2eeStatus, setE2eeStatus] = useState<'active' | 'inactive' | string>('inactive')

  useEffect(() => {
    let isMounted = true

    const loadPrivacySettings = async () => {
      try {
        const settings = await chatService.getMyPrivacySettings()
        if (!isMounted) return

        setReadReceipts(settings.readReceiptsEnabled)
        setTypingIndicator(settings.typingIndicatorsEnabled)
        setLastSeenVis(settings.lastSeenVisibility)
        setE2eeStatus(settings.e2eeStatus ?? 'inactive')
      } catch (error) {
        console.error('Unable to load privacy settings', error)
      }
    }

    void loadPrivacySettings()

    return () => {
      isMounted = false
    }
  }, [])

  const updatePrivacySettings = async (patch: Partial<UserPrivacySettings>) => {
    const previous = {
      readReceiptsEnabled: readReceipts,
      typingIndicatorsEnabled: typingIndicator,
      lastSeenVisibility: lastSeenVis,
    }

    const nextState = {
      readReceiptsEnabled: patch.readReceiptsEnabled ?? previous.readReceiptsEnabled,
      typingIndicatorsEnabled: patch.typingIndicatorsEnabled ?? previous.typingIndicatorsEnabled,
      lastSeenVisibility: patch.lastSeenVisibility ?? previous.lastSeenVisibility,
    }

    setReadReceipts(nextState.readReceiptsEnabled)
    setTypingIndicator(nextState.typingIndicatorsEnabled)
    setLastSeenVis(nextState.lastSeenVisibility)

    try {
      const updated = await chatService.updateMyPrivacySettings(patch)
      setReadReceipts(updated.readReceiptsEnabled)
      setTypingIndicator(updated.typingIndicatorsEnabled)
      setLastSeenVis(updated.lastSeenVisibility)
      setE2eeStatus(updated.e2eeStatus ?? e2eeStatus)
    } catch (error) {
      console.error('Unable to save privacy settings', error)
      setReadReceipts(previous.readReceiptsEnabled)
      setTypingIndicator(previous.typingIndicatorsEnabled)
      setLastSeenVis(previous.lastSeenVisibility)
    }
  }
  
  // Notifications
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [desktopBanners, setDesktopBanners] = useState(true)
  const [messagePreview, setMessagePreview] = useState(true)
  const [mentionAlerts, setMentionAlerts] = useState(true)

  // Chat
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [enterToSend, setEnterToSend] = useState(true)
  const [linkPreviews, setLinkPreviews] = useState(true)

  // Audio / Video
  const [noiseSuppression, setNoiseSuppression] = useState<'auto' | 'high' | 'low' | 'off'>('auto')
  const [isTestingAudio, setIsTestingAudio] = useState(false)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevices, setSelectedDevices] = useState(getCallMediaDevices)
  const [deviceMessage, setDeviceMessage] = useState<string | null>(null)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    let isCancelled = false
    const refreshDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        if (!isCancelled) setAvailableDevices(devices)
      } catch {
        if (!isCancelled) setDeviceMessage('Unable to list audio and video devices in this browser.')
      }
    }
    const handleDeviceChange = () => { void refreshDevices() }
    void refreshDevices()
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      isCancelled = true
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [])

  const selectDevice = (key: keyof ReturnType<typeof getCallMediaDevices>, value: string) => {
    setSelectedDevices(previous => ({ ...previous, [key]: value }))
    saveCallMediaDevice(key, value)
    setDeviceMessage(null)
  }

  const chooseAudioOutput = async () => {
    const mediaDevices = navigator.mediaDevices as MediaDevices & {
      selectAudioOutput?: () => Promise<MediaDeviceInfo>
    }
    if (!mediaDevices.selectAudioOutput) {
      setDeviceMessage('This browser cannot select call audio output. Choose the Bluetooth headset as the system audio output.')
      return
    }
    try {
      const device = await mediaDevices.selectAudioOutput()
      setAvailableDevices(previous => [
        ...previous.filter(item => item.deviceId !== device.deviceId),
        device,
      ])
      selectDevice('audioOutputId', device.deviceId)
      setDeviceMessage(`Call audio will use ${device.label || 'the selected output device'}.`)
    } catch (error) {
      setDeviceMessage(error instanceof Error && error.name === 'NotAllowedError'
        ? 'Audio output permission was denied. Allow speaker selection in browser settings.'
        : 'Could not select an audio output device.')
    }
  }

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

  const activeTabMeta = tabs.find(t => t.id === activeTab) || tabs[0]

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#090d16] overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 px-4 md:px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile Back Arrow: Only visible in mobile when viewing detail/subheading settings */}
          {mobileDetailOpen && (
            <button
              onClick={() => setMobileDetailOpen(false)}
              className="md:hidden p-2 -ml-1 rounded-xl text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
              aria-label="Back to settings list"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="flex items-center gap-3">
            {/* Setting Icon: Hidden on mobile when child detail view is open */}
            <span className={`${mobileDetailOpen ? 'hidden md:flex' : 'flex'} w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 items-center justify-center font-bold`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
            <div>
              <h1 className="m-0 text-base font-bold text-gray-900 dark:text-slate-100">
                {/* On mobile, show current active section label if detail view is open */}
                <span className="md:inline hidden">Settings</span>
                <span className="md:hidden inline">{mobileDetailOpen ? activeTabMeta.label : 'Settings'}</span>
              </h1>
              <p className="m-0 mt-0.5 text-xs font-medium text-gray-500 dark:text-slate-400">
                <span className="md:inline hidden">Application & user preferences</span>
                <span className="md:hidden inline">{mobileDetailOpen ? 'Settings > ' + activeTabMeta.label : 'Application & user preferences'}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2-Column Responsive Body */}
      <div className="flex flex-1 h-full min-h-0 overflow-hidden">
        {/* Left Settings Tabs List */}
        <div className={`w-full md:w-64 shrink-0 h-full border-r border-gray-100 dark:border-slate-800 bg-[#f8f9fb] dark:bg-[#0b0f19] p-3 flex flex-col gap-1 overflow-y-auto ${mobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Navigation
          </div>
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMobileDetailOpen(true)
                }}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl border-none text-left cursor-pointer transition-all duration-200 text-xs md:text-sm font-semibold ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-[#2563eb] dark:text-blue-400 shadow-sm border border-blue-100/60 dark:border-slate-700 font-bold'
                    : 'text-gray-600 dark:text-slate-300 bg-transparent hover:bg-gray-200/60 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={active ? 'text-[#2563eb] dark:text-blue-400' : 'text-gray-400 dark:text-slate-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
                {/* Mobile disclosure arrow */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:hidden text-gray-400">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )
          })}
        </div>

        {/* Right Settings Content Details Pane */}
        <div className={`flex-1 h-full overflow-y-auto p-4 md:p-8 bg-white dark:bg-[#0f172a] text-gray-800 dark:text-slate-100 flex-col ${mobileDetailOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="max-w-3xl">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-7 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">General Preferences</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Manage theme, startup preferences, and language.</p>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3 border-b border-gray-100 dark:border-slate-800 pb-6">
                  <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400">Theme</label>
                  <div className="grid max-w-lg grid-cols-2 gap-3">
                    {[
                      { id: 'light', label: 'Light', desc: 'Default bright style', panel: 'bg-white text-slate-900 border border-slate-200' },
                      { id: 'dark', label: 'Dark', desc: 'Easy on the eyes', panel: 'bg-slate-900 text-white border border-slate-700' }
                    ].map((t) => {
                      const selected = theme === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id as any)}
                          className={`rounded-2xl border p-3 text-left transition-all duration-200 ${
                            selected
                              ? 'border-[#2563eb] bg-[#0f172a] shadow-[0_0_0_1px_rgba(37,99,235,0.2)] dark:border-blue-500 dark:bg-slate-900/70'
                              : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className={`mb-3 flex h-14 items-center justify-center rounded-xl text-sm font-bold ${t.panel}`}>
                            {t.label}
                          </div>
                          <div className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-200 dark:text-slate-100'}`}>{t.label}</div>
                          <div className="mt-1 text-[0.7rem] text-slate-400 dark:text-slate-400">{t.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3 border-b border-gray-100 dark:border-slate-800 pb-6">
                  <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400">App Language</label>
                  <div className="relative max-w-lg">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 pr-10 text-sm font-semibold text-slate-100 outline-none transition-colors focus:border-[#2563eb] focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800/80"
                    >
                      <option value="en-US">English (United States)</option>
                      <option value="en-GB">English (United Kingdom)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="es-ES">Spanish (Español)</option>
                      <option value="fr-FR">French (Français)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
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
                        className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                        className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                        className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setImagePreviewOpen(true)}
                      aria-label="View profile photo"
                      className="block rounded-full border-0 bg-transparent p-0 cursor-zoom-in"
                    >
                      <Avatar name={me?.name || 'User'} src={me?.avatarUrl} size={64} online={me?.isOnline} />
                    </button>
                    {profileFileRef && (
                      <button
                        onClick={() => {
                          profileFileRef.current?.click()
                        }}
                        disabled={uploadingAvatar}
                        aria-label="Change profile photo"
                        className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-[#2563eb] px-1.5 py-1 text-[0.55rem] font-bold text-white shadow dark:border-slate-800"
                      >
                        {uploadingAvatar ? '...' : 'Change'}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="m-0 truncate text-base font-bold text-gray-900 dark:text-slate-100">{me?.name || 'User'}</h4>
                    <p className="mt-1 truncate text-xs font-medium text-gray-500 dark:text-slate-400">{me?.email || 'user@synexa.com'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Online & Ready</span>
                    </div>
                  </div>
                </div>

                {/* Edit Display Name */}
                <div className="grid grid-cols-1 gap-2.5 border-b border-gray-100 pb-5 dark:border-slate-800 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                  <label className="pt-3 text-xs font-bold text-gray-500 dark:text-slate-400">Display name</label>
                  <div className="flex max-w-xl items-center gap-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your full name" className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-slate-500" />
                    <button onClick={handleSaveProfile} disabled={savingProfile} className="h-9 shrink-0 rounded-lg border-none bg-[#2563eb] px-4 text-xs font-bold text-white cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-60">
                      {savingProfile ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Status message */}
                <div className="grid grid-cols-1 gap-2.5 border-b border-gray-100 pb-5 dark:border-slate-800 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                  <label className="pt-3 text-xs font-bold text-gray-500 dark:text-slate-400">Status message</label>
                  <div className="max-w-xl">
                    <div className="relative flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 transition-colors focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80">
                      <MessageCircle size={16} className="ml-3.5 shrink-0 text-gray-400 dark:text-slate-500" />
                      <input value={statusMessage} maxLength={80} onChange={(e) => setStatusMessage(e.target.value)} placeholder="Share what you're up to…" className="h-full min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500" />
                      <span className="pr-3 text-[0.68rem] font-medium tabular-nums text-gray-400 dark:text-slate-500">{statusMessage.length}/80</span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">A short note others see on your profile.</p>
                  </div>
                </div>

                {/* Availability */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                  <label className="pt-2 text-xs font-bold text-gray-500 dark:text-slate-400">Availability</label>
                  <div className="grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      { id: 'online', label: 'Available', dot: 'bg-emerald-500' },
                      { id: 'busy', label: 'Busy', dot: 'bg-blue-500' },
                      { id: 'dnd', label: 'Do Not Disturb', dot: 'bg-rose-600' },
                      { id: 'away', label: 'Be Right Back / Away', dot: 'bg-amber-400' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStatusState(s.id as any)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold cursor-pointer transition-all ${
                          statusState === s.id
                            ? 'border-[#2563eb] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${s.dot}`}></span>
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

                <div className="space-y-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-slate-200">Read Receipts (Blue Ticks)</div>
                      <div className="text-xs text-gray-400">Let others know when you have read their messages</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={readReceipts}
                      onChange={(e) => {
                        void updatePrivacySettings({ readReceiptsEnabled: e.target.checked })
                      }}
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                      onChange={(e) => {
                        void updatePrivacySettings({ typingIndicatorsEnabled: e.target.checked })
                      }}
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Who can see my last seen</label>
                  <div className="flex gap-3 max-w-md">
                    {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          void updatePrivacySettings({ lastSeenVisibility: opt })
                        }}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold capitalize cursor-pointer transition-all ${
                          lastSeenVis === opt
                            ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                            : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-800 dark:text-slate-200">End-to-End Encryption</div>
                    <div className="text-xs text-gray-400">Your direct messages are protected with 256-bit encryption</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-extrabold text-[0.72rem] ${
                      e2eeStatus === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {e2eeStatus === 'active' ? 'ACTIVE' : String(e2eeStatus ?? 'INACTIVE').toUpperCase()}
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
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                <div className="space-y-3 border-b border-gray-100 dark:border-slate-800 pb-6">
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
                            ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                            : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
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
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                      className="w-4 h-4 accent-[#2563eb] cursor-pointer"
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
                    <select
                      value={selectedDevices.audioInputId}
                      onChange={event => selectDevice('audioInputId', event.target.value)}
                      className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-[#2563eb]"
                    >
                      <option value="">System default</option>
                      {availableDevices.filter(device => device.kind === 'audioinput').map((device, index) => (
                        <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>
                      ))}
                    </select>
                  </div>

                  {/* Speaker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Speaker / Output</label>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                      <select
                        value={selectedDevices.audioOutputId}
                        onChange={event => selectDevice('audioOutputId', event.target.value)}
                        className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-[#2563eb]"
                      >
                        <option value="">System default</option>
                        {availableDevices.filter(device => device.kind === 'audiooutput').map((device, index) => (
                          <option key={device.deviceId} value={device.deviceId}>{device.label || `Speaker ${index + 1}`}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { void chooseAudioOutput() }}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white hover:bg-gray-50 dark:bg-slate-800/80 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Bluetooth size={15} /> Choose output
                      </button>
                      <button
                        onClick={handleTestAudio}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white hover:bg-gray-50 dark:bg-slate-800/80 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
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
                  <div className="space-y-2 border-t border-gray-100 dark:border-slate-800 pt-5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Camera Device</label>
                    <select
                      value={selectedDevices.videoInputId}
                      onChange={event => selectDevice('videoInputId', event.target.value)}
                      className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-[#2563eb]"
                    >
                      <option value="">System default</option>
                      {availableDevices.filter(device => device.kind === 'videoinput').map((device, index) => (
                        <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>
                      ))}
                    </select>
                  </div>

                  {deviceMessage && <p role="status" className="m-0 text-xs text-gray-600 dark:text-slate-300">{deviceMessage}</p>}

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
                              ? 'border-[#2563eb] bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400'
                              : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
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

                <div className="p-6 rounded-2xl bg-[#fafbfc] dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-700 flex flex-col items-center text-center max-w-md mx-auto">
                  <div className="w-16 h-16 flex items-center justify-center mb-4">
                    <SynexaLogo size={64} variant="color" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-slate-100 m-0">Synexa Desktop & Web Client</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">Version 2.4.0 (Enterprise Pro Edition)</p>

                  <div className="mt-5 w-full">
                    <button
                      onClick={handleCheckUpdate}
                      disabled={isCheckingUpdate}
                      className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white hover:bg-gray-50 dark:bg-slate-800 text-xs font-extrabold text-gray-800 dark:text-slate-200 cursor-pointer shadow-sm transition-all"
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
                  <a href="#" className="hover:text-[#2563eb] transition-colors">Terms of Service</a>
                  <span>•</span>
                  <a href="#" className="hover:text-[#2563eb] transition-colors">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" className="hover:text-[#2563eb] transition-colors">Licenses</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {imagePreviewOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setImagePreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setImagePreviewOpen(false)}
            aria-label="Close profile photo preview"
            className="absolute right-5 top-5 rounded-full border-0 bg-white/15 p-2 text-white hover:bg-white/25"
          >
            <X size={20} />
          </button>
          <div onClick={event => event.stopPropagation()} className="max-h-[85vh] max-w-[85vw] overflow-hidden rounded-2xl shadow-2xl">
            {me?.avatarUrl
              ? <img src={me.avatarUrl} alt={`${me.name}'s profile`} className="max-h-[85vh] max-w-[85vw] object-contain" />
              : <Avatar name={me?.name || 'User'} size={280} />}
          </div>
        </div>
      )}
    </div>
  )
}
