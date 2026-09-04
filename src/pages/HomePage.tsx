import React, { useState, useEffect, useRef } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { chatService } from '../services/chatService'
import { socketService } from '../services/socketService'
import type { Room, Message, User } from '../types/chat'

// ─── Synexa Brand Colors ─────────────────────────────────────────────────────
const SX_RED = '#8c0817'
const SX_SURFACE = '#fff'
const SX_BG_PANEL = '#f8f8f8'

// ─────────────────────────────────────────────────────────────────────────────
//  Constants / helpers
// ─────────────────────────────────────────────────────────────────────────────

const WA_GREEN = '#25d366'
const WA_TEAL = SX_RED
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
const IcoSend = () => <Ico size={22} color={WA_TEAL} d={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />
const IcoAttach = () => <Ico size={22} d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
const IcoClose = () => <Ico size={22} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />
const IcoBack = ({ color = WA_ICON }: { color?: string }) => <Ico size={22} color={color} d="M19 12H5M12 5l-7 7 7 7" />
const IcoLogout = () => <Ico size={20} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} />
const IcoGroup = () => <Ico size={22} color="#fff" d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />
const IcoCheckSent = () => <Ico size={15} color={WA_ICON} d={<><polyline points="20 6 9 17 4 12" /></>} />
const IcoCheckDelivered = () => (
  <svg width="18" height="15" viewBox="0 0 24 24" fill="none" stroke={WA_ICON} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 6 9 17 4 12" />
    <polyline points="23 6 15 17" />
  </svg>
)
const IcoCheckSeen = () => (
  <svg width="18" height="15" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 6 9 17 4 12" />
    <polyline points="23 6 15 17" />
  </svg>
)
const IcoCamera = ({ color = WA_ICON }: { color?: string }) => (
  <Ico size={32} color={color} d={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>} />
)
const IcoEmoji = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={WA_ICON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
  </svg>
)
const IcoMoreVert = () => <Ico size={22} d={<><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></>} />

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
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: '#fff', zIndex: 110, display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter','Segoe UI',Helvetica,sans-serif",
      animation: 'slideInLeft 0.25s cubic-bezier(0.23,1,0.32,1)'
    }}>
      {/* header */}
      <div style={{
        background: `linear-gradient(135deg, ${WA_TEAL} 0%, #b91c1c 100%)`, // Uses Red theme via SX_RED
        color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16
      }}>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: 0 }}>
          <IcoBack color="#fff" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          {tab === 'dm' ? 'New Message' : 'New Group'}
        </span>
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
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: '0.9rem', fontFamily: 'inherit', color: '#000' }} />
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
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f2f5', background: '#fff' }}>
          <button onClick={create} disabled={creating} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: creating ? '#aaa' : WA_TEAL, color: '#fff',
            fontWeight: 700, fontSize: '0.92rem', cursor: creating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(140,8,23,0.35)'
          }}>
            {creating ? 'Creating…' : tab === 'dm' ? `Chat with ${selected[0]?.name}` : `Create "${groupName}"`}
          </button>
        </div>
      )}
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
    }}>
      <div style={{
        background: bg,
        color: '#303030',
        borderRadius: showTail ? (isSelf ? '8px 0px 8px 8px' : '0px 8px 8px 8px') : '8px',
        maxWidth: 'min(75%, 520px)',
        padding: '6px 7px 8px 9px',
        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
        position: 'relative',
        fontSize: '0.88rem',
        lineHeight: 1.35,
        wordBreak: 'break-word',
        marginLeft: (!isSelf && !showTail) ? 8 : 0,
        marginRight: (isSelf && !showTail) ? 8 : 0,
        display: 'flex', flexDirection: 'column'
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
          <div style={{ marginBottom: msg.text ? 6 : 0, display: 'flex', flexShrink: 0 }}>
            {isImg ? (
              <img src={msg.fileUrl} alt="attachment"
                style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 6, display: 'block', cursor: 'pointer' }}
                onClick={() => window.open(msg.fileUrl!, '_blank')} />
            ) : (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', background: 'rgba(0,0,0,0.06)',
                  borderRadius: 6, textDecoration: 'none', color: WA_TEAL,
                  fontSize: '0.85rem', fontWeight: 600, maxWidth: 280,
                  overflow: 'hidden'
                }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {msg.fileUrl.split('/').pop()}
                </span>
              </a>
            )}
          </div>
        )}

        {/* Text and Time container */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          {msg.text && (
            <span style={{ whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </span>
          )}

          {/* Spacer if no text */}
          {!msg.text && <div style={{ flex: 1 }}></div>}

          {/* Time and checkmarks pinned to bottom right */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 4, height: 15,
            marginLeft: 'auto',
            marginTop: msg.text ? 0 : 4
          }}>
            <span style={{ fontSize: '0.62rem', color: 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>{fmtTime(msg.createdAt)}</span>
            {isSelf && (
              msg.status === 'seen' ? <IcoCheckSeen /> :
                msg.status === 'delivered' ? <IcoCheckDelivered /> :
                  <IcoCheckSent />
            )}
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
          {lastMsg?.senderId === myId && (
            lastMsg.status === 'seen' ? <IcoCheckSeen /> :
              lastMsg.status === 'delivered' ? <IcoCheckDelivered /> :
                <IcoCheckSent />
          )}
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
  const [sendError, setSendError] = useState<string | null>(null)
  const [modal, setModal] = useState(false)
  const [sidebarQ, setSidebarQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'direct' | 'groups'>('all')
  // Mobile: true = show sidebar, false = show chat
  const [showSidebar, setShowSidebar] = useState(true)

  // Profile Edit State
  const [showProfile, setShowProfile] = useState(false)
  const [editName, setEditName] = useState('')

  // Typing indicators: roomId -> list of user names typing
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({})
  // Toast notification
  const [toast, setToast] = useState<{ message: string; id: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Right side contact profile & menu state
  const [showContactProfile, setShowContactProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const profileFileRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  // Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const feedRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<Room | null>(null)
  const pendingMessages = useRef(new Map<string, string>())

  useEffect(() => {
    activeRef.current = activeRoom
  }, [activeRoom])

  const openRoom = async (room: Room) => {
    setActiveRoom(room)
    sessionStorage.setItem('activeRoomId', room.id)
    socketService.joinRoom(room.id)
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
    // Mark messages as seen via REST + socket
    chatService.markSeen(room.id).catch(() => { })
    socketService.emitSeen(room.id)
  }

  // ── init & socket connect ──
  useEffect(() => {
    (async () => {
      try {
        const [profile, list] = await Promise.all([chatService.getMyProfile(), chatService.getRooms()])
        setMe(profile)
        setRooms(sortRooms(list))

        // initialize sockets after we have our token etc.
        socketService.connect()
        list.forEach(room => socketService.joinRoom(room.id))

        const savedRoomId = sessionStorage.getItem('activeRoomId')
        const savedRoom = list.find(room => room.id === savedRoomId)
        if (savedRoom) openRoom(savedRoom)
      } catch { /**/ }
    })()

    return () => {
      socketService.disconnect()
    }
  }, [])

  // ── handle socket events ──
  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      const messageKey = `${msg.roomId}|${msg.senderId}|${msg.text ?? ''}|${msg.fileUrl ?? ''}`
      const optimisticId = pendingMessages.current.get(messageKey)
      const wasOptimistic = Boolean(optimisticId)

      if (optimisticId) {
        pendingMessages.current.delete(messageKey)
        // Preserve 'sent' status if server doesn't send a status field
        setMessages(prev => prev.map(message =>
          message.id === optimisticId
            ? { ...message, ...msg, status: msg.status ?? 'sent' }
            : message
        ))
      }

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

      if (wasOptimistic) return

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

    const handleDelivered = ({ roomId, messageIds }: { roomId: string; messageIds: string[] }) => {
      setMessages(prev => prev.map(m =>
        messageIds.includes(m.id) ? { ...m, status: 'delivered' as const } : m
      ))
      setRooms(prev => prev.map(r =>
        r.id === roomId
          ? { ...r, messages: r.messages.map(m => messageIds.includes(m.id) ? { ...m, status: 'delivered' as const } : m) }
          : r
      ))
    }

    const handleSeen = ({ roomId, messageIds }: { roomId: string; userId: string; messageIds: string[] }) => {
      setMessages(prev => prev.map(m =>
        messageIds.includes(m.id) ? { ...m, status: 'seen' as const } : m
      ))
      setRooms(prev => prev.map(r =>
        r.id === roomId
          ? { ...r, messages: r.messages.map(m => messageIds.includes(m.id) ? { ...m, status: 'seen' as const } : m) }
          : r
      ))
    }

    const handleTypingStart = ({ roomId, userName }: { roomId: string; userId: string; userName: string }) => {
      setTypingUsers(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] ?? []).filter(n => n !== userName), userName]
      }))
    }

    const handleTypingStop = ({ roomId, userName }: { roomId: string; userId: string; userName: string }) => {
      setTypingUsers(prev => ({
        ...prev,
        [roomId]: (prev[roomId] ?? []).filter(n => n !== userName)
      }))
    }

    const handleNotification = (n: import('../types/chat').Notification) => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast({ message: n.message, id: n.id })
      toastTimer.current = setTimeout(() => setToast(null), 4000)
    }

    socketService.onNewMessage(handleNewMessage)
    socketService.onRoomUpdated(handleRoomUpdated)
    socketService.onDelivered(handleDelivered)
    socketService.onSeen(handleSeen)
    socketService.onTypingStart(handleTypingStart)
    socketService.onTypingStop(handleTypingStop)
    socketService.onNotification(handleNotification)

    return () => {
      socketService.offNewMessage(handleNewMessage)
      socketService.offRoomUpdated(handleRoomUpdated)
      socketService.offDelivered(handleDelivered)
      socketService.offSeen(handleSeen)
      socketService.offTypingStart(handleTypingStart)
      socketService.offTypingStop(handleTypingStop)
      socketService.offNotification(handleNotification)
    }
  }, [])

  // Keep the open conversation current if a hosted socket event is delayed.
  // useEffect(() => {
  //   if (!activeRoom) return

  //   let cancelled = false
  //   const syncMessages = async () => {
  //     try {
  //       const { messages: fresh } = await chatService.getMessages(activeRoom.id, undefined, 30)
  //       if (cancelled) return

  //       const ordered = fresh.slice().reverse()
  //       setMessages(previous => {
  //         const merged = [...previous]
  //         ordered.forEach(message => {
  //           if (!merged.some(existing => existing.id === message.id)) merged.push(message)
  //         })
  //         return merged
  //       })
  //     } catch { /**/ }
  //   }

  //   const timer = window.setInterval(syncMessages, 2000)
  //   return () => {
  //     cancelled = true
  //     window.clearInterval(timer)
  //   }
  // }, [activeRoom])

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
    if (!socketService.isConnected()) {
      setSendError('Realtime connection is not ready. Please try again.')
      return
    }
    setSending(true)
    const text = inputText.trim()
    setSendError(null)
    try {
      const messageKey = `${activeRoom.id}|${me?.id ?? ''}|${text}|${fileUrl ?? ''}`
      const optimisticId = `pending-${Date.now()}`
      pendingMessages.current.set(messageKey, optimisticId)
      socketService.sendMessage(activeRoom.id, text || null, fileUrl ?? null, fileType ?? null)

      if (me) {
        setMessages(prev => [...prev, {
          id: optimisticId,
          roomId: activeRoom.id,
          senderId: me.id,
          text: text || null,
          fileUrl: fileUrl ?? null,
          fileType: fileType ?? null,
          createdAt: new Date().toISOString(),
          status: 'sent' as const,   // ✓ single grey tick immediately
          sender: me,
        }])
      }
      setInputText('')
      if (inputRef.current) { inputRef.current.style.height = 'auto' }
      setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 50)
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Unable to send message')
    }
    setSending(false)
  }

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
    if (activeRoom) {
      socketService.emitTypingStart(activeRoom.id)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => {
        if (activeRoom) socketService.emitTypingStop(activeRoom.id)
      }, 2000)
    }
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

  const openProfile = () => {
    if (me) {
      setEditName(me.name)
      setEditAvatarUrl(me.avatarUrl || '')
      setShowProfile(true)
    }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const updated = await chatService.updateMyProfile({ name: editName, avatarUrl: editAvatarUrl })
      setMe(updated)
      setShowProfile(false)
    } catch {
      // handle error gracefully
    }
    setSavingProfile(false)
  }

  const handleProfileAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setCropSrc(objectUrl)
    setCropModalOpen(true)
    e.target.value = ''
  }

  async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = imageSrc
    })
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
    return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas empty')), 'image/jpeg', 0.92))
  }

  const uploadCroppedImage = async () => {
    if (!cropSrc || !croppedAreaPixels) return
    setCropModalOpen(false)
    setUploadingAvatar(true)
    try {
      const blob = await getCroppedImg(cropSrc, croppedAreaPixels)
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      const res = await chatService.uploadFile(file)
      setEditAvatarUrl(res.fileUrl)
      const updated = await chatService.updateMyProfile({ name: editName, avatarUrl: res.fileUrl })
      setMe(updated)
    } catch { /* ignore */ }
    setUploadingAvatar(false)
    if (cropSrc) { URL.revokeObjectURL(cropSrc); setCropSrc(null) }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={openProfile}>
          {me && <Avatar name={me.name} src={me.avatarUrl} size={40} online />}
          {me && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: WA_TEXT_PRIMARY }}>{me.name}</div>
              <div style={{ fontSize: '0.72rem', color: WA_GREEN, fontWeight: 600 }}>● Online</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconBtn onClick={() => setShowLogoutConfirm(true)} title="Logout"><IcoLogout /></IconBtn>
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

      {/* Floating New Chat Button */}
      {me && (
        <button
          onClick={() => setModal(true)}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            background: SX_RED,
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(140,8,23,0.4)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(140,8,23,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(140,8,23,0.4)' }}
          title="New Chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            <path d="M12 9v6" />
            <path d="M9 12h6" />
          </svg>
        </button>
      )}
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

            <div style={{ display: 'flex', position: 'relative' }}>
              {menuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setMenuOpen(false)} />}
              <IconBtn onClick={() => setMenuOpen(!menuOpen)} title="Options">
                <IcoMoreVert />
              </IconBtn>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 40, right: 0,
                  background: '#fff', borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  zIndex: 200, padding: '8px 0', minWidth: 160
                }}>
                  <div
                    style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem', color: '#4a4a4a', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                      setMenuOpen(false)
                      setShowContactProfile(true)
                    }}
                  >
                    Contact Info
                  </div>
                  <div
                    style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem', color: '#d32f2f', transition: 'background 0.2s', borderTop: '1px solid #eee' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fcfcfc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                      setMenuOpen(false)
                      setActiveRoom(null)
                    }}
                  >
                    Exit Chat
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* messages */}
          <div ref={feedRef} onScroll={handleScroll} className="msg-feed"
            style={{
              flex: 1, overflowY: 'auto',
              background: '#efeae2',
              backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '400px',
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
              <div style={{ padding: '12px 0' }}>
                <style>{`
                  @keyframes yt-shimmer {
                    0%   { background-position: -800px 0; }
                    100% { background-position:  800px 0; }
                  }
                  .yt-skel {
                    background: #e0e0e0;
                    background-image: linear-gradient(
                      90deg,
                      #e0e0e0 0px,
                      #f5f5f5 40%,
                      #e0e0e0 80%
                    );
                    background-size: 800px 100%;
                    animation: yt-shimmer 1.3s infinite ease-in-out;
                    border-radius: 8px;
                  }
                `}</style>

                {[
                  { lines: [{ w: 180 }, { w: 120 }], self: false },
                  { lines: [{ w: 240 }], self: false },
                  { lines: [{ w: 140 }, { w: 80 }], self: true },
                  { lines: [{ w: 200 }, { w: 150 }], self: false },
                  { lines: [{ w: 160 }], self: true },
                  { lines: [{ w: 260 }, { w: 100 }], self: false },
                  { lines: [{ w: 120 }], self: true },
                  { lines: [{ w: 190 }, { w: 140 }], self: false },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: item.self ? 'flex-end' : 'flex-start',
                    marginBottom: 6,
                  }}>
                    <div style={{
                      background: '#fff',
                      borderRadius: item.self ? '10px 0 10px 10px' : '0 10px 10px 10px',
                      padding: '10px 14px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      display: 'flex', flexDirection: 'column', gap: 8,
                      minWidth: Math.max(...item.lines.map(l => l.w)) + 28,
                    }}>
                      {item.lines.map((line, j) => (
                        <div key={j} className="yt-skel" style={{ height: 12, width: line.w, borderRadius: 6 }} />
                      ))}
                      {/* timestamp skeleton */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div className="yt-skel" style={{ height: 8, width: 36, borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                ))}
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
              <></>
            )}
            {/* Messages grouped by date */}
            {!loadingMsgs && messages.length > 0 && groupByDate(messages).map(g => (
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
            ))}

            {/* Typing indicator */}
            {activeRoom && (typingUsers[activeRoom.id] ?? []).length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 4 }}>
                <div style={{
                  background: '#fff', borderRadius: '0px 8px 8px 8px',
                  padding: '8px 14px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span style={{ fontSize: '0.82rem', color: WA_TEXT_SECONDARY, fontStyle: 'italic' }}>
                    {(typingUsers[activeRoom.id] ?? []).join(', ')} {(typingUsers[activeRoom.id] ?? []).length === 1 ? 'is' : 'are'} typing
                  </span>
                  <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: WA_TEXT_SECONDARY,
                        display: 'inline-block',
                        animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </span>
                </div>
              </div>
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
                onChange={handleInputChange}
                onKeyDown={handleKey}
                rows={1}
              />
            </div>

            {sendError && (
              <div role="alert" style={{ color: '#b91c1c', fontSize: '0.75rem', maxWidth: 180 }}>
                {sendError}
              </div>
            )}
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
        .wa-sidebar { display: flex; flex-shrink: 0; width: 380px; height: 100%; position: relative; }
        .wa-chat { display: flex; flex: 1; height: 100%; min-width: 0; }
        .chat-back-btn { display: none; }
        @media (max-width: 768px) {
          .wa-sidebar { width: 100%; position: absolute; inset: 0; z-index: 10; transition: transform 0.25s ease; }
          .wa-sidebar.hidden-mobile { transform: translateX(-100%); pointer-events: none; }
          .wa-chat { width: 100%; }
          .chat-back-btn { display: flex; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="wa-shell">
        <div className={`wa-sidebar${!showSidebar ? ' hidden-mobile' : ''}`}>
          {SidebarEl}

          {/* Profile Sidebar Overlay — Synexa dark-red theme */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: SX_BG_PANEL, zIndex: 100,
            transform: showProfile ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)',
            display: 'flex', flexDirection: 'column',
            fontFamily: "'Inter','Segoe UI',Helvetica,sans-serif"
          }}>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${SX_RED} 0%, #b91c1c 100%)`,
              color: '#fff', height: 112,
              display: 'flex', alignItems: 'flex-end', padding: '0 20px 18px', gap: 16,
              boxShadow: '0 2px 12px rgba(140,8,23,0.35)'
            }}>
              <IconBtn onClick={() => setShowProfile(false)}><IcoBack color="#fff" /></IconBtn>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.3px' }}>My Profile</span>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', background: SX_BG_PANEL }}>

              {/* Avatar Zone */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 24px', background: SX_SURFACE, borderBottom: '1px solid #f0f0f0' }}>
                <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} ref={profileFileRef} onChange={handleProfileAvatarUpload} />

                {/* Clickable Avatar with hover overlay */}
                <div
                  style={{ position: 'relative', width: 120, height: 120, cursor: 'pointer', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 4px 20px rgba(140,8,23,0.25)', border: `3px solid ${SX_RED}` }}
                  onClick={() => !uploadingAvatar && profileFileRef.current?.click()}
                  onMouseEnter={e => { const ov = (e.currentTarget as HTMLElement).querySelector('.px-ov') as HTMLElement; if (ov) ov.style.opacity = '1' }}
                  onMouseLeave={e => { const ov = (e.currentTarget as HTMLElement).querySelector('.px-ov') as HTMLElement; if (ov && !uploadingAvatar) ov.style.opacity = '0' }}
                >
                  <Avatar name={editName || me?.name || 'User'} src={editAvatarUrl} size={120} />

                  {/* Overlay */}
                  <div className="px-ov" style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    opacity: uploadingAvatar ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }}>
                    {uploadingAvatar ? (
                      /* Spinner */
                      <svg width={36} height={36} viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="60 34" strokeLinecap="round">
                          <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.8s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                    ) : (
                      <IcoCamera color="#fff" />
                    )}
                    <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {uploadingAvatar ? 'Uploading…' : 'Change'}
                    </span>
                  </div>
                </div>

                <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#999', fontWeight: 500 }}>Tap to change photo</p>
              </div>

              {/* Name Edit Card */}
              <div style={{ background: SX_SURFACE, margin: '16px', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: SX_RED, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 10 }}>Display Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{
                    width: '100%', border: 'none', borderBottom: `2px solid ${SX_RED}`,
                    outline: 'none', fontSize: '1.05rem', color: '#222',
                    background: 'transparent', paddingBottom: 8, fontWeight: 600, boxSizing: 'border-box'
                  }}
                />
                <p style={{ marginTop: 10, fontSize: '0.78rem', color: '#aaa', fontWeight: 400 }}>This name is visible to your contacts.</p>
              </div>

              {/* Email (read-only) */}
              {me?.email && (
                <div style={{ background: SX_SURFACE, margin: '0 16px 16px', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 10 }}>Email</label>
                  <p style={{ fontSize: '1rem', color: '#555', fontWeight: 500 }}>{me.email}</p>
                </div>
              )}

              {/* Save Button */}
              <div style={{ padding: '8px 16px 32px' }}>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  style={{
                    width: '100%', background: savingProfile ? '#ccc' : `linear-gradient(135deg, ${SX_RED} 0%, #b91c1c 100%)`,
                    color: '#fff', border: 'none', borderRadius: 12,
                    padding: '14px 0', fontSize: '1rem', fontWeight: 700,
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    boxShadow: savingProfile ? 'none' : '0 6px 18px rgba(140,8,23,0.35)',
                    transition: 'all 0.2s', letterSpacing: '0.3px'
                  }}
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* New Chat Sidebar Overlay */}
          {modal && me && (
            <NewChatModal myId={me.id} onClose={() => setModal(false)} onCreated={onRoomCreated} />
          )}
        </div>
        <div className="wa-chat" style={{ position: 'relative', overflow: 'hidden' }}>
          {ChatEl}

          {/* Right Contact Info Canvas */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '100%', maxWidth: 380, height: '100%',
            background: SX_BG_PANEL, zIndex: 150,
            transform: showContactProfile ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)',
            display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
            fontFamily: "'Inter','Segoe UI',Helvetica,sans-serif"
          }}>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${SX_RED} 0%, #b91c1c 100%)`,
              color: '#fff', height: 112,
              display: 'flex', alignItems: 'flex-end', padding: '0 20px 18px', gap: 16,
              boxShadow: '0 2px 12px rgba(140,8,23,0.35)', flexShrink: 0
            }}>
              <IconBtn onClick={() => setShowContactProfile(false)}><IcoClose /></IconBtn>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.3px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Contact Info</span>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', background: SX_BG_PANEL }}>
              {/* Avatar Zone & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 24px', background: SX_SURFACE, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 16 }}>
                  {activeRoom?.isGroup ? (
                    <div style={{ width: 140, height: 140, borderRadius: '50%', background: seedColor(curName), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <IcoGroup />
                    </div>
                  ) : (
                    <Avatar name={curName} src={curAvatar} size={140} online={curOther?.isOnline} />
                  )}
                </div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: '#111', textAlign: 'center' }}>{curName}</h2>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>
                  {activeRoom?.isGroup
                    ? `${activeRoom.members.length} members`
                    : curOther?.isOnline ? <span style={{ color: WA_GREEN }}>Online</span>
                      : curOther?.lastSeenAt ? `Last seen ${fmtTime(curOther.lastSeenAt)}`
                        : 'Offline'}
                </div>
              </div>

              {/* Email / Details */}
              {!activeRoom?.isGroup && curOther?.email && (
                <div style={{ background: SX_SURFACE, margin: '16px', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Email</label>
                  <div style={{ fontSize: '1.05rem', color: '#222', fontWeight: 500 }}>{curOther.email}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, background: '#1f2937', color: '#fff',
          padding: '12px 24px', borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          fontSize: '0.9rem', fontWeight: 500,
          animation: 'toastIn 0.3s ease-out',
          maxWidth: 360, textAlign: 'center',
          pointerEvents: 'none'
        }}>
          🔔 {toast.message}
        </div>
      )}

      {cropModalOpen && cropSrc && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Inter','Segoe UI',Helvetica,sans-serif",
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#fff', width: '90%', maxWidth: 420,
            borderRadius: 16, display: 'flex', flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 24px', borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>Edit Profile Photo</span>
              <IconBtn onClick={() => { setCropModalOpen(false); if (cropSrc) URL.revokeObjectURL(cropSrc); setCropSrc(null) }} title="Close">
                <IcoClose />
              </IconBtn>
            </div>

            {/* Cropper Content Area */}
            <div style={{ position: 'relative', height: 350, width: '100%', background: '#fff' }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={true}
                style={{
                  containerStyle: { backgroundColor: '#fff' },
                  cropAreaStyle: { border: '2px solid rgba(255,255,255,0.85)' }
                }}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_croppedArea, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
              />
            </div>

            {/* Zoom Controls */}
            <div style={{
              padding: '16px 24px 0',
              display: 'flex', alignItems: 'center', gap: 16,
              background: '#fff'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>−</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#8c0817', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#555' }}>+</span>
            </div>

            {/* Bottom Actions */}
            <div style={{
              padding: '16px 24px 20px',
              display: 'flex', justifyContent: 'center',
              background: '#fff'
            }}>
              <button
                onClick={uploadCroppedImage}
                style={{
                  background: 'linear-gradient(135deg, #8c0817 0%, #b91c1c 100%)',
                  border: 'none', borderRadius: 12,
                  padding: '12px 0', width: '100%', maxWidth: 200,
                  fontSize: '1rem', fontWeight: 700, color: '#fff',
                  cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px',
                  boxShadow: '0 6px 18px rgba(140,8,23,0.35)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          fontFamily: "'Inter','Segoe UI',Helvetica,sans-serif"
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '24px', width: '90%', maxWidth: 360,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#111', fontWeight: 800 }}>Log out</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.95rem', color: '#666', lineHeight: 1.5, fontWeight: 500 }}>
              Are you sure you want to log out of Synexa?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: '1px solid #e0e0e0',
                  background: '#fff', color: '#444', fontSize: '0.95rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >Cancel</button>
              <button
                onClick={logout}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: '#d32f2f', color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#b71c1c'}
                onMouseLeave={e => e.currentTarget.style.background = '#d32f2f'}
              >Log out</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
