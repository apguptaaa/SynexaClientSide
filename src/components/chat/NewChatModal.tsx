import { useState, useEffect, useRef } from 'react'
import type { Room, User } from '../../types/chat'
import { chatService } from '../../services/chatService'
import { Avatar } from '../common/Avatar'

export function NewChatModal({ myId, onClose, onCreated }: {
  myId: string
  onClose: () => void
  onCreated: (r: Room) => void
}) {
  const [tab, setTab] = useState<'dm' | 'group'>('dm')
  const [q, setQ] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [selected, setSelected] = useState<User[]>([])
  const [groupName, setGroupName] = useState('')
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Trigger slide-in after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const resetSearch = () => {
    setQ('')
    setResults([])
  }

  const handleClose = () => {
    resetSearch()
    setVisible(false)
    setTimeout(onClose, 280)
  }

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSearching(true)
      try { setResults((await chatService.searchUsers(q)).filter(u => u.id !== myId)) }
      catch { /**/ }
      setSearching(false)
    }, q ? 350 : 0)
  }, [q, myId])

  const toggle = (u: User) =>
    setSelected(p => p.find(x => x.id === u.id) ? p.filter(x => x.id !== u.id) : [...p, u])

  const create = async () => {
    if (!selected.length) return
    setCreating(true)
    try {
      const room = tab === 'dm'
        ? await chatService.createRoom({ isGroup: false, memberIds: [selected[0].id] })
        : await chatService.createRoom({ isGroup: true, name: groupName.trim(), memberIds: selected.map(u => u.id) })
      resetSearch()
      setSelected([])
      setGroupName('')
      onCreated(room)
    } catch { /**/ }
    setCreating(false)
  }

  const canCreate = selected.length > 0 && (tab === 'dm' || groupName.trim())

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[2px]"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.28s ease' }}
        onClick={handleClose}
      />

      {/* Left-side slide panel */}
      <div
        className="fixed top-0 left-0 bottom-0 z-[9999] w-full max-w-[380px] bg-white dark:bg-[#0f172a] flex flex-col overflow-hidden border-r border-gray-100 dark:border-slate-800 shadow-[4px_0_32px_rgba(0,0,0,0.18)]"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0f172a]">
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border-none bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2 className="text-[1.05rem] font-bold text-[#1f2937] dark:text-slate-100 m-0 tracking-[-0.01em] flex-1">
            {tab === 'dm' ? 'New Message' : 'New Group'}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 px-5">
          {(['dm', 'group'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected([]); resetSearch(); }}
              className={`flex-1 py-3 border-none cursor-pointer font-semibold text-[0.85rem] bg-transparent transition-all duration-200 ${tab === t ? 'text-[#2563eb] dark:text-blue-400 border-b-2 border-b-[#2563eb]' : 'text-gray-400 dark:text-slate-400 border-b-2 border-b-transparent hover:text-gray-600 dark:hover:text-slate-200'}`}
            >
              {t === 'dm' ? 'Direct Message' : 'New Group'}
            </button>
          ))}
        </div>

        {/* Group name */}
        {tab === 'group' && (
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800">
            <input value={groupName} onChange={e => setGroupName(e.target.value)}
              placeholder="Group name (required)"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-[0.88rem] outline-none box-border font-sans focus:border-[#2563eb] transition-colors bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>
        )}

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="px-5 py-2 flex gap-2 flex-wrap border-b border-gray-100 dark:border-slate-800">
            {selected.map(u => (
              <span key={u.id} onClick={() => toggle(u)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer bg-blue-50 dark:bg-blue-950/60 text-[#2563eb] dark:text-blue-300 font-semibold text-[0.78rem] border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                {u.name}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-2.5 border border-gray-200/60 dark:border-slate-700">
            <span className="text-gray-400 dark:text-slate-400 flex shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by name or email"
              className="border-none bg-transparent outline-none flex-1 text-[0.88rem] font-medium font-sans text-[#111827] dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searching && <div className="text-center py-8 text-gray-400 font-medium text-[0.88rem]">Searching…</div>}
          {!searching && results.length === 0 && q && (
            <div className="text-center py-8 text-gray-400 font-medium text-[0.88rem]">No users found</div>
          )}
          {!searching && results.length === 0 && !q && (
            <div className="text-center py-10 text-gray-400 font-medium text-[0.88rem]">
              <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              Search for people to start a conversation
            </div>
          )}
          {results.map(u => {
            const sel = !!selected.find(x => x.id === u.id)
            return (
              <div key={u.id} onClick={() => tab === 'dm' ? setSelected([u]) : toggle(u)}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all duration-150 ${sel ? 'bg-blue-50/60 dark:bg-blue-950/40' : 'hover:bg-gray-50 dark:hover:bg-slate-800/60'}`}
              >
                <Avatar name={u.name} src={u.avatarUrl} size={40} online={u.isOnline} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[0.9rem] text-[#111827] dark:text-slate-100">{u.name}</div>
                  <div className="text-[0.76rem] text-gray-400 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">{u.email}</div>
                </div>
                {sel && (
                  <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        {canCreate && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
            <button onClick={create} disabled={creating}
              className={`w-full py-2.5 rounded-lg border-none font-semibold text-[0.88rem] text-white tracking-wide transition-all duration-200 ${creating ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8] cursor-pointer active:scale-[0.99]'}`}
            >
              {creating ? 'Creating…' : tab === 'dm' ? `Chat with ${selected[0]?.name}` : `Create "${groupName}"`}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
