export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  isOnline?: boolean
  lastSeenAt?: string | null
  provider?: string
  createdAt?: string
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  text: string | null
  fileUrl: string | null
  fileType: string | null
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

export interface RoomMember {
  id: string
  userId: string
  roomId: string
  user: User
}

export interface Room {
  id: string
  name: string | null
  isGroup: boolean
  createdAt: string
  members: RoomMember[]
  messages: Message[]
}

export interface MessagesResponse {
  messages: Message[]
  nextCursor: string | null
}

export interface CreateRoomPayload {
  isGroup: boolean
  memberIds: string[]
  name?: string
}

export interface UploadResponse {
  fileUrl: string
  fileType: string
}
