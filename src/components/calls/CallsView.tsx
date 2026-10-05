import { useEffect, useState } from 'react'
import { ArrowLeft, Phone, Video, Search, PhoneIncoming, PhoneOutgoing, MessageSquare } from 'lucide-react'
import type { Notification, User, Room } from '../../types/chat'
import { roomName } from '../../utils/chatHelpers'
import { Avatar } from '../common/Avatar'
import { callsService } from '../../services/callsService'
import type { CallHistoryFilter, CallHistoryItem } from '../../services/callsService'

export function CallsView({
  me,
  rooms,
  onBack,
  onStartCall,
  onOpenChat,
  missedNotifications = [],
  onMarkMissedNotificationRead,
  filterRoom = null,
}: {
  me: User | null
  rooms: Room[]
  onBack: () => void
  onStartCall: (roomId: string, callType: 'audio' | 'video') => void
  onOpenChat?: (room: Room) => void
  missedNotifications: Notification[]
  onMarkMissedNotificationRead: (notificationId: string) => Promise<void>
  filterRoom?: Room | null
}) {
  const [activeTab, setActiveTab] = useState<'history' | 'contacts'>('history')
  const [historyFilter, setHistoryFilter] = useState<CallHistoryFilter>('all')
  const [history, setHistory] = useState<CallHistoryItem[]>([])
  const [nextBefore, setNextBefore] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null)
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(filterRoom?.id ?? null)
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  const directRooms = rooms.filter(room => !room.isGroup)

  useEffect(() => {
    if (filterRoom) {
      setActiveTab('history')
      setSelectedRoomId(filterRoom.id)
    }
  }, [filterRoom])

  useEffect(() => {
    if (activeTab !== 'history') return
    let isCancelled = false
    setHistoryLoading(true)
    void callsService.getHistory(historyFilter).then(page => {
      if (isCancelled) return
      setHistory(page.calls)
      setNextBefore(page.nextBefore)
      setHistoryError(null)
      if (page.calls.length > 0 && !selectedCallId) {
        setSelectedCallId(page.calls[0].id)
        if (!filterRoom) setSelectedRoomId(page.calls[0].roomId)
      }
    }).catch(error => {
      if (!isCancelled) setHistoryError(error instanceof Error ? error.message : 'Unable to load call history.')
    }).finally(() => {
      if (!isCancelled) setHistoryLoading(false)
    })
    return () => { isCancelled = true }
  }, [activeTab, historyFilter])

  const selectHistoryFilter = (filter: CallHistoryFilter) => {
    if (filter === historyFilter) return
    setHistoryFilter(filter)
    setHistory([])
    setNextBefore(null)
    setHistoryError(null)
    setHistoryLoading(true)
  }

  const loadMoreHistory = async () => {
    if (!nextBefore || historyLoading) return
    setHistoryLoading(true)
    try {
      const page = await callsService.getHistory(historyFilter, nextBefore)
      setHistory(previous => [...previous, ...page.calls])
      setNextBefore(page.nextBefore)
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Unable to load more call history.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const markMissedNotificationRead = async (notificationId: string) => {
    setMarkingNotificationId(notificationId)
    try {
      await onMarkMissedNotificationRead(notificationId)
    } finally {
      setMarkingNotificationId(null)
    }
  }

  // Filter history list for search query
  let displayedHistory = filterRoom
    ? history.filter(c => c.roomId === filterRoom.id)
    : history

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    displayedHistory = displayedHistory.filter(c => {
      const peerName = typeof c.peer === 'string' ? c.peer : c.peer?.name || ''
      return peerName.toLowerCase().includes(q)
    })
  }

  const displayedMissedNotifications = filterRoom
    ? missedNotifications.filter(n => n.roomId === filterRoom.id)
    : missedNotifications

  // Selected room calculation
  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || filterRoom || (displayedHistory.length > 0 ? rooms.find(r => r.id === displayedHistory[0].roomId) : null)
  const selectedContact = selectedRoom?.members.find(m => m.userId !== me?.id)?.user
  const selectedRoomName = selectedRoom && me ? roomName(selectedRoom, me.id) : (selectedContact?.name || 'Contact')

  // History timeline for the selected room
  const selectedRoomHistory = history.filter(c => c.roomId === selectedRoom?.id)

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#090d16] overflow-hidden select-none">
      {/* Desktop Header */}
      <header className="h-16 px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          {filterRoom && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-lg border-0 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
              title="Back to Chat"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 flex items-center justify-center font-bold">
              <Phone size={20} />
            </span>
            <div>
              <h1 className="m-0 text-base font-bold text-gray-900 dark:text-slate-100">
                {filterRoom ? `Call History: ${roomName(filterRoom, me?.id || '')}` : 'Calls Workspace'}
              </h1>
              <p className="m-0 mt-0.5 text-xs font-medium text-gray-500 dark:text-slate-400">
                {filterRoom ? 'Voice and video call records for this contact' : 'Direct voice & video calling desktop portal'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2-Column Desktop & Mobile Responsive Body */}
      <div className="flex flex-1 h-full min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Calls & Contacts List */}
        <div className={`w-full md:w-[380px] shrink-0 h-full border-r border-gray-100 dark:border-slate-800 flex-col bg-white dark:bg-[#0f172a] ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Sub-header Tabs & Search */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 space-y-3 shrink-0">
            {!filterRoom ? (
              <div className="flex items-center justify-between">
                <nav className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-lg">
                  {([
                    { id: 'history', label: 'History' },
                    { id: 'contacts', label: 'Contacts' },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1 rounded-md border-0 text-xs font-bold cursor-pointer transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-slate-700 text-[#2563eb] dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {activeTab === 'history' && (
                  <div className="flex gap-1">
                    {(['all', 'missed'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => selectHistoryFilter(filter)}
                        className={`px-2.5 py-1 rounded-md border-0 text-[11px] font-bold capitalize cursor-pointer transition-colors ${
                          historyFilter === filter
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-[#2563eb] dark:text-blue-400'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                        }`}
                      >
                        {filter === 'all' ? 'All' : 'Missed'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Contact Call Log</span>
                {activeTab === 'history' && (
                  <div className="flex gap-1">
                    {(['all', 'missed'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => selectHistoryFilter(filter)}
                        className={`px-2.5 py-1 rounded-md border-0 text-[11px] font-bold capitalize cursor-pointer transition-colors ${
                          historyFilter === filter
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-[#2563eb] dark:text-blue-400'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                        }`}
                      >
                        {filter === 'all' ? 'All' : 'Missed'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search recent calls..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 border-none rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeTab === 'contacts' ? (
              directRooms.length ? (
                directRooms.map(room => {
                  const contact = room.members.find(m => m.userId !== me?.id)?.user
                  const name = me ? roomName(room, me.id) : 'Contact'
                  if (searchQuery.trim() && !name.toLowerCase().includes(searchQuery.toLowerCase())) return null
                  const isSelected = selectedRoomId === room.id

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        setSelectedRoomId(room.id)
                        setShowMobileDetail(true)
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 shadow-sm border border-blue-200/80 dark:border-blue-800/60 font-semibold'
                          : 'bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-100/70 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={name} src={contact?.avatarUrl} size={40} online={contact?.isOnline} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{name}</div>
                          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                            {contact?.isOnline ? 'Online' : 'Direct Chat'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onStartCall(room.id, 'audio') }}
                          className="w-7 h-7 rounded-md border-0 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-[#2563eb]"
                          title="Voice Call"
                        >
                          <Phone size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onStartCall(room.id, 'video') }}
                          className="w-7 h-7 rounded-md border-0 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-[#2563eb]"
                          title="Video Call"
                        >
                          <Video size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">No contacts available.</div>
              )
            ) : (
              displayedHistory.length > 0 ? (
                displayedHistory.map(call => {
                  const peer = typeof call.peer === 'string' ? { name: call.peer } : call.peer
                  const isSelected = selectedCallId ? selectedCallId === call.id : selectedRoomId === call.roomId
                  const timestamp = new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const isIncoming = call.direction === 'incoming'
                  const isMissed = call.status === 'missed'

                  return (
                    <div
                      key={call.id}
                      onClick={() => {
                        setSelectedCallId(call.id)
                        setSelectedRoomId(call.roomId)
                        setShowMobileDetail(true)
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 shadow-sm border border-blue-200/80 dark:border-blue-800/60 font-semibold'
                          : 'bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-100/70 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={peer?.name ?? 'Contact'} src={peer?.avatarUrl} size={40} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                            <span>{peer?.name ?? 'Contact'}</span>
                            {isMissed && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-[#2563eb] dark:text-blue-400">
                                Missed
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            {isIncoming ? (
                              <PhoneIncoming size={11} className={isMissed ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'} />
                            ) : (
                              <PhoneOutgoing size={11} className="text-blue-600 dark:text-blue-400" />
                            )}
                            <span className="capitalize">{call.type}</span>
                            <span>•</span>
                            <span>{timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); onStartCall(call.roomId, call.type) }}
                        className="w-7 h-7 rounded-md border-0 bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-100"
                        title="Call Back"
                      >
                        {call.type === 'video' ? <Video size={14} /> : <Phone size={13} />}
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  {historyLoading ? 'Loading calls...' : 'No calls found.'}
                </div>
              )
            )}

            {nextBefore && !historyLoading && (
              <div className="p-3">
                <button
                  onClick={() => { void loadMoreHistory() }}
                  className="w-full py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#2563eb] cursor-pointer hover:bg-blue-50"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop & Mobile Call Details & Log Panel */}
        <div className={`flex-1 h-full flex-col bg-gray-50/50 dark:bg-[#090d16] overflow-y-auto p-4 sm:p-6 md:p-8 ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
          {showMobileDetail && (
            <button
              onClick={() => setShowMobileDetail(false)}
              className="md:hidden flex items-center gap-2 mb-4 text-xs font-bold text-[#2563eb] dark:text-blue-400 border-0 bg-blue-50 dark:bg-blue-900/30 px-3.5 py-2 rounded-xl cursor-pointer self-start"
            >
              <ArrowLeft size={16} /> Back to Call List
            </button>
          )}
          {selectedRoom ? (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              
              {/* Profile Card Banner */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <Avatar name={selectedRoomName} src={selectedContact?.avatarUrl} size={84} online={selectedContact?.isOnline} />
                <h2 className="m-0 mt-3 text-lg font-bold text-gray-900 dark:text-slate-100">{selectedRoomName}</h2>
                <p className="m-0 mt-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                  {selectedContact?.isOnline ? 'Online now' : selectedContact?.email || 'Direct Conversation'}
                </p>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => onStartCall(selectedRoom.id, 'audio')}
                    className="px-4 py-2 rounded-xl border-0 bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <Phone size={15} /> Voice Call
                  </button>
                  <button
                    onClick={() => onStartCall(selectedRoom.id, 'video')}
                    className="px-4 py-2 rounded-xl border-0 bg-[#2563eb] text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Video size={15} /> Video Call
                  </button>
                  {onOpenChat && (
                    <button
                      onClick={() => onOpenChat(selectedRoom)}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <MessageSquare size={15} /> Open Chat
                    </button>
                  )}
                </div>
              </div>

              {/* Call History Timeline for Selected Contact */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Call Log History with {selectedRoomName}
                </h3>

                {selectedRoomHistory.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {selectedRoomHistory.map(call => {
                      const timestamp = new Date(call.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                      const duration = call.durationSeconds > 0
                        ? `${Math.floor(call.durationSeconds / 60)}m ${String(call.durationSeconds % 60).padStart(2, '0')}s`
                        : call.status === 'missed' ? 'Missed' : call.status

                      const isIncoming = call.direction === 'incoming'
                      const isMissed = call.status === 'missed'

                      return (
                        <div key={call.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMissed ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                              {call.type === 'video' ? <Video size={15} /> : <Phone size={14} />}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                                <span>{isIncoming ? 'Incoming' : 'Outgoing'} {call.type} call</span>
                                {isMissed && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">(Missed)</span>}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                                {timestamp}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs font-bold text-gray-700 dark:text-slate-300">
                            {duration}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400">
                    No past call records logged for this contact.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Phone size={40} className="text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 m-0">Select a contact or call record</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 m-0 mt-1">View full call details, history logs, and instant call options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
