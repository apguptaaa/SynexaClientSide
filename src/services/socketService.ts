import { io, Socket } from 'socket.io-client'
import type { Message, Room, Notification } from '../types/chat'
import { BACKEND_URL } from '../constants/config'

type TypingPayload = { roomId: string; userId: string; userName: string }
type SeenPayload = {
  roomId: string
  userId: string
  messageIds?: string[]
  entries?: { messageId: string; seenAt: string }[]
}
type DeliveredPayload = { roomId: string; messageIds: string[] }
type PresenceListener = (userId: string) => void
type PresenceSnapshotListener = (userIds: string[]) => void
export type MessageDeletedPayload = { messageId: string; roomId: string }
export type CallType = 'audio' | 'video'
export type CallEndReason = 'rejected' | 'ended' | 'no-answer' | 'disconnected'
export type CallIncomingPayload = {
  callId: string
  roomId: string
  callType: CallType
  offer: RTCSessionDescriptionInit
  fromUserId?: string
  caller?: { id?: string; name?: string; avatarUrl?: string | null }
}
export type CallEventMap = {
  'call:ringing': { callId: string; roomId?: string }
  'call:incoming': CallIncomingPayload
  'call:accepted': { callId?: string; answer: RTCSessionDescriptionInit }
  'call:ice-candidate': { callId: string; candidate: RTCIceCandidateInit | null }
  'call:ended': { callId: string; reason: CallEndReason }
  'call:error': { callId?: string; code?: string; message?: string; error?: string }
}
type CallEventName = keyof CallEventMap

class SocketService {
  private socket: Socket | null = null
  private messageListeners = new Set<(message: Message) => void>()
  private roomListeners = new Set<(room: Room) => void>()
  private typingStartListeners = new Set<(payload: TypingPayload) => void>()
  private typingStopListeners = new Set<(payload: TypingPayload) => void>()
  private seenListeners = new Set<(payload: SeenPayload) => void>()
  private deliveredListeners = new Set<(payload: DeliveredPayload) => void>()
  private messageDeletedListeners = new Set<(payload: MessageDeletedPayload) => void>()
  private notificationListeners = new Set<(n: Notification) => void>()
  private onlineListeners = new Set<PresenceListener>()
  private offlineListeners = new Set<PresenceListener>()
  private presenceSnapshotListeners = new Set<PresenceSnapshotListener>()
  private callListeners = new Map<CallEventName, Set<(payload: CallEventMap[CallEventName]) => void>>()
  private joinedRooms = new Set<string>()

