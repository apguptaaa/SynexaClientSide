import { useTheme } from '../../hooks/useTheme'
import { Avatar } from '../common/Avatar'
import type { User } from '../../types/chat'

export function SidebarNav({
  activeNavTab = 'chats',
  onChatClick,
  onCallsClick,
  onCalendarClick,
  onSearchClick,
  onSettingsClick,
  onProfileClick,
  onLogout,
  me,
  hideMobileNav = false
}: {
  activeNavTab?: 'chats' | 'calls' | 'calendar'
  me: User | null
  onChatClick?: () => void
  onCallsClick?: () => void
  onCalendarClick?: () => void
  onSearchClick?: () => void
  onSettingsClick?: () => void
  onProfileClick?: () => void
  onLogout: () => void
  hideMobileNav?: boolean
}) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <>
      {/* Desktop vertical sidebar - hidden on mobile */}
      <div className="hidden md:flex w-[72px] h-full flex-col items-center py-5 bg-white dark:bg-[#0f172a] shrink-0 z-20 shadow-[2px_0_20px_rgba(140,8,23,0.08)] border-r border-red-100/40 dark:border-slate-800 select-none transition-colors duration-300">
        {/* Nav Icons */}
        <div className="flex flex-col gap-2 flex-1 w-full items-center">
          {/* Profile Button */}
          <button
            onClick={onProfileClick}
            className="w-10 h-10 mb-2 rounded-full overflow-hidden flex items-center justify-center border-none bg-transparent cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            title="My Profile"
          >
            <Avatar name={me?.name || 'User'} src={me?.avatarUrl} size={40} />
          </button>

          {/* 1. Chat (Messages) */}
          <div className="relative" title="Chats & Messages">
            {activeNavTab === 'chats' && (
              <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#8c0817] rounded-r-full shadow-[2px_0_8px_rgba(140,8,23,0.3)]"></div>
            )}
            <button
              onClick={onChatClick}
              className={`w-11 h-11 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all duration-300 ${
                activeNavTab === 'chats'
                  ? 'bg-gradient-to-br from-[#8c0817] to-[#a31d2b] text-white shadow-[0_4px_14px_rgba(140,8,23,0.35)] hover:shadow-[0_6px_20px_rgba(140,8,23,0.45)] hover:scale-105 active:scale-95'
                  : 'bg-transparent text-gray-400 dark:text-slate-400 hover:text-[#8c0817] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 hover:scale-105'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>

          {/* 2. Calls (Teams Calling UI) */}
          <div className="relative" title="Calls & History">
            {activeNavTab === 'calls' && (
              <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#8c0817] rounded-r-full shadow-[2px_0_8px_rgba(140,8,23,0.3)]"></div>
            )}
            <button
              onClick={onCallsClick}
              className={`w-11 h-11 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all duration-200 ${
                activeNavTab === 'calls'
                  ? 'bg-gradient-to-br from-[#8c0817] to-[#a31d2b] text-white shadow-[0_4px_14px_rgba(140,8,23,0.35)] hover:scale-105'
                  : 'bg-transparent text-gray-400 dark:text-slate-400 hover:text-[#8c0817] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 hover:scale-105'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
          </div>

          {/* 3. Calendar & Meetings */}
          <div className="relative" title="Calendar & Meetings">
            {activeNavTab === 'calendar' && (
              <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#8c0817] rounded-r-full shadow-[2px_0_8px_rgba(140,8,23,0.3)]"></div>
            )}
            <button
              onClick={onCalendarClick}
              className={`w-11 h-11 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all duration-200 ${
                activeNavTab === 'calendar'
                  ? 'bg-gradient-to-br from-[#8c0817] to-[#a31d2b] text-white shadow-[0_4px_14px_rgba(140,8,23,0.35)] hover:scale-105'
                  : 'bg-transparent text-gray-400 dark:text-slate-400 hover:text-[#8c0817] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 hover:scale-105'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
          </div>

          {/* 4. Search */}
          <button
            onClick={onSearchClick}
            className="group w-11 h-11 rounded-xl flex items-center justify-center border-none bg-transparent text-gray-400 dark:text-slate-400 hover:text-[#8c0817] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200 hover:scale-105"
            title="Search Users & Groups"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:scale-110">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Subtle divider */}
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-red-200 dark:via-slate-700 to-transparent mb-4"></div>

        {/* Bottom Icons */}
        <div className="flex flex-col gap-2 items-center">
          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="group w-11 h-11 rounded-xl flex items-center justify-center border-none bg-transparent hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12"
            title={isDark ? "Dark Mode (Click for Light Mode)" : "Light Mode (Click for Dark Mode)"}
          >
            {isDark ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          {/* 5. Settings Button */}
          <button
            onClick={onSettingsClick}
            className="group w-11 h-11 rounded-xl flex items-center justify-center border-none bg-transparent text-gray-400 hover:text-[#8c0817] hover:bg-red-50 cursor-pointer transition-all duration-200"
            title="Settings (Teams view)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-45">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>

          {/* 7. Logout Button */}
          <button
            onClick={onLogout}
            className="group w-11 h-11 rounded-xl flex items-center justify-center border-none bg-transparent text-gray-400 hover:text-[#dc2626] hover:bg-red-50 cursor-pointer transition-all duration-200"
            title="Log out"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:scale-110">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile bottom tab bar - visible only on mobile when hideMobileNav is false */}
      {!hideMobileNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none">
          <div className="flex items-center justify-around px-2 py-1.5 safe-area-pb">
            {/* Chats */}
            <button
              onClick={onChatClick}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl border-none cursor-pointer transition-all duration-200 ${
                activeNavTab === 'chats'
                  ? 'text-[#8c0817] dark:text-red-400'
                  : 'text-gray-400 dark:text-slate-500'
              } bg-transparent`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeNavTab === 'chats' ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="text-[0.65rem] font-bold">Chats</span>
            </button>

            {/* Calls */}
            <button
              onClick={onCallsClick}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl border-none cursor-pointer transition-all duration-200 ${
                activeNavTab === 'calls'
                  ? 'text-[#8c0817] dark:text-red-400'
                  : 'text-gray-400 dark:text-slate-500'
              } bg-transparent`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeNavTab === 'calls' ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="text-[0.65rem] font-bold">Calls</span>
            </button>

            {/* Calendar */}
            <button
              onClick={onCalendarClick}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl border-none cursor-pointer transition-all duration-200 ${
                activeNavTab === 'calendar'
                  ? 'text-[#8c0817] dark:text-red-400'
                  : 'text-gray-400 dark:text-slate-500'
              } bg-transparent`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeNavTab === 'calendar' ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="text-[0.65rem] font-bold">Calendar</span>
            </button>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl border-none cursor-pointer transition-all duration-200 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 bg-transparent"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span className="text-[0.65rem] font-bold">Settings</span>
            </button>

            {/* Profile */}
            <button
              onClick={onProfileClick}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl border-none cursor-pointer transition-all duration-200 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 bg-transparent"
            >
              <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
                <Avatar name={me?.name || 'User'} src={me?.avatarUrl} size={20} />
              </div>
              <span className="text-[0.65rem] font-bold">Profile</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
