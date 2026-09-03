import React, { useState, useEffect, useRef, useCallback } from 'react'
import { chatService } from '../services/chatService'
import { socketService } from '../services/socketService'
import type { Room, Message, User } from '../types/chat'

// ─────────────────────────────────────────────────────────────────────────────
//  Constants / helpers
// ─────────────────────────────────────────────────────────────────────────────

const WA_GREEN = '#25d366'
const WA_TEAL = '#00bfa5'
const WA_SELF_BUBBLE = '#dcf8c6'
const WA_OTHER_BUBBLE = '#ffffff'
const WA_SIDEBAR_BG = '#ffffff'
const WA_HEADER_BG = '#eeeeee'
const WA_CHAT_BG = '#e5ddd5'
const WA_PANEL_BG = '#eeeeee'
const WA_ICON = '#919191'
const WA_TEXT_PRIMARY = '#4a4a4a'
const WA_TEXT_SECONDARY = '#999999'

const AVATAR_COLORS = [
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8',
  '#1976d2', '#0097a7', '#388e3c', '#f57c00',
  '#5d4037', '#455a64',
]

function seedColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtSidebarTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtDateLabel(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(); yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}

function roomName(room: Room, myId: string) {
  if (room.isGroup) return room.name ?? 'Group'
  return room.members.find(m => m.userId !== myId)?.user.name ?? 'Unknown'
}

function roomAvatar(room: Room, myId: string): string | null {
  if (room.isGroup) return null
  return room.members.find(m => m.userId !== myId)?.user.avatarUrl ?? null
}

function otherUser(room: Room, myId: string): User | undefined {
  return room.members.find(m => m.userId !== myId)?.user
}

function sortRooms(list: Room[]) {
  return [...list].sort((a, b) => {
    const at = a.messages[0]?.createdAt ?? a.createdAt
    const bt = b.messages[0]?.createdAt ?? b.createdAt
    return new Date(bt).getTime() - new Date(at).getTime()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  Avatar
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ name, src, size = 40, online }: {
  name: string; src?: string | null; size?: number; online?: boolean
}) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {src ? (
        <img src={src} alt={name}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: seedColor(name), color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: size * 0.36, userSelect: 'none',
        }}>
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: online ? WA_GREEN : '#ccc', border: '2px solid #fff',
        }} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SVG Icons (all WA-accurate)
// ─────────────────────────────────────────────────────────────────────────────