  connect() {
    if (this.socket) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    this.socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('Connected to socket', this.socket?.id)
      this.joinedRooms.forEach(roomId => this.socket?.emit('room:join', roomId))
      this.syncPresence()
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket')
    })

    this.socket.on('user:online', (userId: string) => {
      this.onlineListeners.forEach(listener => listener(userId))
    })

    this.socket.on('user:offline', (userId: string) => {
      this.offlineListeners.forEach(listener => listener(userId))
    })

    this.socket.on('presence:state', (userIds: string[]) => {
      this.presenceSnapshotListeners.forEach(listener => listener(userIds))
    })

    this.socket.on('message:new', (message: Message) => {
      this.messageListeners.forEach(l => l(message))
    })

    this.socket.on('message:delete', (payload: MessageDeletedPayload) => {
      this.messageDeletedListeners.forEach(listener => listener(payload))
    })

    this.socket.on('room_updated', (room: Room) => {
      this.roomListeners.forEach(l => l(room))
    })

    this.socket.on('message:delivered', (payload: DeliveredPayload) => {
      this.deliveredListeners.forEach(l => l(payload))
    })

    this.socket.on('message:seen', (payload: SeenPayload) => {
      this.seenListeners.forEach(l => l(payload))
    })

    this.socket.on('typing:start', (payload: TypingPayload) => {
      this.typingStartListeners.forEach(l => l(payload))
    })

    this.socket.on('typing:stop', (payload: TypingPayload) => {
      this.typingStopListeners.forEach(l => l(payload))
    })

    this.socket.on('notification:new', (n: Notification) => {
      this.notificationListeners.forEach(l => l(n))
    })

    const callEvents: CallEventName[] = [
      'call:ringing',
      'call:incoming',
      'call:accepted',
      'call:ice-candidate',
      'call:ended',
      'call:error',
    ]
    callEvents.forEach(event => {
      this.socket?.on(event, (payload: CallEventMap[CallEventName]) => {
        this.callListeners.get(event)?.forEach(listener => listener(payload))
      })
    })
  }

  waitUntilConnected(timeoutMs = 10000): Promise<void> {
    if (this.socket?.connected) return Promise.resolve()
    if (!this.socket) this.connect()
    const socket = this.socket
    if (!socket) return Promise.reject(new Error('No access token is available for realtime messaging.'))

    return new Promise((resolve, reject) => {
      const onConnect = () => {
        clearTimeout(timeout)
        resolve()
      }
      const timeout = setTimeout(() => {
        socket.off('connect', onConnect)
        reject(new Error('Realtime connection timed out. Check your internet connection and try again.'))
      }, timeoutMs)
      socket.once('connect', onConnect)
      if (socket.connected) onConnect()
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.joinedRooms.clear()
  }

  isConnected() {
    return this.socket?.connected ?? false
  }

  syncPresence() {
    if (this.socket?.connected) this.socket.emit('presence:sync')
  }

  // ── Room ──
  joinRoom(roomId: string) {
    this.joinedRooms.add(roomId)
    if (this.socket?.connected) this.socket.emit('room:join', roomId)
  }

  forgetRoom(roomId: string) {
    this.joinedRooms.delete(roomId)
  }

  // ── Messages ──
  sendMessage(roomId: string, text: string | null, fileUrl: string | null, fileType: string | null) {
    this.socket?.emit('message:send', { roomId, text, fileUrl, fileType })
  }

  emitSeen(roomId: string, messageIds: string[]): boolean {
    if (!this.socket?.connected) return false
    this.socket.emit('message:seen', { roomId, messageIds })
    return true
  }

  emitDelivered(roomId: string, messageIds: string[]) {
    this.socket?.emit('message:delivered', { roomId, messageIds })
  }

  // ── Typing ──
  emitTypingStart(roomId: string) {
    this.socket?.emit('typing:start', { roomId })
  }

  emitTypingStop(roomId: string) {
    this.socket?.emit('typing:stop', { roomId })
  }

  emitCallEvent(event: 'call:start' | 'call:accept' | 'call:reject' | 'call:ice-candidate' | 'call:end', payload: unknown) {
    this.socket?.emit(event, payload)
  }

  // ── Listeners: message:new ──
  onNewMessage(callback: (message: Message) => void) { this.messageListeners.add(callback) }
  offNewMessage(callback: (message: Message) => void) { this.messageListeners.delete(callback) }

  onMessageDeleted(callback: (payload: MessageDeletedPayload) => void) { this.messageDeletedListeners.add(callback) }
  offMessageDeleted(callback: (payload: MessageDeletedPayload) => void) { this.messageDeletedListeners.delete(callback) }

  // ── Listeners: room updated ──
  onRoomUpdated(callback: (room: Room) => void) { this.roomListeners.add(callback) }
  offRoomUpdated(callback: (room: Room) => void) { this.roomListeners.delete(callback) }

  // ── Listeners: delivered ──
  onDelivered(callback: (p: DeliveredPayload) => void) { this.deliveredListeners.add(callback) }
  offDelivered(callback: (p: DeliveredPayload) => void) { this.deliveredListeners.delete(callback) }

  // ── Listeners: seen ──
  onSeen(callback: (p: SeenPayload) => void) { this.seenListeners.add(callback) }
  offSeen(callback: (p: SeenPayload) => void) { this.seenListeners.delete(callback) }

  onUserOnline(callback: PresenceListener) { this.onlineListeners.add(callback) }
  offUserOnline(callback: PresenceListener) { this.onlineListeners.delete(callback) }
  onUserOffline(callback: PresenceListener) { this.offlineListeners.add(callback) }
  offUserOffline(callback: PresenceListener) { this.offlineListeners.delete(callback) }
  onPresenceSnapshot(callback: PresenceSnapshotListener) { this.presenceSnapshotListeners.add(callback) }
  offPresenceSnapshot(callback: PresenceSnapshotListener) { this.presenceSnapshotListeners.delete(callback) }

  // ── Listeners: typing ──
  onTypingStart(callback: (p: TypingPayload) => void) { this.typingStartListeners.add(callback) }
  offTypingStart(callback: (p: TypingPayload) => void) { this.typingStartListeners.delete(callback) }
  onTypingStop(callback: (p: TypingPayload) => void) { this.typingStopListeners.add(callback) }
  offTypingStop(callback: (p: TypingPayload) => void) { this.typingStopListeners.delete(callback) }

  // ── Listeners: notifications ──
  onNotification(callback: (n: Notification) => void) { this.notificationListeners.add(callback) }
  offNotification(callback: (n: Notification) => void) { this.notificationListeners.delete(callback) }

  onCallEvent<K extends CallEventName>(event: K, callback: (payload: CallEventMap[K]) => void) {
    let listeners = this.callListeners.get(event)
    if (!listeners) {
      listeners = new Set()
      this.callListeners.set(event, listeners)
    }
    listeners.add(callback as (payload: CallEventMap[CallEventName]) => void)
  }

  offCallEvent<K extends CallEventName>(event: K, callback: (payload: CallEventMap[K]) => void) {
    this.callListeners.get(event)?.delete(callback as (payload: CallEventMap[CallEventName]) => void)
  }
}

export const socketService = new SocketService()
