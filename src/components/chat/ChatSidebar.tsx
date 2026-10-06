import { useState } from 'react'
import type { Room, User } from '../../types/chat'
import { Check, CheckSquare, Sparkles, Square } from 'lucide-react'
import { IcoMoreVert } from '../common/Icons'
import { IconBtn } from '../common/IconBtn'
import { RoomItem } from './RoomItem'

export function ChatSidebar({
  rooms,
  filteredRooms,
  activeRoom,
  unreadCounts,
  sidebarQ,
  setSidebarQ,
  filter,
  setFilter,
  setModal,
  openRoom,
  onOpenAIChat,
  aiChatOpen,
  onDeleteRooms,
  me
}: {
  rooms: Room[]
  filteredRooms: Room[]
  activeRoom: Room | null
  unreadCounts: Record<string, number>
  sidebarQ: string
  setSidebarQ: (q: string) => void
  filter: 'all' | 'direct' | 'groups'
  setFilter: (f: 'all' | 'direct' | 'groups') => void
  setModal: (show: boolean) => void
  openRoom: (room: Room) => void
  onOpenAIChat: () => void
  aiChatOpen: boolean
  onDeleteRooms: (rooms: Room[]) => void
  me: User | null
}) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(() => new Set())
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)
  const selectedRooms = rooms.filter(room => selectedRoomIds.has(room.id))
  const visibleRoomsSelected = filteredRooms.length > 0 && filteredRooms.every(room => selectedRoomIds.has(room.id))

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRoomIds(previous => {
      const next = new Set(previous)
      if (next.has(roomId)) next.delete(roomId)
      else next.add(roomId)
      return next
    })
  }

  const toggleVisibleSelection = () => {
    setSelectedRoomIds(previous => {
      const next = new Set(previous)
      if (visibleRoomsSelected) filteredRooms.forEach(room => next.delete(room.id))
      else filteredRooms.forEach(room => next.add(room.id))
      return next
    })
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedRoomIds(new Set())
  }

  const deleteSelectedRooms = () => {
    if (selectedRooms.length === 0) return
    onDeleteRooms(selectedRooms)
    exitSelectionMode()
  }

  return (
    <div className="w-full md:max-w-[360px] md:min-w-[300px] flex flex-col bg-[#f4f5fa] dark:bg-[#0f172a] h-full border-r border-gray-200/60 dark:border-slate-800/80 shrink-0 z-10 transition-colors duration-300">
      {/* header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[1.35rem] font-bold text-[#1f2937] dark:text-slate-100 m-0 tracking-[-0.01em]">Messages</h2>
          {totalUnread > 0 && (
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[0.75rem] font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal(true)}
            aria-label="Start a new chat"
            className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center border-none cursor-pointer hover:bg-[#1d4ed8] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <div className="relative">
            {actionsOpen && <button type="button" aria-label="Close chat actions" className="fixed inset-0 z-[199] cursor-default border-0 bg-transparent" onClick={() => setActionsOpen(false)} />}
            <IconBtn onClick={() => setActionsOpen(open => !open)} title="Chat list actions">
              <IcoMoreVert />
            </IconBtn>
            {actionsOpen && (
              <div role="menu" className="absolute right-0 top-11 z-[200] w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-800">
                {!selectionMode ? (
                  <button type="button" role="menuitem" onClick={() => { setActionsOpen(false); setSelectionMode(true) }} className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700">
                    <CheckSquare size={17} className="text-gray-500 dark:text-slate-400" /> Select chats
                  </button>
                ) : (
                  <>
                    <button type="button" role="menuitem" onClick={() => { setActionsOpen(false); toggleVisibleSelection() }} className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700">
                      {visibleRoomsSelected ? <Square size={17} className="text-gray-500 dark:text-slate-400" /> : <CheckSquare size={17} className="text-gray-500 dark:text-slate-400" />}
                      {visibleRoomsSelected ? 'Clear visible' : 'Select visible'}
                    </button>
                    <button type="button" role="menuitem" onClick={() => { setActionsOpen(false); exitSelectionMode() }} className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700">
                      <span className="w-[17px] text-center text-gray-500 dark:text-slate-400">×</span> Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectionMode && (
        <div className="mx-4 mt-1 flex min-h-11 items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-800">
          <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">{selectedRooms.length} selected</span>
          <button type="button" onClick={deleteSelectedRooms} disabled={selectedRooms.length === 0} className="inline-flex h-7 items-center gap-1.5 rounded-md border-0 bg-red-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-slate-700">
            <Check size={14} /> Delete{selectedRooms.length > 0 ? ` (${selectedRooms.length})` : ''}
          </button>
        </div>
      )}

      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={onOpenAIChat}
          aria-current={aiChatOpen ? 'page' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            aiChatOpen
              ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-blue-900 dark:hover:bg-blue-950/30'
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Sparkles size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">Synexa AI</span>
            <span className="block text-[0.7rem] font-medium opacity-70">Start an AI conversation</span>
          </span>
        </button>
      </div>

      {/* search */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800/90 rounded-xl px-4 py-3 border border-gray-200/60 dark:border-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.03)] focus-within:border-gray-300 dark:focus-within:border-slate-600 transition-all">
          <span className="text-gray-400 flex shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input 
            value={sidebarQ} 
            onChange={e => setSidebarQ(e.target.value)}
            placeholder="Search messages"
            className="border-none bg-transparent outline-none flex-1 text-[0.95rem] text-gray-700 dark:text-slate-100 font-medium font-sans placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* filters */}
      <div className="flex px-6 py-2 gap-2">
        {(['all', 'direct', 'groups'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full border-none cursor-pointer font-semibold text-[0.78rem] transition-all duration-150 ${filter === f ? 'bg-[#2563eb] text-white' : 'bg-transparent text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
            {f === 'all' ? 'All' : f === 'direct' ? 'Direct' : 'Groups'}
          </button>
        ))}
      </div>

      {/* room list */}
      <div className="flex-1 overflow-y-auto mt-2 pb-6">
        {filteredRooms.length === 0 && (
          <div className="text-center py-10 px-5 text-gray-400 dark:text-slate-400 font-medium">
            <div className="text-[0.95rem] mb-3">
              {sidebarQ ? 'No results found' : 'No conversations yet'}
            </div>
            <button onClick={() => setModal(true)} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-[#2563eb] dark:text-blue-400 font-semibold cursor-pointer border-none hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-[0.83rem]">
              Start a new chat
            </button>
          </div>
        )}
        {filteredRooms.map(r => (
          <RoomItem key={r.id} room={r} myId={me?.id ?? ''}
            active={activeRoom?.id === r.id}
            selectionMode={selectionMode}
            selected={selectedRoomIds.has(r.id)}
            onToggleSelection={() => toggleRoomSelection(r.id)}
            onClick={() => openRoom(r)}
            unreadCount={unreadCounts[r.id] || 0} />
        ))}
      </div>
    </div>
  )
}
