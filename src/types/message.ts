export type Message = {
  id: string
  content: string
  senderId: string
  conversationId: string
  createdAt: string
  isRead?: boolean
}
