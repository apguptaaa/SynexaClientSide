import type { Room } from '../../types/chat'
import { roomName, roomAvatar, otherUser, fmtSidebarTime, seedColor } from '../../utils/chatHelpers'
import { Avatar } from '../common/Avatar'
import { IcoGroup, IcoCheckSeen, IcoCheckDelivered, IcoCheckSent } from '../common/Icons'

export function RoomItem({ room, myId, active, onClick, selectionMode, selected, onToggleSelection, unreadCount }: {
  room: Room; myId: string; active: boolean; onClick: () => void; selectionMode: boolean; selected: boolean; onToggleSelection: () => void; unreadCount?: number
}) {
  const name = roomName(room, myId)
  const avatar = roomAvatar(room, myId)
  const lastMsg = room.messages[0]
  const other = room.isGroup ? null : otherUser(room, myId)

  const preview = lastMsg
    ? (lastMsg.fileType?.startsWith('image/') ? '📷 Photo' : lastMsg.fileType ? '📎 File' : lastMsg.text ?? '')
    : ''

  return (
    <div 
      onClick={() => selectionMode ? onToggleSelection() : onClick()}
      className={`group flex items-center px-4 py-3 mx-3 my-0.5 cursor-pointer rounded-xl transition-all duration-200 ${
        selected || active
          ? 'bg-white dark:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-transparent' 
          : 'bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      {selectionMode && (
        <input
          type="checkbox"
          checked={selected}
          aria-label={`Select ${name}`}
          onClick={event => event.stopPropagation()}
          onChange={onToggleSelection}
          className="mr-3 h-4 w-4 shrink-0 cursor-pointer accent-[#2563eb]"
        />
      )}
      {room.isGroup ? (
        <div className="w-[46px] h-[46px] rounded-full shrink-0 mr-3 flex items-center justify-center text-white" style={{ background: seedColor(name) }}>
          <IcoGroup />
        </div>
      ) : (
        <div className="mr-3 shrink-0 relative">
          <Avatar name={name} src={avatar} size={46} online={other?.isOnline} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-[0.95rem] text-[#111827] dark:text-slate-100 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
            {name}
          </span>
          {lastMsg && (
            <span className={`text-[0.7rem] shrink-0 ml-2 font-medium ${active ? 'text-[#2563eb] dark:text-blue-400 font-bold' : 'text-gray-400 dark:text-slate-400'}`}>
              {fmtSidebarTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {lastMsg?.senderId === myId && (
            <span className="opacity-70">
              {(lastMsg.status === 'seen' || lastMsg.readTime || lastMsg.readAt) ? <IcoCheckSeen /> :
                (lastMsg.status === 'delivered' || lastMsg.deliveredTime || lastMsg.deliveredAt) ? <IcoCheckDelivered /> :
                  <IcoCheckSent />}
            </span>
          )}
          <div className="text-[0.8rem] text-gray-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1 font-medium">
            {preview || <span>No messages yet</span>}
          </div>
          {(unreadCount ?? 0) > 0 && (
            <div className="bg-[#2563eb] text-white text-[0.7rem] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shrink-0">
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
