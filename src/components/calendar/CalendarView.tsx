import { useState } from 'react'
import type { User, Room } from '../../types/chat'

export interface Meeting {
  id: string
  title: string
  date: string // YYYY-MM-DD
  startTime: string // e.g. "10:00 AM"
  endTime: string // e.g. "11:00 AM"
  hostName: string
  attendees: string[]
  isLive?: boolean
  meetLink: string
}

export function CalendarView({
  me,
  rooms: _rooms,
  onJoinMeeting
}: {
  me: User | null
  rooms: Room[]
  onJoinMeeting?: (meeting: Meeting) => void
}) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('11:00 AM')
  const [newDuration, setNewDuration] = useState('30 mins')
  const [selectedAttendees, _setSelectedAttendees] = useState<string[]>([])
  const [copyToast, setCopyToast] = useState(false)

  // Default demo meetings list
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 'm-1',
      title: 'Daily Engineering Standup & Sprint Sync',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      hostName: me?.name || 'Tech Lead',
      attendees: ['Alex Morgan', 'Sarah Chen', 'David Kim'],
      isLive: true,
      meetLink: 'https://synexa.meet/sync-daily-eng'
    },
    {
      id: 'm-2',
      title: 'Product Design & UI Review',
      date: new Date().toISOString().split('T')[0],
      startTime: '02:00 PM',
      endTime: '02:45 PM',
      hostName: 'Sarah Chen',
      attendees: ['Alex Morgan', 'Emily Watson'],
      isLive: false,
      meetLink: 'https://synexa.meet/design-review-v2'
    },
    {
      id: 'm-3',
      title: 'Quarterly Roadmap & Client Kickoff',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '11:30 AM',
      endTime: '12:30 PM',
      hostName: 'Michael Scott',
      attendees: ['Sarah Chen', 'David Kim', 'Emily Watson'],
      isLive: false,
      meetLink: 'https://synexa.meet/client-q3-sync'
    }
  ])

  const filteredMeetings = meetings.filter((m) => m.date === selectedDate)

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newMeeting: Meeting = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      date: selectedDate,
      startTime: newTime,
      endTime: '12:00 PM',
      hostName: me?.name || 'You',
      attendees: selectedAttendees.length > 0 ? selectedAttendees : ['Team Members'],
      isLive: false,
      meetLink: `https://synexa.meet/${Math.random().toString(36).substring(2, 9)}`
    }

    setMeetings((prev) => [newMeeting, ...prev])
    setNewTitle('')
    setShowScheduleForm(false)
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).catch(() => {})
    setCopyToast(true)
    setTimeout(() => setCopyToast(false), 2000)
  }

  // Days in month generator for mini calendar
  const today = new Date()
  const currentMonthDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i + 1)
    return {
      dayNum: i + 1,
      isoDate: d.toISOString().split('T')[0],
      isToday: d.toDateString() === today.toDateString()
    }
  })

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#090d16] overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-slate-100 m-0">Calendar & Meetings</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium m-0">Schedule calls, reviews & team agendas</p>
          </div>
        </div>

        <button
          onClick={() => setShowScheduleForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold border-none cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Schedule Meeting</span>
        </button>
      </header>

      {/* Content Area: Left Mini Calendar + Right Meetings List */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 bg-[#f8f9fb] dark:bg-[#0b0f19] overflow-y-auto md:overflow-hidden">
        {/* Left Mini Calendar */}
        <div className="w-full md:w-80 bg-white dark:bg-[#0f172a] border-b md:border-b-0 md:border-r border-gray-200/70 dark:border-slate-800 p-5 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-800 dark:text-slate-100">
              {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#2563eb] dark:text-blue-400">
              Today
            </span>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-bold text-gray-400 dark:text-slate-500 mb-2">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {currentMonthDays.map((d) => {
              const isSelected = selectedDate === d.isoDate
              const hasMeeting = meetings.some((m) => m.date === d.isoDate)

              return (
                <button
                  key={d.isoDate}
                  onClick={() => setSelectedDate(d.isoDate)}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center border-none text-xs font-bold relative cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#2563eb] text-white shadow-sm'
                      : d.isToday
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400'
                      : 'bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{d.dayNum}</span>
                  {hasMeeting && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-[#2563eb] dark:bg-blue-400'
                      }`}
                    ></span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Meet Now Button */}
          <div className="mt-auto pt-5 border-t border-gray-100 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">Instant Video Room</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 dark:text-slate-400 font-medium m-0">Start a meeting and share the link with any contact.</p>
              <button
                onClick={() => {
                  handleCopyLink('https://synexa.meet/instant-' + Math.random().toString(36).substring(2, 7))
                }}
                className="mt-1 w-full py-2.5 rounded-xl border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#2563eb] dark:text-blue-400 text-xs font-bold cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                Start Meet Now
              </button>
            </div>
          </div>
        </div>

        {/* Right Schedule Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 m-0">
              Agenda for {new Date(selectedDate).toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h4>
            <span className="text-xs text-gray-400 dark:text-slate-400 font-semibold">{filteredMeetings.length} Scheduled</span>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-500 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-700 dark:text-slate-300">No meetings scheduled for this day</div>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 mb-4">Click below to organize a call or sync agenda.</p>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 text-xs font-bold border-none cursor-pointer hover:bg-blue-100 transition-colors"
              >
                + Schedule Event
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[0.65rem] uppercase">TIME</span>
                      <span className="text-xs">{m.startTime.split(' ')[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 m-0">{m.title}</h4>
                        {m.isLive && (
                          <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-extrabold bg-rose-500 text-white animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-slate-400 font-medium">
                        <span>{m.startTime} – {m.endTime}</span>
                        <span>•</span>
                        <span>Host: {m.hostName}</span>
                        <span>•</span>
                        <span>{m.attendees.length} Attendees</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyLink(m.meetLink)}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-xs font-bold text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => {
                        if (onJoinMeeting) onJoinMeeting(m)
                        else window.open(m.meetLink, '_blank')
                      }}
                      className="px-4 py-2 rounded-xl border-none bg-[#2563eb] text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {m.isLive ? 'Join Live Room' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 m-0">Schedule New Meeting</h3>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 border-none cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Sync"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-[#2563eb] text-gray-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Start Time
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-[#2563eb] text-gray-800 dark:text-slate-200"
                  >
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>12:00 PM</option>
                    <option>01:00 PM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                    <option>04:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-[#2563eb] text-gray-800 dark:text-slate-200"
                  >
                    <option>15 mins</option>
                    <option>30 mins</option>
                    <option>45 mins</option>
                    <option>60 mins</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl border-none bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-xs font-extrabold cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  Save & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {copyToast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Meeting link copied to clipboard!
        </div>
      )}
    </div>
  )
}
