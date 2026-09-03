import { io, Socket } from 'socket.io-client'
import type { Message, Room } from '../types/chat'

// Ensure we point to the backend URL for socket connection
const BACKEND_URL = 'https://synexabackend.onrender.com'

class SocketService {
  private socket: Socket | null = null

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
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket')
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    if (!this.socket) return
    this.socket.on('new_message', callback)
  }

  offNewMessage(callback: (message: Message) => void) {
    if (!this.socket) return
    this.socket.off('new_message', callback)
  }

  onRoomUpdated(callback: (room: Room) => void) {
    if (!this.socket) return
    this.socket.on('room_updated', callback)
  }
  
  offRoomUpdated(callback: (room: Room) => void) {
    if (!this.socket) return
    this.socket.off('room_updated', callback)
  }
}

export const socketService = new SocketService()
