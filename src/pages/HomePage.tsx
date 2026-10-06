import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Area } from 'react-easy-crop'
import { chatService } from '../services/chatService'
import { socketService } from '../services/socketService'
import type { Room, Message, User, Notification } from '../types/chat'
import { sortRooms, roomName, otherUser, roomAvatar } from '../utils/chatHelpers'
import { NewChatModal } from '../components/chat/NewChatModal'
import { ChatSidebar } from '../components/chat/ChatSidebar'
import { ChatArea } from '../components/chat/ChatArea'
import { AIChatView } from '../components/chat/AIChatView'
import { ProfileSidebar } from '../components/profile/ProfileSidebar'
import { ContactInfoSidebar } from '../components/profile/ContactInfoSidebar'
import { CropModal } from '../components/profile/CropModal'
import { LogoutConfirm } from '../components/common/LogoutConfirm'
import { ConfirmActionModal } from '../components/common/ConfirmActionModal'
import { SidebarNav } from '../components/layout/SidebarNav'
import { ProfileView } from '../components/profile/ProfileView'
import { SettingsView } from '../components/settings/SettingsView'
import { CalendarView } from '../components/calendar/CalendarView'
import { CallsView } from '../components/calls/CallsView'
import { CallOverlay } from '../components/calls/CallOverlay'
import { useWebRTCCall } from '../hooks/useWebRTCCall'
import { hydrateTheme } from '../hooks/useTheme'
import { callsService } from '../services/callsService'

