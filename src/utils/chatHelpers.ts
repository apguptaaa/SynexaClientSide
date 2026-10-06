import type { Room, User } from '../types/chat'
import { AVATAR_COLORS } from './constants'

export function seedColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function fmtLastSeen(iso: string) {
  const d = new Date(iso)
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  return `Last seen ${time}, ${date}`
}

export function fmtSidebarTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function fmtDateLabel(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(); yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}

export function roomName(room: Room, myId: string) {
  if (room.isGroup) return room.name ?? 'Group'
  return room.members.find(m => m.userId !== myId)?.user.name ?? 'Unknown'
}

export function roomAvatar(room: Room, myId: string): string | null {
  if (room.isGroup) return null
  return room.members.find(m => m.userId !== myId)?.user.avatarUrl ?? null
}

export function otherUser(room: Room, myId: string): User | undefined {
  return room.members.find(m => m.userId !== myId)?.user
}

export function sortRooms(list: Room[]) {
  return [...list].sort((a, b) => {
    const at = a.messages[0]?.createdAt ?? a.createdAt
    const bt = b.messages[0]?.createdAt ?? b.createdAt
    return new Date(bt).getTime() - new Date(at).getTime()
  })
}
