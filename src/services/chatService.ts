import { api } from './api'
import type {
  User,
  Room,
  MessagesResponse,
  CreateRoomPayload,
  UploadResponse,
  Message,
} from '../types/chat'

export const chatService = {
  getMyProfile: (): Promise<User> => api.get('/api/users/me'),

  searchUsers: (q: string): Promise<User[]> =>
    api.get(`/api/users/search?q=${encodeURIComponent(q)}`),

  getUserById: (id: string): Promise<User> => api.get(`/api/users/${id}`),

  getRooms: (): Promise<Room[]> => api.get('/api/rooms'),

  getRoom: (id: string): Promise<Room> => api.get(`/api/rooms/${id}`),

  createRoom: (payload: CreateRoomPayload): Promise<Room> =>
    api.post('/api/rooms', payload),

  getMessages: (
    roomId: string,
    cursor?: string,
    limit = 30
  ): Promise<MessagesResponse> => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set('cursor', cursor)
    return api.get(`/api/messages/${roomId}?${params.toString()}`)
  },

  uploadFile: (file: File): Promise<UploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    return api.postForm('/api/files/upload', form)
  },

  sendMessage: (roomId: string, text: string | null, fileUrl: string | null, fileType: string | null): Promise<Message> => {
    return api.post(`/api/messages`, { roomId, text, fileUrl, fileType })
  },
}
