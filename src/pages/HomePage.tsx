import React, { useState, useEffect, useRef } from 'react'
import type { Area } from 'react-easy-crop'
import { chatService } from '../services/chatService'
import { socketService } from '../services/socketService'
import type { Room, Message, User } from '../types/chat'
import { sortRooms, roomName, otherUser, roomAvatar } from '../utils/chatHelpers'
import { NewChatModal } from '../components/chat/NewChatModal'
import { ChatSidebar } from '../components/chat/ChatSidebar'
import { ChatArea } from '../components/chat/ChatArea'
import { ProfileSidebar } from '../components/profile/ProfileSidebar'
import { ContactInfoSidebar } from '../components/profile/ContactInfoSidebar'
import { CropModal } from '../components/profile/CropModal'
import { LogoutConfirm } from '../components/common/LogoutConfirm'
import { SidebarNav } from '../components/layout/SidebarNav'
import { SettingsModal } from '../components/settings/SettingsModal'
import { CalendarModal } from '../components/calendar/CalendarModal'
import { CallsModal } from '../components/calls/CallsModal'

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

  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCalls, setShowCalls] = useState(false)
  const [activeNavTab, setActiveNavTab] = useState<'chats' | 'calls' | 'calendar'>('chats')
  const [editName, setEditName] = useState('')

  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({})
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [showNewMsgPill, setShowNewMsgPill] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const attachMenuRef = useRef<HTMLDivElement>(null)
  const imgFileRef = useRef<HTMLInputElement>(null)
  const docFileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<{ message: string; id: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const feedRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<Room | null>(null)
  const meRef = useRef<User | null>(null)
  const pendingMessages = useRef(new Map<string, string>())

  useEffect(() => { activeRef.current = activeRoom }, [activeRoom])
  useEffect(() => { meRef.current = me }, [me])

  const openRoom = async (room: Room) => {
    if (activeRef.current?.id === room.id) {
      setShowSidebar(false)
      return
    }
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
      setMessages(msgs.slice().reverse())
      setNextCursor(cur)

      const unseenIds = msgs.filter(m => m.senderId !== me?.id && m.status !== 'seen').map(m => m.id)
      if (unseenIds.length > 0) {
        chatService.markSeen(room.id, unseenIds).catch(() => { })
        socketService.emitSeen(room.id, unseenIds)
      }
    } catch { /**/ }
    setLoadingMsgs(false)
    setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight }), 60)
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
          setShowNewMsgPill(true)
          setTimeout(() => setShowNewMsgPill(false), 2500)
        } else {
          socketService.emitDelivered(msg.roomId, [msg.id])
          setUnreadCounts(prev => ({ ...prev, [msg.roomId]: (prev[msg.roomId] || 0) + 1 }))
        }
      }

      if (activeRef.current?.id === msg.roomId) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 50)
      }
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

    const handleNotification = (n: import('../types/chat').Notification) => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast({ message: n.message, id: n.id })
      toastTimer.current = setTimeout(() => setToast(null), 4000)
    }

    socketService.onNewMessage(handleNewMessage)
    socketService.onRoomUpdated(handleRoomUpdated)
    socketService.onDelivered(handleDelivered)
    socketService.onSeen(handleSeen)
    socketService.onTypingStart(handleTypingStart)
    socketService.onTypingStop(handleTypingStop)
    socketService.onNotification(handleNotification)

    return () => {
      socketService.offNewMessage(handleNewMessage)
      socketService.offRoomUpdated(handleRoomUpdated)
      socketService.offDelivered(handleDelivered)
      socketService.offSeen(handleSeen)
      socketService.offTypingStart(handleTypingStart)
      socketService.offTypingStop(handleTypingStop)
      socketService.offNotification(handleNotification)
    }
  }, [])

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

  const send = async (fileUrl?: string, fileType?: string) => {
    if (!activeRoom || (!inputText.trim() && !fileUrl)) return
    if (!socketService.isConnected()) {
      setSendError('Realtime connection is not ready. Please try again.')
      return
    }
    setSending(true)
    const text = inputText.trim()
    setSendError(null)
    try {
      const messageKey = `${activeRoom.id}|${me?.id ?? ''}|${text}|${fileUrl ?? ''}`
      const optimisticId = `pending-${Date.now()}`
      pendingMessages.current.set(messageKey, optimisticId)
      socketService.sendMessage(activeRoom.id, text || null, fileUrl ?? null, fileType ?? null)

      if (me) {
        setMessages(prev => [...prev, {
          id: optimisticId, roomId: activeRoom.id, senderId: me.id,
          text: text || null, fileUrl: fileUrl ?? null, fileType: fileType ?? null,
          createdAt: new Date().toISOString(), status: 'sent' as const, sender: me,
        }])
      }
      setInputText('')
      if (inputRef.current) { inputRef.current.style.height = 'auto' }
      setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 50)
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const r = await chatService.uploadFile(file); await send(r.fileUrl, r.fileType) }
    catch { /**/ }
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
      setShowProfile(true)
    }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const updated = await chatService.updateMyProfile({ name: editName, avatarUrl: editAvatarUrl })
      setMe(updated)
      setShowProfile(false)
    } catch { }
    setSavingProfile(false)
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
      const updated = await chatService.updateMyProfile({ name: editName, avatarUrl: res.fileUrl })
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

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-gray-50 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-300">
      
      {/* Left Navigation Bar */}
      <SidebarNav
        me={me}
        activeNavTab={activeNavTab}
        onChatClick={() => {
          setActiveNavTab('chats')
          setShowSidebar(true)
        }}
        onCallsClick={() => {
          setShowCalls(true)
        }}
        onCalendarClick={() => {
          setShowCalendar(true)
        }}
        onSearchClick={() => {
          setModal(true)
        }}
        onSettingsClick={() => setShowSettings(true)}
        onProfileClick={openProfile}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      {/* Chat Sidebar Area */}
      <div className={`flex shrink-0 w-full md:w-[360px] h-full relative transition-transform duration-250 ease-in-out z-10 ${!showSidebar ? 'absolute inset-0 -translate-x-full pointer-events-none md:static md:translate-x-0 md:pointer-events-auto' : ''}`}>
        
        <ChatSidebar
          me={me}
          filteredRooms={filteredRooms}
          activeRoom={activeRoom}
          unreadCounts={unreadCounts}
          sidebarQ={sidebarQ}
          setSidebarQ={setSidebarQ}
          filter={filter}
          setFilter={setFilter}
          setModal={setModal}
          openRoom={openRoom}
        />

        {modal && me && (
          <NewChatModal myId={me.id} onClose={() => setModal(false)} onCreated={onRoomCreated} />
        )}
      </div>

      {/* Main Chat Feed */}
      <div className="flex flex-1 h-full min-w-0 relative overflow-hidden bg-white dark:bg-[#090d16] shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
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
          handleScroll={handleScroll}
          loadingMore={loadingMore}
          nextCursor={nextCursor}
          loadMore={loadMore}
          loadingMsgs={loadingMsgs}
          messages={messages}
          typingUsers={typingUsers}
          showNewMsgPill={showNewMsgPill}
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
        />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-[#1f2937] text-white px-6 py-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] text-[0.9rem] font-medium animate-[toastIn_0.3s_ease-out] max-w-[360px] text-center pointer-events-none">
          🔔 {toast.message}
        </div>
      )}

      <ProfileSidebar
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        me={me}
        editName={editName}
        setEditName={setEditName}
        editAvatarUrl={editAvatarUrl}
        savingProfile={savingProfile}
        saveProfile={saveProfile}
        profileFileRef={profileFileRef}
        handleProfileAvatarUpload={handleProfileAvatarUpload}
        uploadingAvatar={uploadingAvatar}
      />

      <ContactInfoSidebar
        showContactProfile={showContactProfile}
        setShowContactProfile={setShowContactProfile}
        activeRoom={activeRoom}
        curName={curName}
        curAvatar={curAvatar}
        curOther={curOther}
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

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        me={me}
        editName={editName}
        setEditName={setEditName}
        handleSaveProfile={saveProfile}
        savingProfile={savingProfile}
        profileFileRef={profileFileRef}
        handleProfileAvatarUpload={handleProfileAvatarUpload}
        uploadingAvatar={uploadingAvatar}
      />

      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        me={me}
        rooms={rooms}
      />

      <CallsModal
        isOpen={showCalls}
        onClose={() => setShowCalls(false)}
        me={me}
        rooms={rooms}
      />
    </div>
  )
}