const Ico = ({ d, size = 24, color = WA_ICON, ...rest }: {
  d: string | React.ReactNode; size?: number; color?: string;
  fill?: string; viewBox?: string;
  strokeWidth?: string; strokeLinecap?: 'round' | 'butt' | 'square';
  strokeLinejoin?: 'round' | 'miter' | 'bevel';
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
)

const IcoSearch = () => <Ico size={18} d={<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>} />
const IcoEdit = () => <Ico size={20} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
const IcoSend = () => <Ico size={22} color={WA_TEAL} d={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />
const IcoAttach = () => <Ico size={22} d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
const IcoClose = () => <Ico size={22} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />
const IcoBack = () => <Ico size={22} color={WA_ICON} d="M19 12H5M12 5l-7 7 7 7" />
const IcoLogout = () => <Ico size={20} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} />
const IcoGroup = () => <Ico size={22} color="#fff" d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />
const IcoCheck = () => <Ico size={14} color={WA_TEAL} d={<><polyline points="20 6 9 17 4 12" /></>} />
const IcoEmoji = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={WA_ICON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
  </svg>
)
const IcoDots = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill={WA_ICON}>
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
//  Btn (icon button)
// ─────────────────────────────────────────────────────────────────────────────

function IconBtn({ onClick, title, children, disabled }: {
  onClick?: () => void; title?: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      border: 'none', background: 'none', cursor: disabled ? 'default' : 'pointer',
      padding: 8, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s',
      opacity: disabled ? 0.5 : 1
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(0,0,0,0.07)' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'none' }}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  New Chat / New Group modal
// ─────────────────────────────────────────────────────────────────────────────

function NewChatModal({ myId, onClose, onCreated }: {
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
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timer.current)
    if (!q.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setSearching(true)
      try { setResults((await chatService.searchUsers(q)).filter(u => u.id !== myId)) }
      catch { /**/ }
      setSearching(false)
    }, 350)
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
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, width: 400,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}>
        {/* header */}
        <div style={{ background: WA_TEAL, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
            {tab === 'dm' ? 'New Chat' : 'New Group'}
          </span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}>
            <IcoClose />
          </button>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f2f5' }}>
          {(['dm', 'group'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected([]) }} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.88rem',
              background: 'none',
              color: tab === t ? WA_TEAL : WA_TEXT_SECONDARY,
              borderBottom: tab === t ? `2px solid ${WA_TEAL}` : '2px solid transparent',
            }}>
              {t === 'dm' ? 'Direct Message' : 'New Group'}
            </button>
          ))}
        </div>

        {/* group name */}
        {tab === 'group' && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f2f5' }}>
            <input value={groupName} onChange={e => setGroupName(e.target.value)}
              placeholder="Group name (required)"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1.5px solid #e0e0e0', fontSize: '0.9rem', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }} />
          </div>
        )}

        {/* chips */}
        {selected.length > 0 && (
          <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid #f0f2f5' }}>
            {selected.map(u => (
              <span key={u.id} onClick={() => toggle(u)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                background: '#e7f3ef', color: WA_TEAL, fontWeight: 600, fontSize: '0.82rem',
              }}>
                {u.name} ×
              </span>
            ))}
          </div>
        )}

        {/* search */}
        <div style={{ padding: '8px 16px', background: WA_HEADER_BG }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', borderRadius: 8, padding: '6px 12px',
          }}>
            <span style={{ color: WA_ICON, display: 'flex', flexShrink: 0 }}><IcoSearch /></span>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by name or email"
              style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: '0.9rem', fontFamily: 'inherit' }} />
          </div>
        </div>

        {/* results */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searching && <div style={{ textAlign: 'center', padding: 20, color: WA_TEXT_SECONDARY, fontSize: '0.85rem' }}>Searching…</div>}
          {!searching && results.length === 0 && q && (
            <div style={{ textAlign: 'center', padding: 20, color: WA_TEXT_SECONDARY, fontSize: '0.85rem' }}>No users found</div>
          )}
          {!searching && results.length === 0 && !q && (
            <div style={{ textAlign: 'center', padding: 30, color: WA_TEXT_SECONDARY, fontSize: '0.85rem' }}>
              Search for people to start a conversation
            </div>
          )}
          {results.map(u => {
            const sel = !!selected.find(x => x.id === u.id)
            return (
              <div key={u.id} onClick={() => tab === 'dm' ? setSelected([u]) : toggle(u)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px', cursor: 'pointer',
                  background: sel ? '#e7f3ef' : 'transparent',
                  transition: 'background 0.12s',
                }}>
                <Avatar name={u.name} src={u.avatarUrl} size={40} online={u.isOnline} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: WA_TEXT_PRIMARY }}>{u.name}</div>
                  <div style={{ fontSize: '0.78rem', color: WA_TEXT_SECONDARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                {sel && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: WA_TEAL,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
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
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f2f5' }}>
            <button onClick={create} disabled={creating} style={{
              width: '100%', padding: '11px', borderRadius: 8, border: 'none',
              background: creating ? '#aaa' : WA_TEAL, color: '#fff',
              fontWeight: 700, fontSize: '0.92rem', cursor: creating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}>
              {creating ? 'Creating…' : tab === 'dm' ? `Chat with ${selected[0]?.name}` : `Create "${groupName}"`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Welcome screen (right panel empty state)
// ─────────────────────────────────────────────────────────────────────────────

function WelcomeScreen() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: WA_CHAT_BG, gap: 20,
      borderLeft: '1px solid #e9edef',
    }}>
      <div style={{
        width: 200, height: 200, borderRadius: '50%',
        background: 'linear-gradient(135deg, #d9f0e1, #b2dfdb)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.85,
      }}>
        <svg width={90} height={90} viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            fill="#25d366" opacity="0.3" />
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="#25d366" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 300, color: WA_TEXT_PRIMARY, margin: '0 0 8px' }}>
          Synexa Web
        </h2>
        <p style={{ fontSize: '0.9rem', color: WA_TEXT_SECONDARY, margin: 0, lineHeight: 1.6 }}>
          Select a conversation on the left or start a new chat.
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 20px', borderRadius: 8, background: 'rgba(0,0,0,0.04)',
        marginTop: 16,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={WA_TEXT_SECONDARY} strokeWidth="2">
          <path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4M12 15v2" />
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        </svg>
        <span style={{ fontSize: '0.78rem', color: WA_TEXT_SECONDARY, fontWeight: 500 }}>
          End-to-end encrypted
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Message bubble
// ─────────────────────────────────────────────────────────────────────────────

function Bubble({ msg, isSelf, showSender, showTail, isLast }: { msg: Message; isSelf: boolean; showSender: boolean; showTail: boolean; isLast: boolean }) {
  const isImg = msg.fileType?.startsWith('image/')
  const bg = isSelf ? WA_SELF_BUBBLE : WA_OTHER_BUBBLE

  return (
    <div style={{
      display: 'flex',
      justifyContent: isSelf ? 'flex-end' : 'flex-start',
      marginBottom: isLast ? 8 : 2,
      padding: isSelf ? (showTail ? '0 5% 0 0' : '0 5% 0 0') : (showTail ? '0 0 0 5%' : '0 0 0 5%'), // Keep padding consistent relative to tail footprint
      paddingRight: isSelf ? '5%' : 0, // Ensure inner edge is pushed inwards
      paddingLeft: !isSelf ? '5%' : 0,
    }}>
      <div style={{
        background: bg,
        color: '#303030',
        borderRadius: showTail ? (isSelf ? '8px 0px 8px 8px' : '0px 8px 8px 8px') : '8px',
        maxWidth: 'min(65%, 520px)',
        padding: '6px 7px 8px 9px',
        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
        position: 'relative',
        fontSize: '0.88rem',
        lineHeight: 1.35,
        wordBreak: 'break-word',
        marginLeft: (!isSelf && !showTail) ? 8 : 0, // offset if tail missing
        marginRight: (isSelf && !showTail) ? 8 : 0,
      }}>
        {/* bubble triangle */}
        {showTail && (
          <svg viewBox="0 0 8 13" width="8" height="13" style={{
            position: 'absolute',
            top: 0,
            [isSelf ? 'right' : 'left']: -8,
          }}>
            {isSelf ? (
              <path opacity="1" fill={bg} d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
            ) : (
              <path opacity="1" fill={bg} d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
            )}
          </svg>
        )}

        {showSender && !isSelf && (
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: seedColor(msg.sender.name), marginBottom: 2 }}>
            {msg.sender.name}
          </div>
        )}

        {msg.fileUrl && (
          <div style={{ marginBottom: msg.text ? 6 : 2 }}>
            {isImg ? (
              <img src={msg.fileUrl} alt="attachment"
                style={{ maxWidth: 220, borderRadius: 6, display: 'block', cursor: 'pointer' }}
                onClick={() => window.open(msg.fileUrl!, '_blank')} />
            ) : (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', background: 'rgba(0,0,0,0.06)',
                  borderRadius: 6, textDecoration: 'none', color: WA_TEAL,
                  fontSize: '0.82rem', fontWeight: 600,
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                {msg.fileUrl.split('/').pop()}
              </a>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 6 }}>
          {msg.text && <span style={{ flexGrow: 1, paddingRight: 35 }}>{msg.text}</span>}

          <div style={{
            position: msg.text ? 'absolute' : 'relative',
            bottom: msg.text ? 4 : 'auto',
            right: msg.text ? 8 : 'auto',
            display: 'flex', alignItems: 'center',
            gap: 2, height: 15,
          }}>
            <span style={{ fontSize: '0.62rem', color: 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>{fmtTime(msg.createdAt)}</span>
            {isSelf && <IcoCheck />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sidebar — room list item
// ─────────────────────────────────────────────────────────────────────────────

function RoomItem({ room, myId, active, onClick }: {
  room: Room; myId: string; active: boolean; onClick: () => void
}) {
  const name = roomName(room, myId)
  const avatar = roomAvatar(room, myId)
  const lastMsg = room.messages[0]
  const other = room.isGroup ? null : otherUser(room, myId)

  const preview = lastMsg
    ? (lastMsg.fileType?.startsWith('image/') ? '📷 Photo' : lastMsg.fileType ? '📎 File' : lastMsg.text ?? '')
    : ''

  return (
    <div onClick={onClick}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f6f6' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#fff' }}
      style={{
        display: 'flex', alignItems: 'center',
        paddingLeft: 12, cursor: 'pointer',
        background: active ? '#ebebeb' : '#fff',
        transition: 'background 0.1s',
        minHeight: 72,
      }}>
      {room.isGroup ? (
        <div style={{
          width: 50, height: 50, borderRadius: '50%', flexShrink: 0, marginRight: 14,
          background: seedColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IcoGroup />
        </div>
      ) : (
        <div style={{ marginRight: 14, flexShrink: 0 }}>
          <Avatar name={name} src={avatar} size={50} online={other?.isOnline} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, height: 72, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid #f2f0f0', paddingRight: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontWeight: 400, fontSize: '1.05rem', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {name}
          </span>
          {lastMsg && (
            <span style={{ fontSize: '0.75rem', color: active ? '#000' : 'rgba(0,0,0,0.45)', flexShrink: 0, marginLeft: 6 }}>
              {fmtSidebarTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          {lastMsg?.senderId === myId && <IcoCheck />}
          <div style={{
            fontSize: '0.85rem', color: 'rgba(0,0,0,0.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
          }}>
            {preview || <span>No messages yet</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [me, setMe] = useState<User | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [modal, setModal] = useState(false)
  const [sidebarQ, setSidebarQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'direct' | 'groups'>('all')
  // Mobile: true = show sidebar, false = show chat
  const [showSidebar, setShowSidebar] = useState(true)

  const feedRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<Room | null>(null)
  activeRef.current = activeRoom

  // ── init & socket connect ──
  useEffect(() => {
    (async () => {
      try {
        const [profile, list] = await Promise.all([chatService.getMyProfile(), chatService.getRooms()])
        setMe(profile)
        setRooms(sortRooms(list))

        // initialize sockets after we have our token etc.
        socketService.connect()
      } catch { /**/ }
    })()

    return () => {
      socketService.disconnect()
    }
  }, [])

  // ── handle socket events ──
  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      // 1. Update room unread / previews
      setRooms(prev => {
        const existing = prev.find(r => r.id === msg.roomId)
        if (!existing) {
          // If we are part of a newly created flow room, we might have to fetch the room here.
          // For simplicity, we just fetch rooms again if we receive a message for an unknown room.
          chatService.getRooms().then(list => setRooms(sortRooms(list))).catch(() => { })
          return prev
        }

        // clone and update last message
        const updated = { ...existing, messages: [msg, ...existing.messages] }
        return sortRooms([updated, ...prev.filter(r => r.id !== msg.roomId)])
      })

      // 2. Append to current conversation if actively viewed
      if (activeRef.current?.id === msg.roomId) {
        setMessages(prev => {
          // avoid duplicate
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 50)
      }
    }

    const handleRoomUpdated = (room: Room) => {
      setRooms(prev => sortRooms([room, ...prev.filter(r => r.id !== room.id)]))
    }

    socketService.onNewMessage(handleNewMessage)
    socketService.onRoomUpdated(handleRoomUpdated)

    return () => {
      socketService.offNewMessage(handleNewMessage)
      socketService.offRoomUpdated(handleRoomUpdated)
    }
  }, [])

  // Polling removed per user request to stop repeated background API hits

  const openRoom = useCallback(async (room: Room) => {
    setActiveRoom(room)
    setMessages([])
    setNextCursor(null)
    setLoadingMsgs(true)
    setShowSidebar(false) // mobile: switch to chat panel
    try {
      const { messages: msgs, nextCursor: cur } = await chatService.getMessages(room.id, undefined, 30)
      setMessages(msgs.slice().reverse())
      setNextCursor(cur)
    } catch { /**/ }
    setLoadingMsgs(false)
    setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight }), 60)
    inputRef.current?.focus()
  }, [])

  const loadMore = async () => {
    if (!activeRoom || !nextCursor || loadingMore) return
    setLoadingMore(true)
    const prev = feedRef.current?.scrollHeight ?? 0
    try {
      const { messages: older, nextCursor: cur } = await chatService.getMessages(activeRoom.id, nextCursor, 30)
      setMessages(p => [...older.slice().reverse(), ...p])
      setNextCursor(cur)
      requestAnimationFrame(() => {
        if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight - prev
      })
    } catch { /**/ }
    setLoadingMore(false)
  }

  const handleScroll = () => {
    if (feedRef.current && feedRef.current.scrollTop < 80) loadMore()
  }

  const send = async (fileUrl?: string, fileType?: string) => {
    if (!activeRoom || (!inputText.trim() && !fileUrl)) return
    setSending(true)
    const text = inputText.trim()
    setInputText('')
    if (inputRef.current) { inputRef.current.style.height = 'auto' }
    try {
      await chatService.sendMessage(activeRoom.id, text || null, fileUrl ?? null, fileType ?? null)
      const { messages: fresh } = await chatService.getMessages(activeRoom.id, undefined, 30)
      setMessages(fresh.slice().reverse())
      setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 50)
    } catch { /**/ }
    setSending(false)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const r = await chatService.uploadFile(file); await send(r.fileUrl, r.fileType) }
    catch { /**/ }
    e.target.value = ''
  }

  const onRoomCreated = (room: Room) => {
    setModal(false)
    setRooms(p => p.find(r => r.id === room.id) ? p : [room, ...p])
    openRoom(room)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  // filtered rooms
  const filtered = rooms.filter(r => {
    if (filter === 'direct' && r.isGroup) return false
    if (filter === 'groups' && !r.isGroup) return false
    if (sidebarQ.trim() && me) {
      return roomName(r, me.id).toLowerCase().includes(sidebarQ.toLowerCase())
    }
    return true
  })

  // date-grouped messages
  function groupByDate(msgs: Message[]) {
    const g: { date: string; msgs: Message[] }[] = []
    for (const m of msgs) {
      const l = fmtDateLabel(m.createdAt)
      const last = g[g.length - 1]
      if (!last || last.date !== l) g.push({ date: l, msgs: [m] })
      else last.msgs.push(m)
    }
    return g
  }

  const curOther = activeRoom && me ? otherUser(activeRoom, me.id) : undefined
  const curName = activeRoom && me ? roomName(activeRoom, me.id) : ''
  const curAvatar = activeRoom && me ? roomAvatar(activeRoom, me.id) : null

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const SidebarEl = (
    <div style={{
      width: '100%', maxWidth: 420, minWidth: 280,
      display: 'flex', flexDirection: 'column',
      background: WA_SIDEBAR_BG, height: '100%',
      borderRight: '1px solid #e9edef',
      flexShrink: 0,
    }}>
      {/* header */}
      <div style={{
        background: WA_HEADER_BG, padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          {me && <Avatar name={me.name} src={me.avatarUrl} size={40} online />}
          {me && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: WA_TEXT_PRIMARY }}>{me.name}</div>
              <div style={{ fontSize: '0.72rem', color: WA_GREEN, fontWeight: 600 }}>● Online</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconBtn onClick={() => setModal(true)} title="New chat"><IcoEdit /></IconBtn>
          <IconBtn onClick={logout} title="Logout"><IcoLogout /></IconBtn>
        </div>
      </div>

      {/* search */}
      <div style={{ padding: '8px 12px', background: WA_SIDEBAR_BG, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: WA_HEADER_BG, borderRadius: 8, padding: '7px 14px',
        }}>
          <span style={{ color: WA_ICON, display: 'flex', flexShrink: 0 }}><IcoSearch /></span>
          <input value={sidebarQ} onChange={e => setSidebarQ(e.target.value)}
            placeholder="Search or start new chat"
            style={{
              border: 'none', background: 'none', outline: 'none',
              flex: 1, fontSize: '0.9rem', color: WA_TEXT_PRIMARY, fontFamily: 'inherit',
            }} />
        </div>
      </div>

      {/* filters */}
      <div style={{ display: 'flex', padding: '6px 12px', gap: 6, borderBottom: '1px solid #f0f0f0' }}>
        {(['all', 'direct', 'groups'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '4px 14px', borderRadius: 20, border: 'none',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
            fontFamily: 'inherit', transition: 'all 0.15s',
            background: filter === f ? WA_TEAL : '#f0f2f5',
            color: filter === f ? '#fff' : WA_TEXT_SECONDARY,
          }}>
            {f === 'all' ? 'All' : f === 'direct' ? 'Direct' : 'Groups'}
          </button>
        ))}
      </div>

      {/* room list */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="room-list">
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: WA_TEXT_SECONDARY }}>
            <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>
              {sidebarQ ? 'No results found' : 'No conversations yet'}
            </div>
            <span onClick={() => setModal(true)}
              style={{ color: WA_TEAL, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              + Start a new chat
            </span>
          </div>
        )}
        {filtered.map(r => (
          <RoomItem key={r.id} room={r} myId={me?.id ?? ''}
            active={activeRoom?.id === r.id}
            onClick={() => openRoom(r)} />
        ))}
      </div>
    </div>
  )

  // ── Chat Panel ────────────────────────────────────────────────────────────
  const ChatEl = (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0,
    }}>
      {!activeRoom ? <WelcomeScreen /> : (
        <>
          {/* room header */}
          <div style={{
            background: WA_HEADER_BG, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: '1px solid #e9edef', flexShrink: 0,
          }}>
            {/* mobile back */}
            <button onClick={() => setShowSidebar(true)}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                display: 'flex', padding: 4,
                // hide on desktop via inline media — we'll rely on JS showSidebar state
              }}
              className="chat-back-btn"
            >
              <IcoBack />
            </button>

            {activeRoom.isGroup ? (
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: seedColor(curName), display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IcoGroup />
              </div>
            ) : (
              <Avatar name={curName} src={curAvatar} size={42} online={curOther?.isOnline} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.97rem', color: WA_TEXT_PRIMARY }}>{curName}</div>
              <div style={{ fontSize: '0.75rem', color: WA_TEXT_SECONDARY }}>
                {activeRoom.isGroup
                  ? `${activeRoom.members.length} members`
                  : curOther?.isOnline ? 'online'
                    : curOther?.lastSeenAt ? `last seen ${fmtTime(curOther.lastSeenAt)}`
                      : 'offline'}
              </div>
            </div>

            <div style={{ display: 'flex' }}>
              <IconBtn onClick={() => setActiveRoom(null)} title="Close"><IcoClose /></IconBtn>
            </div>
          </div>

          {/* messages */}
          <div ref={feedRef} onScroll={handleScroll} className="msg-feed"
            style={{
              flex: 1, overflowY: 'auto',
              background: '#e5ddd5',
              backgroundImage: `url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")`,
              backgroundSize: '400px 400px',
              padding: '12px 5%',
            }}>

            {/* Notice header in chat */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, marginTop: 10 }}>
              <div style={{
                background: '#fff2c5', color: 'rgba(0,0,0,0.8)', fontSize: '0.78rem',
                padding: '6px 12px', borderRadius: 8, boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                maxWidth: '90%', textAlign: 'center', display: 'flex', gap: 6, alignItems: 'center',
                lineHeight: 1.4
              }}>
                <svg width="10" height="12" viewBox="0 0 24 24" fill="rgba(0,0,0,0.5)" style={{ flexShrink: 0 }}>
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
                Messages are end-to-end encrypted. No one outside of this chat, not even Synexa, can read or listen to them. Click to learn more.
              </div>
            </div>
            {loadingMore && (
              <div style={{ textAlign: 'center', padding: 10, color: WA_TEXT_SECONDARY, fontSize: '0.8rem' }}>
                Loading older messages…
              </div>
            )}
            {nextCursor && !loadingMore && (
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <button onClick={loadMore} style={{
                  border: 'none', background: 'rgba(255,255,255,0.85)', color: WA_TEAL,
                  padding: '4px 16px', borderRadius: 20, cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  Load older messages
                </button>
              </div>
            )}

            {loadingMsgs ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.85)', borderRadius: 12,
                  padding: '10px 20px', color: WA_TEXT_SECONDARY, fontSize: '0.88rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  Loading messages…
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.85)', borderRadius: 12,
                  padding: '8px 18px', color: WA_TEXT_SECONDARY, fontSize: '0.85rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  No messages yet — say hello! 👋
                </div>
              </div>
            ) : (
              groupByDate(messages).map(g => (
                <div key={g.date}>
                  {/* date label */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                    <span style={{
                      background: 'rgba(225,245,254,0.92)', color: 'rgba(0,0,0,0.7)',
                      fontSize: '0.75rem', fontWeight: 500, padding: '5px 12px',
                      borderRadius: 8, boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                      textTransform: 'uppercase'
                    }}>
                      {g.date}
                    </span>
                  </div>
                  {g.msgs.map((msg, i) => {
                    const isSelf = msg.senderId === me?.id
                    const prev = g.msgs[i - 1]
                    const next = g.msgs[i + 1]
                    const showTail = !prev || prev.senderId !== msg.senderId
                    const isLast = !next || next.senderId !== msg.senderId
                    const showSender = activeRoom.isGroup && !isSelf && showTail
                    return <Bubble key={msg.id} msg={msg} isSelf={isSelf} showSender={showSender} showTail={showTail} isLast={isLast} />
                  })}
                </div>
              ))
            )}
          </div>

          {/* input bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', background: WA_PANEL_BG,
            flexShrink: 0, minHeight: 62
          }}>
            <IconBtn title="Emoji"><IcoEmoji /></IconBtn>
            <IconBtn onClick={() => fileRef.current?.click()} title="Attach a file">
              <IcoAttach />
            </IconBtn>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile} />

            <div style={{
              flex: 1, background: '#fff', borderRadius: 24,
              display: 'flex', alignItems: 'center',
              boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
              minHeight: 42,
              padding: '0 8px'
            }}>
              <textarea
                ref={inputRef}
                className="chat-input"
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none', resize: 'none',
                  color: '#4a4a4a', padding: '10px 12px', fontSize: '0.95rem',
                  maxHeight: 120, minHeight: 20
                }}
                placeholder="Type a message .."
                value={inputText}
                onChange={e => {
                  setInputText(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={handleKey}
                rows={1}
              />
            </div>

            <IconBtn title="Send" onClick={() => send()} disabled={sending || !inputText.trim()}>
              <IcoSend />
            </IconBtn>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Responsive styles injected globally */}
      <style>{`
        .wa-shell { display: flex; height: 100vh; width: 100%; overflow: hidden; font-family: 'Inter', 'Segoe UI', Helvetica, sans-serif; }
        .wa-sidebar { display: flex; flex-shrink: 0; width: 380px; height: 100%; }
        .wa-chat { display: flex; flex: 1; height: 100%; min-width: 0; }
        .chat-back-btn { display: none; }
        @media (max-width: 768px) {
          .wa-sidebar { width: 100%; position: absolute; inset: 0; z-index: 10; transition: transform 0.25s ease; }
          .wa-sidebar.hidden-mobile { transform: translateX(-100%); pointer-events: none; }
          .wa-chat { width: 100%; }
          .chat-back-btn { display: flex; }
        }
      `}</style>

      <div className="wa-shell">
        <div className={`wa-sidebar${!showSidebar ? ' hidden-mobile' : ''}`}>
          {SidebarEl}
        </div>
        <div className="wa-chat">
          {ChatEl}
        </div>
      </div>

      {modal && me && (
        <NewChatModal myId={me.id} onClose={() => setModal(false)} onCreated={onRoomCreated} />
      )}
    </>
  )
}