type ConfirmAction = {
  title: string
  message: string
  confirmLabel: string
  run: () => void | Promise<void>
}

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
  const [showSidebar, setShowSidebar] = useState(true)
  const [aiChatOpen, setAiChatOpen] = useState(false)

  const [showProfile, setShowProfile] = useState(false)
  const [selectedCallRoom, setSelectedCallRoom] = useState<Room | null>(null)
  const [chatWallpaper, setChatWallpaper] = useState<string | null>(() => localStorage.getItem('chat_wallpaper'))
  const [activeNavTab, setActiveNavTab] = useState<'chats' | 'calls' | 'calendar' | 'settings' | 'profile'>('chats')
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')
  const [attachedFile, setAttachedFile] = useState<{ file: File; name: string; size: number; type: string } | null>(null)

  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({})
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [newMessageAnchorId, setNewMessageAnchorId] = useState<string | null>(null)
  const [animatedMessageId, setAnimatedMessageId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const attachMenuRef = useRef<HTMLDivElement>(null)
  const imgFileRef = useRef<HTMLInputElement>(null)
  const docFileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<{ message: string; id: string; notificationId?: string } | null>(null)
  const [missedCallNotifications, setMissedCallNotifications] = useState<Notification[]>([])
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showCallNotice = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, id: `call-${Date.now()}` })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }, [])
  const callController = useWebRTCCall(showCallNotice)

  const [showContactProfile, setShowContactProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const profileFileRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const feedRef = useRef<HTMLDivElement>(null)
  const newMessageDividerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<Room | null>(null)
  const meRef = useRef<User | null>(null)
  const pendingMessages = useRef(new Map<string, string>())
  const newMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = feedRef.current
      if (!el) return
      if (smooth) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      } else {
        const previousBehavior = el.style.scrollBehavior
        el.style.scrollBehavior = 'auto'
        el.scrollTop = el.scrollHeight
        el.style.scrollBehavior = previousBehavior
      }
    })
  }, [])

  const animateMessage = useCallback((messageId: string) => {
    setAnimatedMessageId(messageId)
    window.setTimeout(() => {
      setAnimatedMessageId(current => current === messageId ? null : current)
    }, 350)
  }, [])

  const showNewMessageDivider = useCallback((messageId: string) => {
    setNewMessageAnchorId(current => current ?? messageId)
    if (newMessageTimer.current) clearTimeout(newMessageTimer.current)
    newMessageTimer.current = setTimeout(() => {
      setNewMessageAnchorId(null)
      newMessageTimer.current = null
    }, 12000)
  }, [])

  useEffect(() => { activeRef.current = activeRoom }, [activeRoom])
  useEffect(() => { meRef.current = me }, [me])

  useEffect(() => {
    if (!activeRoom || loadingMsgs) return
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const feed = feedRef.current
        const divider = newMessageDividerRef.current
        if (newMessageAnchorId && feed && divider) {
          feed.scrollTop = Math.max(0, divider.offsetTop - feed.clientHeight * 0.35)
        } else {
          scrollToBottom(false)
        }
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [activeRoom?.id, loadingMsgs, messages.length, newMessageAnchorId, scrollToBottom])

  const openRoom = async (room: Room) => {
    setAiChatOpen(false)
    if (activeRef.current?.id === room.id) {
      setShowSidebar(false)
      return
    }
    if (newMessageTimer.current) clearTimeout(newMessageTimer.current)
    setNewMessageAnchorId(null)
    setActiveRoom(room)
    setActiveNavTab('chats')
    socketService.joinRoom(room.id)
    setMessages([])
    setNextCursor(null)
    setLoadingMsgs(true)
    setShowSidebar(false)
    setUnreadCounts(prev => ({ ...prev, [room.id]: 0 }))
    try {
      const { messages: msgs, nextCursor: cur } = await chatService.getMessages(room.id, undefined, 30)
      const chronologicalMessages = msgs.slice().reverse()
      setMessages(chronologicalMessages)
      setNextCursor(cur)

      const unseenIds = msgs.filter(m => m.senderId !== me?.id && m.status !== 'seen').map(m => m.id)
      const firstUnread = chronologicalMessages.find(message => unseenIds.includes(message.id))
      if (firstUnread) showNewMessageDivider(firstUnread.id)
      if (unseenIds.length > 0) {
        chatService.markSeen(room.id, unseenIds).catch(() => { })
        socketService.emitSeen(room.id, unseenIds)
      }
    } catch { /**/ }
    setLoadingMsgs(false)
    requestAnimationFrame(() => scrollToBottom(false))
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const [profile, list] = await Promise.all([chatService.getMyProfile(), chatService.getRooms()])
        setMe(profile)
        setRooms(sortRooms(list))

        callsService.getUnreadMissedCallNotifications().then(notifications => {
          setMissedCallNotifications(previous => {
            const byId = new Map(notifications.map(notification => [notification.id, notification]))
            previous.forEach(notification => byId.set(notification.id, notification))
            return [...byId.values()]
          })
          const missedCall = notifications[0]
          if (!missedCall) return
          if (toastTimer.current) clearTimeout(toastTimer.current)
          setToast({ message: missedCall.message, id: missedCall.id, notificationId: missedCall.id })
        }).catch(() => {})

        chatService.getMyPreferences().then(preferences => {
          if (preferences.theme === 'light' || preferences.theme === 'dark') hydrateTheme(preferences.theme)
          if (typeof preferences.chatWallpaper === 'string' || preferences.chatWallpaper === null) {
            setChatWallpaper(preferences.chatWallpaper)
            if (preferences.chatWallpaper) localStorage.setItem('chat_wallpaper', preferences.chatWallpaper)
            else localStorage.removeItem('chat_wallpaper')
          }
        }).catch(() => {})

        socketService.connect()
        list.forEach(room => {
          socketService.joinRoom(room.id)
          // Silently fetch the latest message to fix missing read/delivered statuses from /api/rooms
          chatService.getMessages(room.id, undefined, 1).then(({ messages: msgs }) => {
            if (msgs.length > 0) {
              setRooms(prev => prev.map(r => r.id === room.id ? { ...r, messages: [msgs[0], ...r.messages.slice(1)] } : r))
            }
          }).catch(() => {})
        })
      } catch { /**/ }
    })()
    return () => { socketService.disconnect() }
  }, [])

  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      const messageKey = `${msg.roomId}|${msg.senderId}|${msg.text ?? ''}|${msg.fileUrl ?? ''}`
      const optimisticId = pendingMessages.current.get(messageKey)
      const wasOptimistic = Boolean(optimisticId)

      if (optimisticId) {
        pendingMessages.current.delete(messageKey)
        if (activeRef.current?.id === msg.roomId) animateMessage(msg.id)
        setMessages(prev => prev.map(message =>
          message.id === optimisticId
            ? { ...message, ...msg, status: msg.status ?? 'sent' }
            : message
        ))
      }

      setRooms(prev => {
        const existing = prev.find(r => r.id === msg.roomId)
        if (!existing) {
          chatService.getRooms().then(list => setRooms(sortRooms(list))).catch(() => { })
          return prev
        }
        const updated = { ...existing, messages: [msg, ...existing.messages] }
        return sortRooms([updated, ...prev.filter(r => r.id !== msg.roomId)])
      })

      if (wasOptimistic) return

      if (msg.senderId !== meRef.current?.id) {
        if (activeRef.current?.id === msg.roomId) {
          chatService.markSeen(msg.roomId, [msg.id]).catch(() => { })
          socketService.emitSeen(msg.roomId, [msg.id])
          showNewMessageDivider(msg.id)
        } else {
          socketService.emitDelivered(msg.roomId, [msg.id])
          setUnreadCounts(prev => ({ ...prev, [msg.roomId]: (prev[msg.roomId] || 0) + 1 }))
        }
      }

      if (activeRef.current?.id === msg.roomId) {
        animateMessage(msg.id)
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        setTimeout(() => scrollToBottom(true), 50)
      }
    }

    const handleMessageDeleted = ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      setMessages(previous => activeRef.current?.id === roomId
        ? previous.filter(message => message.id !== messageId)
        : previous)
      setRooms(previous => previous.map(room => room.id === roomId
        ? { ...room, messages: room.messages.filter(message => message.id !== messageId) }
        : room))
    }

    const handleRoomUpdated = (room: Room) => {
      setRooms(prev => {
        const existing = prev.find(r => r.id === room.id);
        if (existing) {
          const hierarchy = { 'seen': 3, 'delivered': 2, 'sent': 1, undefined: 0 };
          const mergedMessages = room.messages.map(m => {
            const exMsg = existing.messages.find(ex => ex.id === m.id);
            if (exMsg) {
              const currentLvl = hierarchy[m.status as keyof typeof hierarchy] || 0;
              const exLvl = hierarchy[exMsg.status as keyof typeof hierarchy] || 0;
              if (exLvl > currentLvl) {
                return { ...m, status: exMsg.status };
              }
            }
            return m;
          });
          room = { ...room, messages: mergedMessages };
        }
        return sortRooms([room, ...prev.filter(r => r.id !== room.id)])
      })
    }

    const handleDelivered = (payload: any) => {
      const { roomId, messageIds } = payload;
      setMessages(prev => prev.map(m => {
        if (messageIds && Array.isArray(messageIds) && messageIds.includes(m.id)) return { ...m, status: 'delivered' as const };
        if ((!messageIds || messageIds.length === 0) && (!roomId || m.roomId === roomId) && m.senderId === meRef.current?.id && m.status !== 'seen' && m.status !== 'delivered') return { ...m, status: 'delivered' as const };
        return m;
      }))
      setRooms(prev => prev.map(r => {
        let changed = false;
        const newMsgs = r.messages.map(m => {
          if (messageIds && Array.isArray(messageIds) && messageIds.includes(m.id)) { changed = true; return { ...m, status: 'delivered' as const }; }
          if ((!messageIds || messageIds.length === 0) && (!roomId || r.id === roomId) && m.senderId === meRef.current?.id && m.status !== 'seen' && m.status !== 'delivered') { changed = true; return { ...m, status: 'delivered' as const }; }
          return m;
        });
        return changed ? { ...r, messages: newMsgs } : r;
      }))
    }

    const handleSeen = (payload: any) => {
      const { roomId, messageIds } = payload;
      setMessages(prev => prev.map(m => {
        if (messageIds && Array.isArray(messageIds) && messageIds.includes(m.id)) return { ...m, status: 'seen' as const };
        if ((!messageIds || messageIds.length === 0) && (!roomId || m.roomId === roomId) && m.senderId === meRef.current?.id && m.status !== 'seen') return { ...m, status: 'seen' as const };
        return m;
      }))
      setRooms(prev => prev.map(r => {
        let changed = false;
        const newMsgs = r.messages.map(m => {
          if (messageIds && Array.isArray(messageIds) && messageIds.includes(m.id)) { changed = true; return { ...m, status: 'seen' as const }; }
          if ((!messageIds || messageIds.length === 0) && (!roomId || r.id === roomId) && m.senderId === meRef.current?.id && m.status !== 'seen') { changed = true; return { ...m, status: 'seen' as const }; }
          return m;
        });
        return changed ? { ...r, messages: newMsgs } : r;
      }))
    }

    const handleTypingStart = ({ roomId, userName }: { roomId: string; userId: string; userName: string }) => {
      setTypingUsers(prev => ({ ...prev, [roomId]: [...(prev[roomId] ?? []).filter(n => n !== userName), userName] }))
    }

    const handleTypingStop = ({ roomId, userName }: { roomId: string; userId: string; userName: string }) => {
      setTypingUsers(prev => ({ ...prev, [roomId]: (prev[roomId] ?? []).filter(n => n !== userName) }))
    }

    const handleNotification = (n: Notification) => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (n.type === 'missed_call') {
        setMissedCallNotifications(previous => [n, ...previous.filter(notification => notification.id !== n.id)])
      }
      setToast({ message: n.message, id: n.id, notificationId: n.id })
      if (n.type !== 'missed_call') {
        toastTimer.current = setTimeout(() => setToast(null), 4000)
      }
    }

    socketService.onNewMessage(handleNewMessage)
    socketService.onMessageDeleted(handleMessageDeleted)
    socketService.onRoomUpdated(handleRoomUpdated)
    socketService.onDelivered(handleDelivered)
    socketService.onSeen(handleSeen)
    socketService.onTypingStart(handleTypingStart)
    socketService.onTypingStop(handleTypingStop)
    socketService.onNotification(handleNotification)

    return () => {
      socketService.offNewMessage(handleNewMessage)
      socketService.offMessageDeleted(handleMessageDeleted)
      socketService.offRoomUpdated(handleRoomUpdated)
      socketService.offDelivered(handleDelivered)
      socketService.offSeen(handleSeen)
      socketService.offTypingStart(handleTypingStart)
      socketService.offTypingStop(handleTypingStop)
      socketService.offNotification(handleNotification)
    }
  }, [animateMessage, showNewMessageDivider])

  const markCallNotificationRead = async (notificationId: string) => {
    try {
      await callsService.markNotificationRead(notificationId)
      setMissedCallNotifications(previous => previous.filter(notification => notification.id !== notificationId))
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast(current => current?.notificationId === notificationId ? null : current)
    } catch (error) {
      showCallNotice(error instanceof Error ? error.message : 'Unable to mark call notification as read.')
    }
  }

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

  const handleScroll = () => { if (feedRef.current && feedRef.current.scrollTop < 80) loadMore() }

  const forgetDeletedRooms = (roomIds: string[]) => {
    const deletedIds = new Set(roomIds)
    roomIds.forEach(roomId => socketService.forgetRoom(roomId))
    setRooms(previous => previous.filter(room => !deletedIds.has(room.id)))
    setUnreadCounts(previous => Object.fromEntries(Object.entries(previous).filter(([roomId]) => !deletedIds.has(roomId))))
    if (activeRef.current && deletedIds.has(activeRef.current.id)) {
      activeRef.current = null
      setActiveRoom(null)
      setMessages([])
      setNextCursor(null)
      setShowSidebar(true)
      setShowContactProfile(false)
    }
  }

  const deleteRoom = async (room: Room) => {
    setConfirmAction({
      title: room.isGroup ? 'Leave this group?' : 'Delete this chat?',
      message: room.isGroup
        ? 'You will leave this group and it will be removed from your chat list.'
        : 'This chat will be removed from your list. Other members keep their chat history.',
      confirmLabel: room.isGroup ? 'Leave group' : 'Delete chat',
      run: async () => {
        try {
          await chatService.deleteRoom(room.id)
          forgetDeletedRooms([room.id])
        } catch (error) {
          showCallNotice(error instanceof Error ? error.message : 'Unable to delete this chat.')
        }
      },
    })
  }

  const deleteRooms = (selectedRooms: Room[]) => {
    if (selectedRooms.length === 0) return
    setConfirmAction({
      title: `Delete ${selectedRooms.length} chats?`,
      message: 'Selected groups will be left. Direct chats will be removed from your list; other members keep their history.',
      confirmLabel: `Delete ${selectedRooms.length}`,
      run: async () => {
        const results = await Promise.allSettled(selectedRooms.map(room => chatService.deleteRoom(room.id)))
        const removedRoomIds = selectedRooms.filter((_, index) => results[index].status === 'fulfilled').map(room => room.id)
        forgetDeletedRooms(removedRoomIds)
        if (results.some(result => result.status === 'rejected')) {
          showCallNotice('Some chats could not be deleted. Please try again.')
        }
      },
    })
  }

  const clearRoomMessages = async (room: Room) => {
    setConfirmAction({
      title: 'Clear chat messages?',
      message: 'This removes the messages from your view. Other room members keep their history.',
      confirmLabel: 'Clear messages',
      run: async () => {
        try {
          await chatService.clearRoomMessages(room.id)
          setMessages([])
          setNextCursor(null)
          setRooms(previous => previous.map(candidate => candidate.id === room.id ? { ...candidate, messages: [] } : candidate))
        } catch (error) {
          showCallNotice(error instanceof Error ? error.message : 'Unable to clear chat messages.')
        }
      },
    })
  }

  const clearActiveRoomMessages = async () => {
    const room = activeRef.current
    if (room) await clearRoomMessages(room)
  }

  const deleteMessage = async (message: Message) => {
    if (message.senderId !== meRef.current?.id) return
    setConfirmAction({
      title: 'Delete this message?',
      message: 'This message will be deleted for everyone in the room.',
      confirmLabel: 'Delete message',
      run: async () => {
        try {
          await chatService.deleteMessage(message.id)
          setMessages(previous => previous.filter(candidate => candidate.id !== message.id))
          setRooms(previous => previous.map(room => room.id === message.roomId
            ? { ...room, messages: room.messages.filter(candidate => candidate.id !== message.id) }
            : room))
        } catch (error) {
          showCallNotice(error instanceof Error ? error.message : 'Unable to delete this message.')
        }
      },
    })
  }

  const removeContact = async () => {
    const contactId = curOther?.id
    if (!contactId) return
    const directRooms = rooms.filter(room => !room.isGroup && room.members.some(member => member.userId === contactId))
    const contactName = curOther.name
    setConfirmAction({
      title: `Remove ${contactName}?`,
      message: 'This removes your membership from all direct chats with this person. Group chats and their history are not affected.',
      confirmLabel: 'Remove contact',
      run: async () => {
        setShowContactProfile(false)
        const results = await Promise.allSettled(directRooms.map(room => chatService.deleteRoom(room.id)))
        const removedRoomIds = directRooms.filter((_, index) => results[index].status === 'fulfilled').map(room => room.id)
        forgetDeletedRooms(removedRoomIds)
        if (results.some(result => result.status === 'rejected')) {
          showCallNotice('Some direct chats could not be removed. Please try again.')
        }
      },
    })
  }

  const send = async (customFileUrl?: string, customFileType?: string) => {
    if (customFileUrl) {
      if (!activeRoom) return
      if (!socketService.isConnected()) {
        setSendError('Realtime connection is not ready. Please try again.')
        return
      }
      setSending(true)
      setSendError(null)
      try {
        const messageKey = `${activeRoom.id}|${me?.id ?? ''}||${customFileUrl}`
        const optimisticId = `pending-${Date.now()}`
        pendingMessages.current.set(messageKey, optimisticId)
        socketService.sendMessage(activeRoom.id, null, customFileUrl, customFileType ?? null)
        if (me) {
          setMessages(prev => [...prev, {
            id: optimisticId, roomId: activeRoom.id, senderId: me.id,
            text: null, fileUrl: customFileUrl, fileType: customFileType ?? null,
            createdAt: new Date().toISOString(), status: 'sent' as const, sender: me,
          }])
        }
      } catch { }
      setSending(false)
      return
    }

    if (!activeRoom || (!inputText.trim() && !attachedFile)) return
    if (!socketService.isConnected()) {
      setSendError('Realtime connection is not ready. Please try again.')
      return
    }
    setSending(true)
    const text = inputText.trim()
    setSendError(null)

    try {
      let finalFileUrl: string | null = null
      let finalFileType: string | null = null

      if (attachedFile) {
        const uploaded = await chatService.uploadFile(attachedFile.file)
        finalFileUrl = uploaded.fileUrl
        finalFileType = uploaded.fileType
      }

      const messageKey = `${activeRoom.id}|${me?.id ?? ''}|${text}|${finalFileUrl ?? ''}`
      const optimisticId = `pending-${Date.now()}`
      pendingMessages.current.set(messageKey, optimisticId)
      socketService.sendMessage(activeRoom.id, text || null, finalFileUrl, finalFileType)

      if (me) {
        animateMessage(optimisticId)
        setMessages(prev => [...prev, {
          id: optimisticId, roomId: activeRoom.id, senderId: me.id,
          text: text || null, fileUrl: finalFileUrl, fileType: finalFileType,
          createdAt: new Date().toISOString(), status: 'sent' as const, sender: me,
        }])
      }
      setInputText('')
      setAttachedFile(null)
      if (inputRef.current) { inputRef.current.style.height = 'auto' }
      setTimeout(() => scrollToBottom(true), 50)
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || 'document'
    })
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
    sessionStorage.removeItem('activeRoomId') // cleanup just in case
    window.location.href = '/login'
  }

  const openProfile = () => {
    if (me) {
      setEditName(me.name)
      setEditAvatarUrl(me.avatarUrl || '')
      setEditPhone(me.phone || me.phoneNumber || '')
      setEditBio(me.bio || '')
      // Desktop (md+): show modal. Mobile: show full-screen view.
      if (window.innerWidth >= 768) {
        setShowProfile(true)
      } else {
        setActiveNavTab('profile')
        setSelectedCallRoom(null)
        setShowSidebar(false)
      }
    }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const updated = await chatService.updateMyProfile({
        name: editName,
        avatarUrl: editAvatarUrl,
        phone: editPhone,
        phoneNumber: editPhone,
        bio: editBio
      })
      setMe(updated)
      setShowProfile(false)
      // If on mobile profile view, go back to chats
      if (activeNavTab === 'profile') {
        setActiveNavTab('chats')
        setShowSidebar(true)
      }
    } catch { }
    setSavingProfile(false)
  }

  const updateChatWallpaper = async (wallpaper: string | null) => {
    const previousWallpaper = chatWallpaper
    setChatWallpaper(wallpaper)
    if (wallpaper) localStorage.setItem('chat_wallpaper', wallpaper)
    else localStorage.removeItem('chat_wallpaper')
    try {
      await chatService.updateMyPreferences({ chatWallpaper: wallpaper })
    } catch (error) {
      setChatWallpaper(previousWallpaper)
      if (previousWallpaper) localStorage.setItem('chat_wallpaper', previousWallpaper)
      else localStorage.removeItem('chat_wallpaper')
      console.error('Unable to save chat wallpaper preference', error)
    }
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
      const updated = await chatService.updateMyProfile({
        name: editName,
        avatarUrl: res.fileUrl,
        phone: editPhone,
        phoneNumber: editPhone,
        bio: editBio
      })
      setMe(updated)
    } catch { }
    setUploadingAvatar(false)
    if (cropSrc) { URL.revokeObjectURL(cropSrc); setCropSrc(null) }
  }

  const filteredRooms = rooms.filter(r => {
    if (filter === 'direct' && r.isGroup) return false
    if (filter === 'groups' && !r.isGroup) return false
    if (sidebarQ.trim() && me) return roomName(r, me.id).toLowerCase().includes(sidebarQ.toLowerCase())
    return true
  })

  const curOther = activeRoom && me ? otherUser(activeRoom, me.id) : undefined
  const curName = activeRoom && me ? roomName(activeRoom, me.id) : ''
  const curAvatar = activeRoom && me ? roomAvatar(activeRoom, me.id) : null
  const callRoom = callController.activeCall
    ? rooms.find(room => room.id === callController.activeCall?.roomId)
    : undefined
  const callName = callRoom && me ? roomName(callRoom, me.id) : 'Synexa call'
  const callAvatar = callRoom && me ? roomAvatar(callRoom, me.id) : null
  const startCall = (roomId: string, callType: 'audio' | 'video') => {
    const room = rooms.find(candidate => candidate.id === roomId)
    if (!room || room.isGroup) return
    void callController.startCall(roomId, callType).catch(error => {
      setToast({ message: error instanceof Error ? error.message : 'Unable to start call.', id: String(Date.now()) })
    })
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans bg-gray-50 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-300 ${!showSidebar && activeRoom ? 'pb-0' : 'pb-[56px] md:pb-0'}`}>
      
      {/* Left Navigation Bar */}
      <SidebarNav
        me={me}
        activeNavTab={activeNavTab}
        hideMobileNav={!showSidebar && !!activeRoom && activeNavTab === 'chats'}
        onChatClick={() => {
          setActiveNavTab('chats')
          setSelectedCallRoom(null)
          setAiChatOpen(false)
          setShowSidebar(true)
        }}
        onCallsClick={() => {
          setModal(false)
          setActiveNavTab('calls')
          setSelectedCallRoom(null)
          setAiChatOpen(false)
          setShowSidebar(false)
        }}
        onCalendarClick={() => {
          setModal(false)
          setActiveNavTab('calendar')
          setSelectedCallRoom(null)
          setAiChatOpen(false)
          setShowSidebar(false)
        }}
        onSearchClick={() => {
          setModal(true)
        }}
        onSettingsClick={() => {
          setModal(false)
          setActiveNavTab('settings')
          setSelectedCallRoom(null)
          setAiChatOpen(false)
          setShowSidebar(false)
        }}
        onProfileClick={openProfile}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      {/* Chat Sidebar Area */}
      <div className={`shrink-0 w-full md:w-[360px] h-full transition-transform duration-250 ease-in-out z-10 ${
        (activeNavTab === 'calls' && !selectedCallRoom) || activeNavTab === 'calendar' || activeNavTab === 'settings'
          ? 'hidden'
          : activeNavTab === 'profile'
            ? 'hidden md:flex'
            : !showSidebar
              ? 'hidden md:flex absolute inset-0 -translate-x-full pointer-events-none md:static md:translate-x-0 md:pointer-events-auto'
              : 'flex absolute inset-0 md:static md:inset-auto z-30'
      }`}>
        
        <ChatSidebar
          me={me}
          rooms={rooms}
          filteredRooms={filteredRooms}
          activeRoom={activeRoom}
          unreadCounts={unreadCounts}
          sidebarQ={sidebarQ}
          setSidebarQ={setSidebarQ}
          filter={filter}
          setFilter={setFilter}
          setModal={setModal}
          openRoom={openRoom}
          onOpenAIChat={() => {
            setActiveNavTab('chats')
            setSelectedCallRoom(null)
            setAiChatOpen(true)
            setShowSidebar(false)
          }}
          aiChatOpen={aiChatOpen}
          onDeleteRooms={deleteRooms}
        />
      </div>

      {modal && me && (
        <NewChatModal myId={me.id} onClose={() => setModal(false)} onCreated={onRoomCreated} />
      )}

      {/* Main Chat / Calls / Settings / Calendar / Profile View Feed */}
      <div className="flex flex-1 h-full min-w-0 relative overflow-hidden bg-white dark:bg-[#090d16] shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        {activeNavTab === 'profile' ? (
          /* Mobile only: full-screen profile view (desktop uses modal) */
          <ProfileView
            me={me}
            editName={editName}
            setEditName={setEditName}
            editAvatarUrl={editAvatarUrl}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            editBio={editBio}
            setEditBio={setEditBio}
            savingProfile={savingProfile}
            saveProfile={saveProfile}
            profileFileRef={profileFileRef}
            handleProfileAvatarUpload={handleProfileAvatarUpload}
            uploadingAvatar={uploadingAvatar}
            onLogout={() => setShowLogoutConfirm(true)}
          />
        ) : activeNavTab === 'settings' ? (
          <SettingsView
            me={me}
            editName={editName}
            setEditName={setEditName}
            handleSaveProfile={saveProfile}
            savingProfile={savingProfile}
            profileFileRef={profileFileRef}
            handleProfileAvatarUpload={handleProfileAvatarUpload}
            uploadingAvatar={uploadingAvatar}
          />
        ) : activeNavTab === 'calendar' ? (
          <CalendarView
            me={me}
            rooms={rooms}
          />
        ) : activeNavTab === 'calls' ? (
          <CallsView
            me={me}
            rooms={rooms}
            filterRoom={selectedCallRoom}
            onBack={() => {
              setActiveNavTab('chats')
              setSelectedCallRoom(null)
              setShowSidebar(true)
            }}
            onStartCall={startCall}
            onOpenChat={room => {
              openRoom(room)
            }}
          />
        ) : (
          <ChatArea
            activeRoom={activeRoom}
            me={me}
            setShowSidebar={setShowSidebar}
            curName={curName}
            curAvatar={curAvatar}
            curOther={curOther}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            setShowContactProfile={setShowContactProfile}
            feedRef={feedRef}
            newMessageDividerRef={newMessageDividerRef}
            handleScroll={handleScroll}
            loadingMore={loadingMore}
            nextCursor={nextCursor}
            loadMore={loadMore}
            loadingMsgs={loadingMsgs}
            messages={messages}
            animatedMessageId={animatedMessageId}
            onDeleteMessage={message => { void deleteMessage(message) }}
            onClearMessages={() => { void clearActiveRoomMessages() }}
            onDeleteRoom={() => { if (activeRoom) void deleteRoom(activeRoom) }}
            typingUsers={typingUsers}
            newMessageAnchorId={newMessageAnchorId}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            emojiPickerRef={emojiPickerRef}
            showAttachMenu={showAttachMenu}
            setShowAttachMenu={setShowAttachMenu}
            attachMenuRef={attachMenuRef}
            imgFileRef={imgFileRef}
            docFileRef={docFileRef}
            fileRef={fileRef}
            handleFile={handleFile}
            inputText={inputText}
            setInputText={setInputText}
            inputRef={inputRef}
            handleInputChange={handleInputChange}
            handleKey={handleKey}
            sendError={sendError}
            sending={sending}
            send={send}
            attachedFile={attachedFile}
            onRemoveAttachment={() => setAttachedFile(null)}
            chatWallpaper={chatWallpaper}
            onWallpaperChange={wallpaper => { void updateChatWallpaper(wallpaper) }}
            onStartCall={startCall}
            callNotifications={activeRoom ? missedCallNotifications.filter(notification => notification.roomId === activeRoom.id) : []}
            onMarkCallNotificationRead={notificationId => { void markCallNotificationRead(notificationId) }}
            onViewCallHistory={room => {
              setSelectedCallRoom(room)
              setActiveNavTab('calls')
            }}
          />
        )}
        <div className={`absolute inset-0 z-20 ${aiChatOpen ? 'flex' : 'hidden'}`}>
          <AIChatView />
        </div>
      </div>

      {toast && (
        <button
          onClick={() => {
            if (toastTimer.current) clearTimeout(toastTimer.current)
            setToast(null)
            if (toast.notificationId) {
              void markCallNotificationRead(toast.notificationId)
            }
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-[#1f2937] text-white px-5 py-3 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.25)] text-sm font-medium animate-[toastIn_0.3s_ease-out] max-w-[min(420px,calc(100vw-2rem))] text-left cursor-pointer border-0 flex items-center gap-4"
          aria-label={toast.notificationId ? 'Mark notification as read' : 'Dismiss call message'}
        >
          <span>{toast.message}</span>
          <span className="shrink-0 text-xs text-red-200">{toast.notificationId ? 'Mark read' : 'Dismiss'}</span>
        </button>
      )}

      {/* Desktop only: Profile Modal */}
      <ProfileSidebar
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        me={me}
        editName={editName}
        setEditName={setEditName}
        editAvatarUrl={editAvatarUrl}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editBio={editBio}
        setEditBio={setEditBio}
        savingProfile={savingProfile}
        saveProfile={saveProfile}
        profileFileRef={profileFileRef}
        handleProfileAvatarUpload={handleProfileAvatarUpload}
        uploadingAvatar={uploadingAvatar}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <ContactInfoSidebar
        showContactProfile={showContactProfile}
        setShowContactProfile={setShowContactProfile}
        activeRoom={activeRoom}
        curName={curName}
        curAvatar={curAvatar}
        curOther={curOther}
        onRemoveContact={() => { void removeContact() }}
        onViewCallHistory={() => {
          if (activeRoom) {
            setSelectedCallRoom(activeRoom)
            setActiveNavTab('calls')
          }
        }}
      />

      <CropModal
        isOpen={cropModalOpen}
        cropSrc={cropSrc}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        setCroppedAreaPixels={setCroppedAreaPixels}
        onClose={() => { setCropModalOpen(false); if (cropSrc) URL.revokeObjectURL(cropSrc); setCropSrc(null) }}
        onSave={uploadCroppedImage}
      />

      <LogoutConfirm
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onLogout={logout}
      />

      <ConfirmActionModal
        show={confirmAction !== null}
        title={confirmAction?.title ?? ''}
        message={confirmAction?.message ?? ''}
        confirmLabel={confirmAction?.confirmLabel ?? 'Confirm'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          const action = confirmAction
          if (!action) return
          await action.run()
          setConfirmAction(null)
        }}
      />

      {callController.activeCall && (
        <CallOverlay
          call={callController.activeCall}
          curName={callName}
          curAvatar={callAvatar}
          localStream={callController.localStream}
          remoteStream={callController.remoteStream}
          isMuted={callController.isMuted}
          isVideoOff={callController.isVideoOff}
          onAccept={() => { void callController.acceptCall() }}
          onReject={callController.rejectCall}
          onToggleMute={callController.toggleMute}
          onToggleVideo={callController.toggleVideo}
          onEndCall={callController.endCall}
        />
      )}
    </div>
  )
}
