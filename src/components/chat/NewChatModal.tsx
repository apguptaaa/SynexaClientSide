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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      onCreated(room)
    } catch { /**/ }
    setCreating(false)
  }

  const canCreate = selected.length > 0 && (tab === 'dm' || groupName.trim())

  return (
    <div className="absolute inset-0 bg-white dark:bg-[#0f172a] z-[110] flex flex-col font-sans animate-[slideInLeft_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      {/* header */}
      <div className="bg-white dark:bg-[#0f172a] px-5 py-5 flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
        <button 
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center border-none bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-100 transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 className="text-lg font-bold text-[#1f2937] dark:text-slate-100 m-0 tracking-[-0.01em] flex-1">
          {tab === 'dm' ? 'New Message' : 'New Group'}
        </h2>
      </div>

      {/* tabs */}
      <div className="flex border-b border-gray-100 dark:border-slate-800 px-5">
        {(['dm', 'group'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelected([]) }}
            className={`flex-1 py-3 border-none cursor-pointer font-bold text-[0.88rem] bg-transparent transition-all duration-200 ${tab === t ? 'text-[#8c0817] dark:text-red-400 border-b-2 border-b-[#8c0817]' : 'text-gray-400 dark:text-slate-400 border-b-2 border-b-transparent hover:text-gray-600 dark:hover:text-slate-200'}`}
          >
            {t === 'dm' ? 'Direct Message' : 'New Group'}
          </button>
        ))}
      </div>

      {/* group name */}
      {tab === 'group' && (
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800">
          <input value={groupName} onChange={e => setGroupName(e.target.value)}
            placeholder="Group name (required)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-[0.9rem] outline-none box-border font-sans focus:border-[#8c0817] transition-colors bg-[#f8f9fb] dark:bg-slate-800 text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      )}

      {/* chips */}
      {selected.length > 0 && (
        <div className="px-5 py-2.5 flex gap-2 flex-wrap border-b border-gray-100 dark:border-slate-800">
          {selected.map(u => (
            <span key={u.id} onClick={() => toggle(u)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer bg-red-50 dark:bg-red-950/60 text-[#8c0817] dark:text-red-300 font-bold text-[0.82rem] border border-red-100 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
            >
              {u.name}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </span>
          ))}
        </div>
      )}

      {/* search */}
      <div className="px-5 py-3 bg-[#f8f9fb] dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-gray-200/60 dark:border-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-gray-400 dark:text-slate-400 flex shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="border-none bg-transparent outline-none flex-1 text-[0.9rem] font-medium font-sans text-[#111827] dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* results */}
      <div className="flex-1 overflow-y-auto">
        {searching && <div className="text-center py-8 text-gray-400 font-medium text-[0.9rem]">Searching…</div>}
        {!searching && results.length === 0 && q && (
          <div className="text-center py-8 text-gray-400 font-medium text-[0.9rem]">No users found</div>
        )}
        {!searching && results.length === 0 && !q && (
          <div className="text-center py-10 text-gray-400 font-medium text-[0.9rem]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all duration-150 ${sel ? 'bg-red-50/60 dark:bg-red-950/40' : 'hover:bg-gray-50 dark:hover:bg-slate-800/60'}`}
            >
              <Avatar name={u.name} src={u.avatarUrl} size={42} online={u.isOnline} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[0.92rem] text-[#111827] dark:text-slate-100">{u.name}</div>
                <div className="text-[0.78rem] text-gray-400 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{u.email}</div>
              </div>
              {sel && (
                <div className="w-6 h-6 rounded-full bg-[#8c0817] flex items-center justify-center shrink-0 shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* footer */}
      {canCreate && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
          <button onClick={create} disabled={creating}
            className={`w-full py-3.5 rounded-2xl border-none font-extrabold text-[0.95rem] text-white tracking-wide transition-all duration-300 ${creating ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#8c0817] to-[#b91c1c] cursor-pointer shadow-[0_8px_24px_rgba(140,8,23,0.3)] hover:shadow-[0_12px_32px_rgba(140,8,23,0.4)] hover:scale-[1.01] active:scale-[0.99]'}`}
          >
            {creating ? 'Creating…' : tab === 'dm' ? `Chat with ${selected[0]?.name}` : `Create "${groupName}"`}
          </button>
        </div>
      )}
    </div>
  )
}
