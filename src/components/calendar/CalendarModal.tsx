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

export function CalendarModal({
  isOpen,
  onClose,
  me,
  rooms: _rooms,
  onJoinMeeting
}: {
  isOpen: boolean
  onClose: () => void
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

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center font-sans p-0 md:p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full h-full md:max-w-[900px] md:h-[640px] md:max-h-[90vh] md:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden border-0 md:border border-gray-100">
        {/* Header */}
        <div className="h-16 px-4 md:px-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c0817] to-[#b91c1c] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold text-[#1f2937] m-0 tracking-[-0.01em] truncate">Calendar & Meetings</h3>
              <p className="text-[0.7rem] md:text-xs text-gray-400 font-medium m-0 truncate">Schedule calls & agendas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowScheduleForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8c0817] text-white text-xs font-bold border-none cursor-pointer hover:bg-red-800 transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="hidden sm:inline">Schedule Meeting</span>
              <span className="sm:hidden">Schedule</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 cursor-pointer transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area: Left Mini Calendar + Right Meetings List */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 bg-[#f8f9fb] overflow-y-auto md:overflow-hidden">
          {/* Left Mini Calendar */}
          <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200/70 p-4 md:p-5 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-800">
                {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-[#8c0817]">
                Today
              </span>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-bold text-gray-400 mb-2">
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
                    className={`h-8 rounded-lg flex flex-col items-center justify-center border-none text-xs font-bold relative cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#8c0817] text-white shadow-sm'
                        : d.isToday
                        ? 'bg-red-50 text-[#8c0817]'
                        : 'bg-transparent text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{d.dayNum}</span>
                    {hasMeeting && (
                      <span
                        className={`w-1 h-1 rounded-full mt-0.5 ${
                          isSelected ? 'bg-white' : 'bg-[#8c0817]'
                        }`}
                      ></span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Meet Now Button */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-50 to-orange-50/50 border border-red-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-gray-800">Instant Video Room</span>
                </div>
                <p className="text-[0.75rem] text-gray-500 font-medium m-0">Start a meeting and share the link with any contact.</p>
                <button
                  onClick={() => {
                    handleCopyLink('https://synexa.meet/instant-' + Math.random().toString(36).substring(2, 7))
                  }}
                  className="mt-1 w-full py-2.5 rounded-xl border-none bg-white hover:bg-gray-50 text-[#8c0817] text-xs font-bold cursor-pointer shadow-sm transition-all border border-red-100 flex items-center justify-center gap-1.5"
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900 m-0">
                Agenda for {new Date(selectedDate).toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h4>
              <span className="text-xs text-gray-400 font-semibold">{filteredMeetings.length} Scheduled</span>
            </div>

            {filteredMeetings.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-600 m-0 mb-1">No meetings scheduled</p>
                <p className="text-xs text-gray-400 m-0">You have no events or syncs planned for this date.</p>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#8c0817] text-white text-xs font-bold border-none cursor-pointer hover:bg-red-800 transition-colors shadow-sm"
                >
                  + Schedule Event
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-red-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {meeting.isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-[#8c0817] text-[0.7rem] font-extrabold animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-red-600"></span>
                              LIVE NOW
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[0.7rem] font-bold">
                              UPCOMING
                            </span>
                          )}
                          <span className="text-xs font-semibold text-gray-500">
                            {meeting.startTime} – {meeting.endTime}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-gray-900 m-0 leading-snug">{meeting.title}</h5>

                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5 font-medium">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-400">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Host: <strong className="text-gray-700">{meeting.hostName}</strong>
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-400">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            {meeting.attendees.length} Participants
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (onJoinMeeting) onJoinMeeting(meeting)
                            else window.open(meeting.meetLink, '_blank')
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8c0817] to-[#b91c1c] text-white text-xs font-bold border-none cursor-pointer shadow-sm hover:scale-105 transition-transform"
                        >
                          Join Meeting
                        </button>
                        <button
                          onClick={() => handleCopyLink(meeting.meetLink)}
                          className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-[0.75rem] font-semibold border border-gray-200 cursor-pointer transition-colors"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Meeting Drawer / Form */}
        {showScheduleForm && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[440px] p-6 shadow-2xl border border-gray-100 animate-[scaleIn_0.2s_ease-out]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-gray-900 m-0">Schedule New Meeting</h4>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 border-none text-gray-500 cursor-pointer flex items-center justify-center hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Meeting Title
                  </label>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Weekly Team Sync"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#8c0817]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Start Time
                    </label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#8c0817] bg-white"
                    >
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>01:00 PM</option>
                      <option>02:30 PM</option>
                      <option>04:00 PM</option>
                      <option>05:30 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Duration
                    </label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#8c0817] bg-white"
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
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl border-none bg-gradient-to-r from-[#8c0817] to-[#b91c1c] text-white text-xs font-extrabold cursor-pointer shadow-sm hover:shadow-md transition-all"
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
    </div>
  )
}
