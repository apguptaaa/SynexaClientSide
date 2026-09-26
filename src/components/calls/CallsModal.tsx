import { useState } from 'react'
import type { User, Room } from '../../types/chat'
import { Avatar } from '../common/Avatar'

export interface CallRecord {
  id: string
  contactName: string
  contactEmail: string
  avatarUrl?: string
  type: 'incoming' | 'outgoing' | 'missed'
  callType: 'audio' | 'video'
  timestamp: string
  duration: string
  isOnline?: boolean
}

export function CallsModal({
  isOpen,
  onClose,
  me: _me,
  rooms: _rooms
}: {
  isOpen: boolean
  onClose: () => void
  me: User | null
  rooms: Room[]
}) {
  const [activeTab, setActiveTab] = useState<'history' | 'speedDial' | 'dialPad'>('history')
  const [historyFilter, setHistoryFilter] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all')
  const [dialNumber, setDialNumber] = useState('')
  const [activeCall, setActiveCall] = useState<{
    contactName: string
    avatarUrl?: string
    callType: 'audio' | 'video'
    status: 'ringing' | 'connected'
  } | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  // Demo call history data
  const [callHistory, setCallHistory] = useState<CallRecord[]>([
    {
      id: 'c-1',
      contactName: 'Alex Morgan',
      contactEmail: 'alex.m@synexa.com',
      type: 'incoming',
      callType: 'video',
      timestamp: 'Today, 11:20 AM',
      duration: '14m 32s',
      isOnline: true
    },
    {
      id: 'c-2',
      contactName: 'Sarah Chen',
      contactEmail: 'sarah.c@synexa.com',
      type: 'missed',
      callType: 'audio',
      timestamp: 'Today, 09:45 AM',
      duration: 'Missed Call',
      isOnline: true
    },
    {
      id: 'c-3',
      contactName: 'David Kim',
      contactEmail: 'david.k@synexa.com',
      type: 'outgoing',
      callType: 'audio',
      timestamp: 'Yesterday, 04:15 PM',
      duration: '06m 18s',
      isOnline: false
    },
    {
      id: 'c-4',
      contactName: 'Emily Watson',
      contactEmail: 'emily.w@synexa.com',
      type: 'incoming',
      callType: 'video',
      timestamp: 'Yesterday, 02:00 PM',
      duration: '28m 45s',
      isOnline: true
    },
    {
      id: 'c-5',
      contactName: 'Michael Scott',
      contactEmail: 'm.scott@synexa.com',
      type: 'missed',
      callType: 'audio',
      timestamp: '24 Sep, 05:30 PM',
      duration: 'Missed Call',
      isOnline: false
    }
  ])

  if (!isOpen) return null

  const filteredHistory = callHistory.filter((c) => {
    if (historyFilter === 'all') return true
    return c.type === historyFilter
  })

  const startCall = (contactName: string, callType: 'audio' | 'video', avatarUrl?: string) => {
    setActiveCall({
      contactName,
      avatarUrl,
      callType,
      status: 'ringing'
    })

    setTimeout(() => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null))
    }, 2000)
  }

  const endCall = () => {
    if (activeCall) {
      const newRecord: CallRecord = {
        id: `c-${Date.now()}`,
        contactName: activeCall.contactName,
        contactEmail: `${activeCall.contactName.toLowerCase().replace(/\s+/g, '.')}@synexa.com`,
        avatarUrl: activeCall.avatarUrl,
        type: 'outgoing',
        callType: activeCall.callType,
        timestamp: 'Just now',
        duration: activeCall.status === 'connected' ? '00:45s' : 'Cancelled',
        isOnline: true
      }
      setCallHistory((prev) => [newRecord, ...prev])
    }
    setActiveCall(null)
  }

  const dialPadKeys = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' },
    { num: '0', sub: '+' },
    { num: '#', sub: '' }
  ]

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center font-sans p-0 md:p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-[#0f172a] w-full h-full md:max-w-[940px] md:h-[660px] md:max-h-[90vh] md:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden border-0 md:border border-gray-100 dark:border-slate-800 relative">
        {/* Header */}
        <div className="h-16 px-4 md:px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#8c0817] dark:text-red-300 flex items-center justify-center font-bold text-sm border border-red-100 dark:border-red-900/40 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold text-[#1f2937] dark:text-slate-100 m-0 tracking-[-0.01em] truncate">Calls</h3>
              <p className="text-[0.7rem] md:text-xs text-gray-400 dark:text-slate-500 font-medium m-0 truncate">History & dial pad</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setActiveTab('dialPad')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-[#8c0817] text-white text-xs font-bold border-none cursor-pointer hover:bg-red-800 transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Call</span>
            </button>
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
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 px-3 md:px-6 bg-white dark:bg-[#0f172a] shrink-0 overflow-x-auto">
          {[
            { id: 'history', label: 'Call History', count: callHistory.length },
            { id: 'speedDial', label: 'Speed Dial & Contacts' },
            { id: 'dialPad', label: 'Dial Pad' }
          ].map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 border-none cursor-pointer font-bold text-xs bg-transparent transition-all flex items-center gap-2 ${
                  active
                    ? 'text-[#8c0817] dark:text-red-400 border-b-2 border-b-[#8c0817] dark:border-b-red-400'
                    : 'text-gray-400 dark:text-slate-500 border-b-2 border-b-transparent hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[0.7rem] font-bold ${active ? 'bg-red-50 dark:bg-red-950/40 text-[#8c0817] dark:text-red-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfdfe] dark:bg-[#0b0f19]">
          {/* TAB 1: CALL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex gap-2">
                {(['all', 'missed', 'incoming', 'outgoing'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold capitalize cursor-pointer transition-all ${
                      historyFilter === filter
                        ? 'border-[#8c0817] dark:border-red-500 bg-red-50 dark:bg-red-950/30 text-[#8c0817] dark:text-red-400'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {filter === 'all' ? 'All Calls' : filter}
                  </button>
                ))}
              </div>

              {/* History list */}
              {filteredHistory.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-gray-400 dark:text-slate-500">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-slate-300 m-0 mb-1">No call records found</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 m-0">Your recent call logs will appear here.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200/70 dark:border-slate-700/70 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700/60 shadow-sm">
                  {filteredHistory.map((call) => {
                    const isMissed = call.type === 'missed'

                    return (
                      <div
                        key={call.id}
                        className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition-colors group"
                      >
                        {/* Contact Info & Direction Icon */}
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <Avatar name={call.contactName} src={call.avatarUrl} size={42} online={call.isOnline} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold truncate ${isMissed ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-slate-100'}`}>
                                {call.contactName}
                              </span>
                              {isMissed && (
                                <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[0.68rem] font-bold border border-red-100 dark:border-red-900/40">
                                  Missed
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                              {/* Vector Direction Arrows */}
                              {call.type === 'incoming' && (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="7" y1="7" x2="17" y2="17"></line>
                                    <polyline points="17 7 17 17 7 17"></polyline>
                                  </svg>
                                  Incoming
                                </span>
                              )}
                              {call.type === 'outgoing' && (
                                <span className="text-blue-600 font-bold flex items-center gap-1">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                  </svg>
                                  Outgoing
                                </span>
                              )}
                              {call.type === 'missed' && (
                                <span className="text-red-500 font-bold flex items-center gap-1">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="7" y1="7" x2="17" y2="17"></line>
                                    <polyline points="17 7 17 17 7 17"></polyline>
                                  </svg>
                                  Missed
                                </span>
                              )}
                              <span className="text-gray-300">•</span>
                              <span>{call.timestamp}</span>
                              <span className="text-gray-300">•</span>
                              <span>{call.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Call Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startCall(call.contactName, 'audio', call.avatarUrl)}
                            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/40 hover:border-red-200 dark:hover:border-red-800 hover:text-[#8c0817] dark:hover:text-red-400 text-gray-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                            title="Start Audio Call"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => startCall(call.contactName, 'video', call.avatarUrl)}
                            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/40 hover:border-red-200 dark:hover:border-red-800 hover:text-[#8c0817] dark:hover:text-red-400 text-gray-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                            title="Start Video Call"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="23 7 16 12 23 17 23 7"></polygon>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SPEED DIAL & CONTACTS */}
          {activeTab === 'speedDial' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 m-0">Suggested & Frequent Contacts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { name: 'Alex Morgan', role: 'Engineering Lead', online: true },
                  { name: 'Sarah Chen', role: 'Product Designer', online: true },
                  { name: 'David Kim', role: 'Full Stack Dev', online: false },
                  { name: 'Emily Watson', role: 'QA Engineer', online: true },
                  { name: 'Michael Scott', role: 'Regional Manager', online: false },
                  { name: 'Jim Halpert', role: 'Sales Lead', online: true }
                ].map((c) => (
                  <div
                    key={c.name}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-700/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={c.name} size={42} online={c.online} />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{c.name}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-500 font-medium truncate">{c.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startCall(c.name, 'audio')}
                        className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#8c0817] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center border-none cursor-pointer transition-colors"
                        title="Voice Call"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => startCall(c.name, 'video')}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center border-none cursor-pointer transition-colors"
                        title="Video Call"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIAL PAD */}
          {activeTab === 'dialPad' && (
            <div className="max-w-xs mx-auto flex flex-col items-center py-2 animate-[fadeIn_0.2s_ease-out]">
              {/* Dial number input display */}
              <div className="w-full mb-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-center shadow-sm">
                <input
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                  placeholder="Type a name or phone number"
                  className="w-full text-center text-lg font-bold text-gray-800 dark:text-slate-100 outline-none border-none bg-transparent placeholder:text-xs placeholder:font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Number Keys Pad */}
              <div className="grid grid-cols-3 gap-3 w-full mb-5">
                {dialPadKeys.map((key) => (
                  <button
                    key={key.num}
                    onClick={() => setDialNumber((prev) => prev + key.num)}
                    className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 transition-all active:scale-95"
                  >
                    <span className="text-base font-bold text-gray-800 dark:text-slate-100 leading-none">{key.num}</span>
                    {key.sub && <span className="text-[0.62rem] font-bold text-gray-400 dark:text-slate-500 mt-0.5">{key.sub}</span>}
                  </button>
                ))}
              </div>

              {/* Call Trigger Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  disabled={!dialNumber.trim()}
                  onClick={() => startCall(dialNumber, 'audio')}
                  className="flex-1 py-3.5 rounded-2xl bg-[#8c0817] text-white font-bold text-xs flex items-center justify-center gap-2 border-none shadow-md cursor-pointer hover:bg-red-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Call
                </button>

                {dialNumber && (
                  <button
                    onClick={() => setDialNumber((prev) => prev.slice(0, -1))}
                    className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center border-none cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    title="Backspace"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                      <line x1="18" y1="9" x2="12" y2="15"></line>
                      <line x1="12" y1="9" x2="18" y2="15"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* IN-CALL OVERLAY SCREEN */}
        {activeCall && (
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-30 flex flex-col items-center justify-between p-8 text-white animate-[fadeIn_0.2s_ease-out]">
            {/* Top Bar */}
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-gray-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                256-bit Encrypted Call
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {activeCall.status === 'ringing' ? 'Ringing…' : 'Connected (00:24)'}
              </span>
            </div>

            {/* Center Contact Info */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full ring-8 ring-white/10 flex items-center justify-center animate-pulse">
                  <Avatar name={activeCall.contactName} src={activeCall.avatarUrl} size={96} />
                </div>
                {activeCall.status === 'ringing' && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#8c0817] text-[0.7rem] font-bold text-white">
                    Calling…
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white m-0 tracking-tight">{activeCall.contactName}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {activeCall.callType === 'video' ? 'Synexa HD Video Call' : 'Synexa High-Definition Audio Call'}
              </p>
            </div>

            {/* Bottom Call Controls */}
            <div className="flex items-center gap-4">
              {/* Mute button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer transition-all ${
                  isMuted ? 'bg-red-600 text-white' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title="Mute"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                </svg>
              </button>

              {/* Video toggle button */}
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer transition-all ${
                  isVideoOff ? 'bg-red-600 text-white' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title="Camera"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center border-none shadow-[0_6px_24px_rgba(220,38,38,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title="End Call"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rotate-[135deg]">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
