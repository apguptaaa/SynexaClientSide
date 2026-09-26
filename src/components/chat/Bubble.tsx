import type { Message } from '../../types/chat'
import { seedColor, fmtTime } from '../../utils/chatHelpers'
import { IcoCheckSeen, IcoCheckDelivered, IcoCheckSent } from '../common/Icons'
import { Avatar } from '../common/Avatar'

export function Bubble({ msg, isSelf, showSender, isLast }: { msg: Message; isSelf: boolean; showSender: boolean; showTail?: boolean; isLast: boolean }) {
  const isImg = msg.fileType?.startsWith('image/')
  // Use red theme for self in both light and dark mode; slate dark for others in dark mode
  const bgClass = isSelf 
    ? 'bg-[#8c0817] text-white shadow-[0_2px_8px_rgba(140,8,23,0.2)]' 
    : 'bg-[#f1f5f9] dark:bg-slate-800 text-[#111827] dark:text-slate-100 border border-transparent dark:border-slate-700/60'
  const timeClass = isSelf ? 'text-red-200' : 'text-gray-400 dark:text-slate-400'

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

      <div className={`relative max-w-[75%] md:max-w-[520px] flex flex-col ${bgClass} ${isSelf ? 'rounded-[16px_4px_16px_16px]' : 'rounded-[4px_16px_16px_16px]'} px-3.5 py-2.5 shadow-sm`}>
        {showSender && !isSelf && (
          <div className="text-[0.78rem] font-bold mb-1" style={{ color: seedColor(msg.sender.name) }}>
            {msg.sender.name}
          </div>
        )}

        {msg.fileUrl && (
          <div className={`shrink-0 ${msg.text ? 'mb-2' : ''}`}>
            {isImg ? (
              <img src={msg.fileUrl} alt="attachment" className="max-w-full max-h-[220px] rounded-lg block cursor-pointer" onClick={() => window.open(msg.fileUrl!, '_blank')} />
            ) : (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg no-underline text-[0.85rem] font-semibold max-w-[280px] overflow-hidden ${isSelf ? 'bg-black/10 text-white' : 'bg-black/5 text-[#8c0817]'}`}>
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
        )}

        <div className="flex flex-wrap items-end justify-between gap-2">
          {msg.text && (
            <span className="whitespace-pre-wrap break-words [word-break:break-word] text-[0.95rem] leading-[1.4] max-w-full">
              {msg.text}
            </span>
          )}

          {!msg.text && <div className="flex-1"></div>}

          <div className={`flex items-center gap-1 h-[15px] ml-auto ${msg.text ? 'mt-0' : 'mt-1'}`}>
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
