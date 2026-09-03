import { io, Socket } from 'socket.io-client'
import type { Message, Room } from '../types/chat'

// Ensure we point to the backend URL for socket connection
const BACKEND_URL = 'https://synexabackend.onrender.com'

class SocketService {
  private socket: Socket | null = null
  private messageListeners = new Set<(message: Message) => void>()
  private roomListeners = new Set<(room: Room) => void>()
  private joinedRooms = new Set<string>()

  connect() {
    if (this.socket?.connected) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    this.socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Use Websocket primarily
    })

    this.socket.on('connect', () => {
      console.log('Connected to socket', this.socket?.id)
      this.joinedRooms.forEach(roomId => this.socket?.emit('room:join', roomId))
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket')
    })

    this.socket.on('message:new', message => {
      this.messageListeners.forEach(listener => listener(message))
    })

    this.socket.on('room_updated', room => {
      this.roomListeners.forEach(listener => listener(room))
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

  onNewMessage(callback: (message: Message) => void) {
    this.messageListeners.add(callback)
  }

  offNewMessage(callback: (message: Message) => void) {
    this.messageListeners.delete(callback)
  }

  joinRoom(roomId: string) {
    this.joinedRooms.add(roomId)
    if (this.socket?.connected) this.socket.emit('room:join', roomId)
  }

  sendMessage(roomId: string, text: string | null, fileUrl: string | null, fileType: string | null) {
    this.socket?.emit('message:send', { roomId, text, fileUrl, fileType })
  }

  onRoomUpdated(callback: (room: Room) => void) {
    this.roomListeners.add(callback)
  }
  
  offRoomUpdated(callback: (room: Room) => void) {
    this.roomListeners.delete(callback)
  }
}

export const socketService = new SocketService()
