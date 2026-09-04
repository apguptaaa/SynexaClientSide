import { io, Socket } from 'socket.io-client'
import type { Message, Room, Notification } from '../types/chat'

const BACKEND_URL = 'https://synexabackend.onrender.com'

type TypingPayload = { roomId: string; userId: string; userName: string }
type SeenPayload = { roomId: string; userId: string; messageIds: string[] }
type DeliveredPayload = { roomId: string; messageIds: string[] }

class SocketService {
  private socket: Socket | null = null
  private messageListeners = new Set<(message: Message) => void>()
  private roomListeners = new Set<(room: Room) => void>()
  private typingStartListeners = new Set<(payload: TypingPayload) => void>()
  private typingStopListeners = new Set<(payload: TypingPayload) => void>()
  private seenListeners = new Set<(payload: SeenPayload) => void>()
  private deliveredListeners = new Set<(payload: DeliveredPayload) => void>()
  private notificationListeners = new Set<(n: Notification) => void>()
  private joinedRooms = new Set<string>()

  connect() {
    if (this.socket?.connected) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    this.socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('Connected to socket', this.socket?.id)
      this.joinedRooms.forEach(roomId => this.socket?.emit('room:join', roomId))
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket')
    })

    this.socket.on('message:new', (message: Message) => {
      this.messageListeners.forEach(l => l(message))
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

  // ── Room ──
  joinRoom(roomId: string) {
    this.joinedRooms.add(roomId)
    if (this.socket?.connected) this.socket.emit('room:join', roomId)
  }

  // ── Messages ──
  sendMessage(roomId: string, text: string | null, fileUrl: string | null, fileType: string | null) {
    this.socket?.emit('message:send', { roomId, text, fileUrl, fileType })
  }

  emitSeen(roomId: string) {
    this.socket?.emit('message:seen', { roomId })
  }

  // ── Typing ──
  emitTypingStart(roomId: string) {
    this.socket?.emit('typing:start', { roomId })
  }

  emitTypingStop(roomId: string) {
    this.socket?.emit('typing:stop', { roomId })
  }

  // ── Listeners: message:new ──
  onNewMessage(callback: (message: Message) => void) { this.messageListeners.add(callback) }
  offNewMessage(callback: (message: Message) => void) { this.messageListeners.delete(callback) }

  // ── Listeners: room updated ──
  onRoomUpdated(callback: (room: Room) => void) { this.roomListeners.add(callback) }
  offRoomUpdated(callback: (room: Room) => void) { this.roomListeners.delete(callback) }

  // ── Listeners: delivered ──
  onDelivered(callback: (p: DeliveredPayload) => void) { this.deliveredListeners.add(callback) }
  offDelivered(callback: (p: DeliveredPayload) => void) { this.deliveredListeners.delete(callback) }

  // ── Listeners: seen ──
  onSeen(callback: (p: SeenPayload) => void) { this.seenListeners.add(callback) }
  offSeen(callback: (p: SeenPayload) => void) { this.seenListeners.delete(callback) }

  // ── Listeners: typing ──
  onTypingStart(callback: (p: TypingPayload) => void) { this.typingStartListeners.add(callback) }
  offTypingStart(callback: (p: TypingPayload) => void) { this.typingStartListeners.delete(callback) }
  onTypingStop(callback: (p: TypingPayload) => void) { this.typingStopListeners.add(callback) }
  offTypingStop(callback: (p: TypingPayload) => void) { this.typingStopListeners.delete(callback) }

  // ── Listeners: notifications ──
  onNotification(callback: (n: Notification) => void) { this.notificationListeners.add(callback) }
  offNotification(callback: (n: Notification) => void) { this.notificationListeners.delete(callback) }
}

export const socketService = new SocketService()
