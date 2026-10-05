import { useEffect, useState } from 'react'
import { Clock3, Phone, Video, X } from 'lucide-react'
import type { Notification, User, Room } from '../../types/chat'
import { roomName } from '../../utils/chatHelpers'
import { Avatar } from '../common/Avatar'
import { callsService } from '../../services/callsService'
import type { CallHistoryFilter, CallHistoryItem } from '../../services/callsService'

export function CallsModal({
  isOpen,
  onClose,
  me,
  rooms,
  onStartCall,
  missedNotifications = [],
  onMarkMissedNotificationRead,
}: {
  isOpen: boolean
  onClose: () => void
  me: User | null
  rooms: Room[]
  onStartCall: (roomId: string, callType: 'audio' | 'video') => void
  missedNotifications: Notification[]
  onMarkMissedNotificationRead: (notificationId: string) => Promise<void>
}) {
  const [activeTab, setActiveTab] = useState<'history' | 'contacts'>('contacts')
  const [historyFilter, setHistoryFilter] = useState<CallHistoryFilter>('all')
  const [history, setHistory] = useState<CallHistoryItem[]>([])
  const [nextBefore, setNextBefore] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null)
  const directRooms = rooms.filter(room => !room.isGroup)

  useEffect(() => {
    if (!isOpen || activeTab !== 'history') return
    let isCancelled = false
    void callsService.getHistory(historyFilter).then(page => {
      if (isCancelled) return
      setHistory(page.calls)
      setNextBefore(page.nextBefore)
      setHistoryError(null)
    }).catch(error => {
      if (!isCancelled) setHistoryError(error instanceof Error ? error.message : 'Unable to load call history.')
    }).finally(() => {
      if (!isCancelled) setHistoryLoading(false)
    })
    return () => { isCancelled = true }
  }, [activeTab, historyFilter, isOpen])

  if (!isOpen) return null

  const startCall = (roomId: string, callType: 'audio' | 'video') => {
    onClose()
    onStartCall(roomId, callType)
  }

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

  const showHistory = () => {
    if (activeTab === 'history') return
    setActiveTab('history')
    setHistoryLoading(true)
  }

  const markMissedNotificationRead = async (notificationId: string) => {
    setMarkingNotificationId(notificationId)
    try {
      await onMarkMissedNotificationRead(notificationId)
    } finally {
      setMarkingNotificationId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
      <section className="w-full h-full md:h-[min(680px,90vh)] md:max-w-3xl bg-white dark:bg-[#0f172a] md:rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        <header className="h-16 px-5 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-red-950/40 text-[#2563eb] dark:text-blue-400 flex items-center justify-center">
              <Phone size={18} />
            </span>
            <div>
              <h2 className="m-0 text-base font-bold text-gray-900 dark:text-slate-100">Calls</h2>
              <p className="m-0 mt-0.5 text-xs text-gray-500 dark:text-slate-400">Direct conversations</p>
            </div>
          </div>
          <button onClick={onClose} title="Close calls" aria-label="Close calls" className="w-9 h-9 rounded-lg border-0 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700">
            <X size={18} />
          </button>
        </header>

        <nav className="h-12 px-5 flex items-end gap-5 border-b border-gray-200 dark:border-slate-800 shrink-0">
          {([
            { id: 'contacts', label: 'Contacts' },
            { id: 'history', label: 'History' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.id === 'history' ? showHistory() : setActiveTab('contacts')}
              className={`h-full px-1 border-0 border-b-2 bg-transparent text-xs font-bold cursor-pointer ${activeTab === tab.id ? 'border-[#2563eb] text-[#2563eb] dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-slate-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/70 dark:bg-[#0b0f19]">
          {activeTab === 'contacts' ? (
            directRooms.length ? (
              <div className="divide-y divide-gray-200 dark:divide-slate-800">
                {directRooms.map(room => {
                  const contact = room.members.find(member => member.userId !== me?.id)?.user
                  const name = me ? roomName(room, me.id) : 'Contact'
                  return (
                    <div key={room.id} className="min-h-[72px] flex items-center gap-3 py-3">
                      <Avatar name={name} src={contact?.avatarUrl} size={42} online={contact?.isOnline} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{name}</div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{contact?.isOnline ? 'Online' : 'Direct chat'}</div>
                      </div>
                      <button onClick={() => startCall(room.id, 'audio')} title={`Audio call ${name}`} aria-label={`Audio call ${name}`} className="w-9 h-9 rounded-lg border-0 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center justify-center cursor-pointer hover:bg-blue-100 dark:hover:bg-red-950/50 hover:text-[#2563eb] dark:hover:text-blue-400">
                        <Phone size={16} />
                      </button>
                      <button onClick={() => startCall(room.id, 'video')} title={`Video call ${name}`} aria-label={`Video call ${name}`} className="w-9 h-9 rounded-lg border-0 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center justify-center cursor-pointer hover:bg-blue-100 dark:hover:bg-red-950/50 hover:text-[#2563eb] dark:hover:text-blue-400">
                        <Video size={17} />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full min-h-56 flex flex-col items-center justify-center text-center">
                <Phone size={24} className="text-gray-400 dark:text-slate-500" />
                <p className="mt-3 mb-1 text-sm font-semibold text-gray-700 dark:text-slate-200">No direct chats yet</p>
                <p className="m-0 text-xs text-gray-500 dark:text-slate-400">Start a direct conversation to place a call.</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {missedNotifications.length > 0 && (
                <section className="border-b border-gray-200 dark:border-slate-800 pb-4">
                  <h3 className="m-0 mb-2 text-sm font-bold text-gray-900 dark:text-slate-100">Missed call notifications</h3>
                  <div className="divide-y divide-gray-200 dark:divide-slate-800">
                    {missedNotifications.map(notification => (
                      <div key={notification.id} className="flex items-center gap-3 py-3">
                        <Phone size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-sm text-gray-800 dark:text-slate-200">{notification.message}</p>
                          <p className="m-0 mt-1 text-xs text-gray-500 dark:text-slate-400">
                            {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                        <button
                          onClick={() => { void markMissedNotificationRead(notification.id) }}
                          disabled={markingNotificationId === notification.id}
                          className="shrink-0 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer disabled:opacity-50"
                        >
                          {markingNotificationId === notification.id ? 'Saving...' : 'Mark read'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <div className="flex gap-2">
                {(['all', 'missed'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => selectHistoryFilter(filter)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-semibold capitalize cursor-pointer ${historyFilter === filter ? 'border-[#2563eb] bg-blue-50 text-[#2563eb] dark:bg-red-950/40 dark:text-red-300' : 'border-gray-200 bg-white text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {filter === 'all' ? 'All calls' : 'Missed'}
                  </button>
                ))}
              </div>

              {historyError && <p role="alert" className="m-0 text-sm text-blue-600 dark:text-blue-400">{historyError}</p>}
              {history.length > 0 && (
                <div className="divide-y divide-gray-200 dark:divide-slate-800">
                  {history.map(call => {
                    const peer = typeof call.peer === 'string' ? { name: call.peer } : call.peer
                    const callRoom = directRooms.find(room => room.id === call.roomId)
                    const timestamp = new Date(call.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    const duration = call.durationSeconds > 0
                      ? `${Math.floor(call.durationSeconds / 60)}:${String(call.durationSeconds % 60).padStart(2, '0')}`
                      : call.status === 'missed' ? 'Missed' : call.status
                    return (
                      <div key={call.id} className="min-h-[72px] flex items-center gap-3 py-3">
                        <Avatar name={peer?.name ?? 'Contact'} src={peer?.avatarUrl} size={42} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{peer?.name ?? 'Contact'}</div>
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                            {call.direction === 'incoming' ? 'Incoming' : 'Outgoing'} {call.type} · {timestamp} · {duration}
                          </div>
                        </div>
                        <button
                          onClick={() => startCall(call.roomId, call.type)}
                          disabled={!callRoom}
                          title={`Call ${peer?.name ?? 'contact'} back`}
                          aria-label={`Call ${peer?.name ?? 'contact'} back`}
                          className="w-9 h-9 rounded-lg border-0 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {call.type === 'video' ? <Video size={17} /> : <Phone size={16} />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              {!historyLoading && history.length === 0 && !historyError && (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <Clock3 size={24} className="text-gray-400 dark:text-slate-500" />
                  <p className="mt-3 mb-1 text-sm font-semibold text-gray-700 dark:text-slate-200">No calls found</p>
                  <p className="m-0 text-xs text-gray-500 dark:text-slate-400">Your call history will appear here.</p>
                </div>
              )}
              {historyLoading && <p className="m-0 text-center text-xs text-gray-500 dark:text-slate-400">Loading calls...</p>}
              {nextBefore && !historyLoading && (
                <button onClick={() => { void loadMoreHistory() }} className="w-full py-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer">
                  Load more
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
