import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Message } from '../../types/chat'
import { Copy, Trash2 } from 'lucide-react'
import { seedColor, fmtTime } from '../../utils/chatHelpers'
import { IcoCheckSeen, IcoCheckDelivered, IcoCheckSent } from '../common/Icons'
import { Avatar } from '../common/Avatar'

function renderTextWithLinks(text: string, isSelf: boolean) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, idx) => {
    if (/^https?:\/\/|^www\./i.test(part)) {
      const href = part.startsWith('http') ? part : `https://${part}`
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline font-semibold break-all ${
            isSelf
              ? 'text-blue-100 hover:text-white'
              : 'text-[#2563eb] dark:text-blue-400 hover:underline'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export function Bubble({ msg, isSelf, showSender, isLast, onDelete, animate = false }: { msg: Message; isSelf: boolean; showSender: boolean; showTail?: boolean; isLast: boolean; onDelete?: (message: Message) => void; animate?: boolean }) {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const longPressTimer = useRef<number | null>(null)
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null)
  const isImg = msg.fileType?.startsWith('image/')
  const isLocation = msg.fileType === 'location' || (msg.fileUrl && msg.fileUrl.includes('maps.google.com')) || (msg.text && (msg.text.includes('maps.google.com') || msg.text.includes('google.com/maps')))
  const locationUrl = msg.fileUrl || (msg.text && (msg.text.includes('maps.google.com') || msg.text.includes('google.com/maps')) ? msg.text : '')

  const bgClass = isSelf 
    ? 'bg-[#2563eb] text-white shadow-[0_2px_8px_rgba(37,99,235,0.18)]' 
    : 'bg-[#f1f5f9] dark:bg-slate-800 text-[#111827] dark:text-slate-100 border border-transparent dark:border-slate-700/60'
  const timeClass = isSelf ? 'text-blue-200' : 'text-gray-400 dark:text-slate-400'
  const hasMessageActions = Boolean(msg.text || (isSelf && onDelete))

  const closeMenu = () => setMenuPosition(null)
  const openMenu = (x: number, y: number) => {
    setMenuPosition({
      x: Math.max(8, Math.min(x, window.innerWidth - 200)),
      y: Math.max(8, Math.min(y, window.innerHeight - 112)),
    })
  }
  const cancelLongPress = () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current)
    longPressTimer.current = null
    touchStartPosition.current = null
  }

  useEffect(() => () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current)
  }, [])

  const copyMessage = async () => {
    if (!msg.text) return
    try {
      await navigator.clipboard.writeText(msg.text)
    } catch {
      return
    } finally {
      closeMenu()
    }
  }

  return (
    <div className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'} ${isLast ? 'mb-4' : 'mb-1'}`}>
      
      {/* Other person avatar (show on last message of group) */}
      {!isSelf && (
        <div className="w-8 h-8 mr-2 shrink-0 flex items-end">
          {isLast ? (
            <Avatar name={msg.sender.name} src={msg.sender.avatarUrl} size={32} />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      <div
        onContextMenu={event => {
          if (!hasMessageActions) return
          event.preventDefault()
          cancelLongPress()
          openMenu(event.clientX, event.clientY)
        }}
        onPointerDown={event => {
          if (!hasMessageActions || event.pointerType !== 'touch') return
          cancelLongPress()
          const { clientX, clientY } = event
          touchStartPosition.current = { x: clientX, y: clientY }
          longPressTimer.current = window.setTimeout(() => {
            openMenu(clientX, clientY)
            longPressTimer.current = null
          }, 500)
        }}
        onPointerMove={event => {
          const startPosition = touchStartPosition.current
          if (!startPosition || event.pointerType !== 'touch') return
          if (Math.hypot(event.clientX - startPosition.x, event.clientY - startPosition.y) > 10) cancelLongPress()
        }}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        aria-haspopup={hasMessageActions ? 'menu' : undefined}
        aria-expanded={menuPosition !== null}
        className={`chat-message-bubble relative max-w-[85%] md:max-w-[520px] flex flex-col ${bgClass} ${isSelf ? 'rounded-[16px_4px_16px_16px]' : 'rounded-[4px_16px_16px_16px]'} px-3.5 py-2.5 shadow-sm ${menuPosition ? 'ring-2 ring-blue-300/80 shadow-xl' : ''} ${animate ? 'chat-message-enter' : ''}`}
      >
        {showSender && !isSelf && (
          <div className="text-[0.78rem] font-bold mb-1" style={{ color: seedColor(msg.sender.name) }}>
            {msg.sender.name}
          </div>
        )}

        {/* Location Card rendering */}
        {isLocation ? (
          <div className="flex flex-col gap-2 my-1 min-w-[220px]">
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-emerald-950/80 border border-emerald-500/30 flex flex-col items-center justify-center p-3 text-center shadow-inner">
              {/* Decorative map grid background */}
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:10px_10px]" />
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg mb-1 animate-bounce z-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="font-extrabold text-[0.85rem] text-white z-10 tracking-tight">Shared Location</span>
              <span className="text-[0.7rem] text-emerald-200 z-10 font-medium">Google Maps Location</span>
            </div>
            <a
              href={locationUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-[0.82rem] no-underline transition-all ${
                isSelf 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Open in Maps
            </a>
          </div>
        ) : msg.fileUrl ? (
          <div className={`shrink-0 ${msg.text ? 'mb-2' : ''}`}>
            {isImg ? (
              <img src={msg.fileUrl} alt="attachment" className="max-w-full max-h-[220px] rounded-lg block cursor-pointer" onClick={() => window.open(msg.fileUrl!, '_blank')} />
            ) : (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg no-underline text-[0.85rem] font-semibold max-w-[280px] overflow-hidden ${isSelf ? 'bg-black/10 text-white' : 'bg-black/5 text-[#2563eb]'}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {msg.fileUrl.split('/').pop()}
                </span>
              </a>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-2">
          {msg.text && !isLocation && (
            <span className="whitespace-pre-wrap break-words [word-break:break-word] text-[0.95rem] leading-[1.4] max-w-full">
              {renderTextWithLinks(msg.text, isSelf)}
            </span>
          )}

          {!msg.text && !isLocation && <div className="flex-1"></div>}

          <div className={`flex items-center gap-1 h-[15px] ml-auto ${msg.text || isLocation ? 'mt-0' : 'mt-1'}`}>
            <span className={`text-[0.68rem] whitespace-nowrap font-medium ${timeClass}`}>
              {fmtTime(msg.createdAt)}
            </span>
            {isSelf && (
              <span className="opacity-90">
                {(msg.status === 'seen' || msg.readTime || msg.readAt) ? <IcoCheckSeen /> :
                  (msg.status === 'delivered' || msg.deliveredTime || msg.deliveredAt) ? <IcoCheckDelivered color="#fff" /> :
                    <IcoCheckSent color="#fff" />}
              </span>
            )}
          </div>

        </div>
      </div>
      {menuPosition && createPortal(
        <>
          <button
            type="button"
            aria-label="Close message actions"
            className="fixed inset-0 z-[1000] cursor-default border-0 bg-transparent"
            onClick={closeMenu}
            onContextMenu={event => {
              event.preventDefault()
              event.stopPropagation()
            }}
          />
          <div
            role="menu"
            className="fixed z-[1001] min-w-[190px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            style={{ left: menuPosition.x, top: menuPosition.y }}
            onContextMenu={event => {
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            {msg.text && (
              <button type="button" role="menuitem" onClick={() => { void copyMessage() }} className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700">
                <Copy size={16} /> Copy text
              </button>
            )}
            {isSelf && onDelete && (
              <button type="button" role="menuitem" onClick={() => { closeMenu(); onDelete(msg) }} className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                <Trash2 size={16} /> Delete message
              </button>
            )}
          </div>
        </>,
        document.body,
      )}

      {/* Self avatar (show on last message of group) */}
      {isSelf && (
        <div className="w-8 h-8 ml-2 shrink-0 flex items-end">
          {isLast ? (
            <Avatar name={msg.sender.name} src={msg.sender.avatarUrl} size={32} />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}
    </div>
  )
}
