import React from 'react'
import EmojiPicker from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import { PhoneMissed, History, PhoneCall } from 'lucide-react'
import { ContactRound, Eraser, Image as ImageIcon, ImageOff, Trash2 } from 'lucide-react'
import type { Room, Message, User, Notification } from '../../types/chat'
import { IcoBack, IcoGroup, IcoMoreVert, IcoEmoji, IcoAttach, IcoSend } from '../common/Icons'
import { IconBtn } from '../common/IconBtn'
import { Avatar } from '../common/Avatar'
import { WelcomeScreen } from './WelcomeScreen'
import { Bubble } from './Bubble'
import { chatService } from '../../services/chatService'
import { seedColor, fmtLastSeen, fmtDateLabel } from '../../utils/chatHelpers'

// Move to helpers if preferred
function groupByDate(msgs: Message[]) {
  const g: { date: string; msgs: Message[] }[] = []
  for (const m of msgs) {
    const l = fmtDateLabel(m.createdAt)
    const last = g[g.length - 1]
    if (!last || last.date !== l) g.push({ date: l, msgs: [m] })
    else last.msgs.push(m)
  }
  return g
}

export function ChatArea({
  activeRoom,
  me,
  setShowSidebar,
  curName,
  curAvatar,
  curOther,
  menuOpen,
  setMenuOpen,
  setShowContactProfile,
  feedRef,
  newMessageDividerRef,
  handleScroll,
  loadingMore,
  nextCursor,
  loadMore,
  loadingMsgs,
  messages,
  animatedMessageId,
  onDeleteMessage,
  onClearMessages,
  onDeleteRoom,
  typingUsers,
  newMessageAnchorId,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiPickerRef,
  showAttachMenu,
  setShowAttachMenu,
  attachMenuRef,
  imgFileRef,
  docFileRef,
  fileRef,
  handleFile,
  inputText,
  setInputText,
  inputRef,
  handleInputChange,
  handleKey,
  sendError,
  sending,
  send,
  attachedFile,
  onRemoveAttachment,
  chatWallpaper,
  onWallpaperChange,
  onStartCall,
  callNotifications,
  onMarkCallNotificationRead,
  onViewCallHistory,
}: {
  activeRoom: Room | null
  me: User | null
  setShowSidebar: (show: boolean) => void
  curName: string
  curAvatar: string | null
  curOther: User | undefined
  menuOpen: boolean
  setMenuOpen: (o: boolean) => void
  setShowContactProfile: (s: boolean) => void
  feedRef: React.RefObject<HTMLDivElement | null>
  newMessageDividerRef: React.RefObject<HTMLDivElement | null>
  handleScroll: () => void
  loadingMore: boolean
  nextCursor: string | null
  loadMore: () => void
  loadingMsgs: boolean
  messages: Message[]
  animatedMessageId: string | null
  onDeleteMessage: (message: Message) => void
  onClearMessages: () => void
  onDeleteRoom: () => void
  typingUsers: Record<string, string[]>
  newMessageAnchorId: string | null
  showEmojiPicker: boolean
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>
  emojiPickerRef: React.RefObject<HTMLDivElement | null>
  showAttachMenu: boolean
  setShowAttachMenu: React.Dispatch<React.SetStateAction<boolean>>
  attachMenuRef: React.RefObject<HTMLDivElement | null>
  imgFileRef: React.RefObject<HTMLInputElement | null>
  docFileRef: React.RefObject<HTMLInputElement | null>
  fileRef: React.RefObject<HTMLInputElement | null>
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputText: string
  setInputText: React.Dispatch<React.SetStateAction<string>>
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  sendError: string | null
  sending: boolean
  send: (url?: string, type?: string) => void
  attachedFile?: { name: string; size: number; type: string } | null
  onRemoveAttachment?: () => void
  chatWallpaper: string | null
  onWallpaperChange: (wallpaper: string | null) => void
  onStartCall: (roomId: string, callType: 'audio' | 'video') => void
  callNotifications: Notification[]
  onMarkCallNotificationRead: (notificationId: string) => void
  onViewCallHistory?: (room: Room) => void
}) {
  const wallpaperInputRef = React.useRef<HTMLInputElement>(null)
  const [callDropdownOpen, setCallDropdownOpen] = React.useState(false)

  const handleWallpaperChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploaded = await chatService.uploadFile(file)
      onWallpaperChange(uploaded.fileUrl)
    } catch (error) {
      console.error('Unable to upload chat wallpaper', error)
    }
    e.target.value = ''
    setMenuOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#0b0f19] font-sans transition-colors duration-300">
      {!activeRoom ? <WelcomeScreen /> : (
        <>
          {/* room header */}
          <div className="bg-[#fafbfc] dark:bg-[#0f172a] px-3 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 border-b border-gray-200 dark:border-slate-800 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <button className="md:hidden flex items-center bg-transparent border-none cursor-pointer pr-1" onClick={() => setShowSidebar(true)}>
              <IcoBack color="#9ca3af" />
            </button>
            {activeRoom.isGroup ? (
              <div className="w-[46px] h-[46px] rounded-full shrink-0 flex items-center justify-center text-white" style={{ background: seedColor(curName) }}>
                <IcoGroup />
              </div>
            ) : (
              <Avatar name={curName} src={curAvatar} size={46} />
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={() => setShowContactProfile(true)}>
              <div className="font-bold text-[1.1rem] text-[#1f2937] dark:text-slate-100 tracking-[-0.01em]">{curName}</div>
              <div className="text-[0.8rem] font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                {(typingUsers[activeRoom.id] ?? []).length > 0 ? (
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold italic">typing...</span>
                ) : (
                  <>
                    {!activeRoom.isGroup && curOther?.isOnline && (
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    )}
                    {activeRoom.isGroup
                      ? `${activeRoom.members.length} members`
                      : curOther?.isOnline ? 'Online'
                        : curOther?.lastSeenAt ? fmtLastSeen(curOther.lastSeenAt)
                          : 'Offline'}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Desktop calling buttons */}
              <div className={`hidden sm:flex items-center gap-2 ${activeRoom.isGroup ? 'opacity-40' : ''}`}>
                <button 
                  onClick={() => onStartCall(activeRoom.id, 'audio')}
                  disabled={activeRoom.isGroup}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#2563eb] dark:hover:text-blue-400 border-none cursor-pointer transition-colors disabled:cursor-not-allowed"
                  title="Voice Call"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => onStartCall(activeRoom.id, 'video')}
                  disabled={activeRoom.isGroup}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#2563eb] dark:hover:text-blue-400 border-none cursor-pointer transition-colors disabled:cursor-not-allowed"
                  title="Video Call"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </button>
                <button
                  onClick={() => onViewCallHistory?.(activeRoom)}
                  disabled={activeRoom.isGroup}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#2563eb] dark:hover:text-blue-400 border-none cursor-pointer transition-colors disabled:cursor-not-allowed"
                  title="Call History"
                >
                  <History size={18} />
                </button>
              </div>

              {/* Mobile Phone Calling Button with Voice/Video Dropdown */}
              {!activeRoom.isGroup && (
                <div className="relative sm:hidden">
                  {callDropdownOpen && (
                    <div className="fixed inset-0 z-[199]" onClick={() => setCallDropdownOpen(false)} />
                  )}
                  <button
                    type="button"
                    onClick={() => setCallDropdownOpen(!callDropdownOpen)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#2563eb] dark:hover:text-blue-400 border-none cursor-pointer transition-colors"
                    title="Start Call"
                    aria-label="Start Call"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </button>

                  {callDropdownOpen && (
                    <div className="absolute right-0 top-11 z-[200] w-44 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-800 animate-[fadeIn_0.15s_ease-out]">
                      <button
                        type="button"
                        onClick={() => {
                          setCallDropdownOpen(false)
                          onStartCall(activeRoom.id, 'audio')
                        }}
                        className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-[#2563eb] dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-blue-400 cursor-pointer"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Voice Call
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCallDropdownOpen(false)
                          onStartCall(activeRoom.id, 'video')
                        }}
                        className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-[#2563eb] dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-blue-400 cursor-pointer"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        Video Call
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative">
                {menuOpen && <div className="fixed inset-0 z-[199]" onClick={() => setMenuOpen(false)} />}
                <IconBtn onClick={() => setMenuOpen(!menuOpen)} title="Options">
                  <IcoMoreVert />
                </IconBtn>

                {menuOpen && (
                  <div role="menu" className="absolute right-0 top-11 z-[200] w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-800">
                    <button type="button" role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setShowContactProfile(true)
                      }}
                      className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ContactRound size={17} className="text-gray-500 dark:text-slate-400" /> Info
                    </button>
                    {!activeRoom.isGroup && (
                      <button type="button" role="menuitem"
                        onClick={() => {
                          setMenuOpen(false)
                          onViewCallHistory?.(activeRoom)
                        }}
                        className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <PhoneCall size={17} className="text-gray-500 dark:text-slate-400" /> Call History
                      </button>
                    )}
                    <button type="button" role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        wallpaperInputRef.current?.click()
                      }}
                      className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ImageIcon size={17} className="text-gray-500 dark:text-slate-400" /> Wallpaper
                    </button>
                    {chatWallpaper && (
                      <button type="button" role="menuitem"
                        onClick={() => {
                          setMenuOpen(false)
                          onWallpaperChange(null)
                        }}
                        className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <ImageOff size={17} className="text-gray-500 dark:text-slate-400" /> Reset bg
                      </button>
                    )}
                    <button type="button" role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        onClearMessages()
                      }}
                      className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Eraser size={17} className="text-gray-500 dark:text-slate-400" /> Clear
                    </button>
                    <div className="my-1 border-t border-gray-100 dark:border-slate-700" />
                    <button type="button" role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        onDeleteRoom()
                      }}
                      className="flex h-10 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={17} /> {activeRoom.isGroup ? 'Leave group' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* messages */}
          <input type="file" accept="image/*" ref={wallpaperInputRef} className="hidden" onChange={handleWallpaperChange} />
          
          <div 
            ref={feedRef as React.RefObject<HTMLDivElement>} 
            onScroll={handleScroll} 
            className="msg-feed flex-1 overflow-y-auto bg-white dark:bg-[#0b0f19] py-4 px-[3%] md:px-[5%] relative" 
            style={{ 
              scrollBehavior: 'smooth',
              ...(chatWallpaper ? {
                backgroundImage: `url(${chatWallpaper})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
              } : {})
            }}
          >
            {chatWallpaper && <div className="absolute inset-0 bg-white/40 dark:bg-black/60 pointer-events-none -z-10" />}
            {/* Notice header in chat */}
            <div className="flex justify-center mb-6 mt-2">
              <div className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-300 font-medium text-[0.78rem] px-4 py-2 rounded-xl max-w-[90%] text-center flex gap-2 items-center border border-gray-100 dark:border-slate-700/60">
                <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
                Messages are end-to-end encrypted. No one outside of this chat can read or listen to them.
              </div>
            </div>

            {callNotifications.length > 0 && (
              <section aria-label="Missed call notifications" className="max-w-2xl mx-auto mb-5 divide-y divide-red-100 dark:divide-red-900/40 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/30">
                {callNotifications.map(notification => (
                  <div key={notification.id} className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-center" aria-hidden="true">
                      <PhoneMissed size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-sm font-semibold text-red-900 dark:text-red-200">{notification.message}</p>
                      <time dateTime={notification.createdAt} className="mt-1 block text-xs text-red-700/80 dark:text-red-300/80">
                        {new Date(notification.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </time>
                    </div>
                    <button
                      onClick={() => onMarkCallNotificationRead(notification.id)}
                      className="min-h-10 w-full shrink-0 rounded-lg border border-red-200 bg-white/90 px-4 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-white cursor-pointer dark:border-red-800 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950 sm:w-auto"
                    >
                      Mark read
                    </button>
                  </div>
                ))}
              </section>
            )}
            
            {loadingMore && (
              <div className="text-center p-2.5 text-gray-400 font-medium text-[0.85rem]">
                Loading older messages…
              </div>
            )}
            
            {nextCursor && !loadingMore && (
              <div className="text-center mb-4">
                <button onClick={loadMore} className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-200 px-5 py-1.5 rounded-full cursor-pointer text-[0.8rem] font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  Load older messages
                </button>
              </div>
            )}

            {loadingMsgs ? (
              <div className="py-3">
                <style>{`
                  @keyframes yt-shimmer {
                    0%   { background-position: -800px 0; }
                    100% { background-position:  800px 0; }
                  }
                  .yt-skel {
                    background: #f1f5f9;
                    background-image: linear-gradient(90deg, #f1f5f9 0px, #e2e8f0 40%, #f1f5f9 80%);
                    background-size: 800px 100%;
                    animation: yt-shimmer 1.3s infinite ease-in-out;
                    border-radius: 8px;
                  }
                  :global(.dark) .yt-skel, .dark .yt-skel {
                    background: #374151;
                    background-image: linear-gradient(90deg, #374151 0px, #4b5563 40%, #374151 80%);
                  }
                `}</style>
                {[
                  { lines: [{ w: 180 }, { w: 120 }], self: false },
                  { lines: [{ w: 240 }], self: false },
                  { lines: [{ w: 140 }, { w: 80 }], self: true },
                  { lines: [{ w: 200 }, { w: 150 }], self: false },
                  { lines: [{ w: 160 }], self: true },
                  { lines: [{ w: 260 }, { w: 100 }], self: false },
                  { lines: [{ w: 120 }], self: true },
                  { lines: [{ w: 190 }, { w: 140 }], self: false },
                ].map((item, i) => (
                  <div key={i} className={`flex mb-2 ${item.self ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-3 flex flex-col gap-2 ${item.self ? 'bg-red-50 dark:bg-red-950/40 rounded-[16px_4px_16px_16px]' : 'bg-gray-50 dark:bg-slate-800/80 rounded-[4px_16px_16px_16px]'}`} style={{ minWidth: Math.max(...item.lines.map(l => l.w)) + 28 }}>
                      {item.lines.map((line, j) => (
                        <div key={j} className="yt-skel h-3 rounded-[6px]" style={{ width: line.w }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center p-8">
                <div className="bg-gray-50 dark:bg-slate-800/90 rounded-2xl px-6 py-4 text-gray-500 dark:text-slate-300 font-medium text-[0.9rem] text-center border border-gray-100 dark:border-slate-700/80 shadow-sm">
                  No messages yet — say hello! 👋
                </div>
              </div>
            ) : null}

            {/* Messages grouped by date */}
            {!loadingMsgs && messages.length > 0 && groupByDate(messages).map(g => (
              <div key={g.date}>
                {/* date label */}
                <div className="flex justify-center my-6">
                  <span className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-400 font-bold text-[0.75rem] px-4 py-1.5 rounded-full uppercase tracking-wider">
                    {g.date}
                  </span>
                </div>
                {g.msgs.map((msg, i) => {
                  const isSelf = msg.senderId === me?.id
                  const prev = g.msgs[i - 1]
                  const next = g.msgs[i + 1]
                  const showTail = !prev || prev.senderId !== msg.senderId
                  const isLast = !next || next.senderId !== msg.senderId
                  const showSender = activeRoom.isGroup && !isSelf && showTail
                  return (
                    <React.Fragment key={msg.id}>
                      {msg.id === newMessageAnchorId && (
                        <div ref={newMessageDividerRef} className="my-5 flex items-center gap-3" role="status" aria-label="New messages">
                          <span className="h-px flex-1 bg-blue-200 dark:bg-blue-900/70" />
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300">
                            New messages
                          </span>
                          <span className="h-px flex-1 bg-blue-200 dark:bg-blue-900/70" />
                        </div>
                      )}
                      <Bubble msg={msg} isSelf={isSelf} showSender={showSender} showTail={showTail} isLast={isLast} onDelete={onDeleteMessage} animate={msg.id === animatedMessageId} />
                    </React.Fragment>
                  )
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {activeRoom && (typingUsers[activeRoom.id] ?? []).length > 0 && (
              <div className="flex justify-start mb-2 ml-10">
                <div className="chat-typing-enter bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-3 flex items-center justify-center">
                  <span className="flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="typing-dot bg-gray-400 dark:bg-gray-500" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}

          </div>
          {/* Attached File Preview Pill */}
          {attachedFile && (
            <div className="mx-3 md:mx-6 mb-2 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-md flex items-center justify-between animate-scale-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shrink-0 font-bold text-[0.72rem] tracking-wider uppercase">
                  {attachedFile.name.endsWith('.pdf') || attachedFile.type.includes('pdf') ? 'PDF' : attachedFile.type.includes('image') ? 'IMG' : 'DOC'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate">
                    {attachedFile.name}
                  </div>
                  <div className="text-[0.7rem] text-gray-500 dark:text-slate-400 font-medium">
                    {(attachedFile.size / 1024).toFixed(1)} KB • Attached (Ready to send)
                  </div>
                </div>
              </div>
              <button
                onClick={onRemoveAttachment}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center border-none cursor-pointer transition-colors shrink-0 ml-2"
                title="Remove attachment"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}

          {/* input bar */}
          <div className="relative shrink-0 flex items-end gap-2 md:gap-3 px-3 md:px-6 py-3 md:py-4 bg-[#fafbfc] dark:bg-[#0f172a] border-t border-gray-200 dark:border-slate-800 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
              <div ref={emojiPickerRef as React.RefObject<HTMLDivElement>} className="absolute bottom-[70px] md:bottom-[80px] left-2 md:left-6 z-[300] shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden border border-gray-100">
                <EmojiPicker
                  onEmojiClick={(data: EmojiClickData) => {
                    setInputText(prev => prev + data.emoji)
                    inputRef.current?.focus()
                  }}
                  skinTonesDisabled
                  height={350}
                  width={Math.min(340, window.innerWidth - 24)}
                  searchDisabled={false}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
            {/* Attachment Menu */}
            {showAttachMenu && (
              <div ref={attachMenuRef as React.RefObject<HTMLDivElement>} className="absolute bottom-[70px] md:bottom-[80px] left-2 md:left-[60px] z-[300] bg-white dark:bg-slate-800 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] px-3 pt-4 pb-3 flex flex-col gap-1 min-w-[200px] md:min-w-[220px] origin-bottom-left animate-scale-in border border-gray-100 dark:border-slate-700">
                {([
                  { label: 'Image & Video', accept: 'image/*,video/*', ref: imgFileRef, color: '#8b5cf6', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>) },
                  { label: 'Document', accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar', ref: docFileRef, color: '#3b82f6', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>) },
                ] as const).map(item => (
                  <div key={item.label}
                    onClick={() => { (item.ref as React.RefObject<HTMLInputElement>).current?.click(); setShowAttachMenu(false) }}
                    className="flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/60"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: item.color }}>
                      {item.icon}
                    </div>
                    <span className="text-[0.95rem] font-bold text-gray-700 dark:text-slate-200">
                      {item.label}
                    </span>
                  </div>
                ))}
                {/* Location Option */}
                <div
                  onClick={() => {
                    setShowAttachMenu(false)
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(pos => {
                        const { latitude, longitude } = pos.coords
                        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`
                        send(mapsUrl, 'location')
                      }, () => alert('Location access denied.'))
                    } else { alert('Geolocation not supported.') }
                  }}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/60"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span className="text-[0.95rem] font-bold text-gray-700 dark:text-slate-200">Location</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-1 shrink-0 bg-gray-50 dark:bg-slate-800 rounded-full px-2 py-1">
              <IconBtn title="Emoji" onClick={() => setShowEmojiPicker(p => !p)}><IcoEmoji /></IconBtn>
              <IconBtn onClick={() => { setShowAttachMenu(p => !p); setShowEmojiPicker(false) }} title="Attach">
                <IcoAttach />
              </IconBtn>
            </div>
            
            {/* Hidden file inputs */}
            <input ref={imgFileRef as React.RefObject<HTMLInputElement>} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
            <input ref={docFileRef as React.RefObject<HTMLInputElement>} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" className="hidden" onChange={handleFile} />
            <input ref={fileRef as React.RefObject<HTMLInputElement>} type="file" className="hidden" onChange={handleFile} />

            <div className="flex-1 bg-gray-50 dark:bg-slate-800/90 rounded-3xl flex items-center border border-transparent focus-within:border-gray-200 dark:focus-within:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors min-h-[44px] md:min-h-[48px] px-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                className="flex-1 border-none bg-transparent outline-none resize-none text-gray-800 dark:text-slate-100 px-3 md:px-4 py-3 md:py-3.5 text-[0.9rem] md:text-[0.95rem] font-medium max-h-[120px] min-h-[24px] placeholder:text-gray-400 dark:placeholder:text-slate-500"
                placeholder="Type a message..."
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                rows={1}
              />
            </div>

            {sendError && (
              <div role="alert" className="text-red-600 font-bold text-[0.75rem] max-w-[180px] absolute -top-4 right-6">
                {sendError}
              </div>
            )}
            
            <button 
              title="Send" 
              onClick={() => send()} 
              disabled={sending || (!inputText.trim() && !attachedFile)}
              className="w-11 h-11 md:w-12 md:h-12 self-center rounded-xl bg-[#2563eb] text-white flex items-center justify-center border-none shrink-0 cursor-pointer hover:bg-[#1d4ed8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IcoSend color="white" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
