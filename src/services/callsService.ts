import { api } from './api'
import type { Notification } from '../types/chat'

export type CallHistoryFilter = 'all' | 'missed'

export interface CallPeer {
  id?: string
  name?: string
  email?: string
  avatarUrl?: string | null
}

export interface CallHistoryItem {
  id: string
  roomId: string
  type: 'audio' | 'video'
  status: 'ringing' | 'answered' | 'missed' | 'rejected' | 'cancelled' | 'ended' | 'disconnected'
  direction: 'incoming' | 'outgoing'
  peer: CallPeer | string
  startedAt: string
  answeredAt: string | null
  endedAt: string | null
  durationSeconds: number
}

export interface CallHistoryPage {
  calls: CallHistoryItem[]
  nextBefore: string | null
}

type NotificationsResponse = Notification[] | { notifications?: Notification[] }

export const callsService = {
  getHistory: (filter: CallHistoryFilter = 'all', before?: string, limit = 20): Promise<CallHistoryPage> => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (before) params.set('before', before)
    const endpoint = filter === 'missed' ? '/api/calls/missed' : '/api/calls'
    return api.get<CallHistoryPage>(`${endpoint}?${params.toString()}`)
  },

  getUnreadMissedCallNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<NotificationsResponse>('/api/notifications?type=missed_call&unreadOnly=true')
    return Array.isArray(response) ? response : response.notifications ?? []
  },

  markNotificationRead: (notificationId: string): Promise<void> =>
    api.patch<void>(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {}),
}