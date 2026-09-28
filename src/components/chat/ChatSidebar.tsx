import type { Room, User } from '../../types/chat'
import { RoomItem } from './RoomItem'

export function ChatSidebar({
  filteredRooms,
  activeRoom,
  unreadCounts,
  sidebarQ,
  setSidebarQ,
  filter,
  setFilter,
  setModal,
  openRoom,
  me
}: {
  filteredRooms: Room[]
  activeRoom: Room | null
  unreadCounts: Record<string, number>
  sidebarQ: string
  setSidebarQ: (q: string) => void
  filter: 'all' | 'direct' | 'groups'
  setFilter: (f: 'all' | 'direct' | 'groups') => void
  setModal: (show: boolean) => void
  openRoom: (room: Room) => void
  me: User | null
}) {
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

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
        <button 
          onClick={() => setModal(true)}
          className="w-10 h-10 rounded-full bg-[#8c0817] text-white flex items-center justify-center border-none shadow-md cursor-pointer hover:bg-red-800 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
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
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full border-none cursor-pointer font-bold text-[0.8rem] transition-all duration-150 ${filter === f ? 'bg-[#8c0817] text-white shadow-sm' : 'bg-transparent text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
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
            <button onClick={() => setModal(true)} className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-[#8c0817] dark:text-red-400 font-bold cursor-pointer border-none hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
              Start a new chat
            </button>
          </div>
        )}
        {filteredRooms.map(r => (
          <RoomItem key={r.id} room={r} myId={me?.id ?? ''}
            active={activeRoom?.id === r.id}
            onClick={() => openRoom(r)}
            unreadCount={unreadCounts[r.id] || 0} />
        ))}
      </div>
    </div>
  )
}
