"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { sendEmail } from '@/utils/fetchData'
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  Sparkles,
  X,
  BarChart2,
  Inbox,
  FileText,
  Send,
  Archive,
  Trash2,
  Star,
  LogIn,
} from "lucide-react"

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    organizer?: boolean
  }>
  organizer: {
    email: string
    displayName?: string
  }
}

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePage, setActivePage] = useState("inbox")
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [emailTo, setEmailTo] = useState("")
  const [currentView, setCurrentView] = useState("week")
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  // Google Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)
    return () => clearTimeout(popupTimer)
  }, [])

  // Load calendar events when user is authenticated
  useEffect(() => {
    if (session?.accessToken) {
      loadCalendarEvents()
    }
  }, [session, currentDate])

  useEffect(() => {
    if (showAIPopup) {
      const text = "Shall I play some Mozart essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)
      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const loadCalendarEvents = async () => {
    setLoadingEvents(true)
    try {
      // Get start of week
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)

      // Get end of week
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      endOfWeek.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/calendar?timeMin=${startOfWeek.toISOString()}&timeMax=${endOfWeek.toISOString()}`
      )

      if (response.ok) {
        const events = await response.json()
        setCalendarEvents(events)
      } else if (response.status === 401) {
        console.error("Calendar authentication expired")
      }
    } catch (error) {
      console.error("Error loading calendar events:", error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const convertCalendarEvents = () => {
    return calendarEvents.map((event, index) => {
      const start = new Date(event.start.dateTime)
      const end = new Date(event.end.dateTime)
      
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day
      startOfWeek.setDate(diff)
      
      // Calculate which day column this event belongs to
      const daysDiff = Math.floor((start.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24))
      const dayOfWeek = daysDiff + 1 // +1 because our grid starts at 1

      const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-yellow-500",
        "bg-indigo-500",
        "bg-pink-500",
        "bg-teal-500",
        "bg-cyan-500",
      ]

      return {
        id: event.id,
        title: event.summary,
        startTime: start.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        color: colors[index % colors.length],
        day: dayOfWeek,
        description: event.description || "No description",
        location: event.location || "No location",
        attendees: event.attendees?.map((a) => a.displayName || a.email) || [],
        organizer: event.organizer.displayName || event.organizer.email,
      }
    }).filter(event => event.day >= 1 && event.day <= 7) // Only show events within the week
  }

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
  }

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSendEmail = async () => {
    if (emailTo && emailSubject) {
      try {
        console.log('🔵 Attempting to send email...');
        
        // Get the auth token from localStorage or session
        const token = localStorage.getItem('token') || session?.accessToken;
        
        if (!token) {
          alert("Please sign in to send emails");
          return;
        }
  
        await sendEmail({
          to: emailTo,
          subject: emailSubject,
          html: emailBody,
          token: token
        });
  
        alert("Email sent successfully!");
        setShowComposeModal(false);
        setEmailTo("");
        setEmailSubject("");
        setEmailBody("");
      } catch (error) {
        console.error("Send email error:", error);
        alert("Failed to send email. Please try again.");
      }
    } else {
      alert("Please fill in the recipient and subject fields.");
    }
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleSettings = () => {
    console.log("Opening settings")
  }

  const handleLogin = () => {
    if (session) {
      router.push('/api/auth/signout')
    } else {
      router.push("/login")
    }
  }

  const navPages = [
    { id: "inbox", name: "Inbox", icon: <Inbox className="h-5 w-5" /> },
    { id: "newsletters", name: "Newsletters", icon: <FileText className="h-5 w-5" /> },
    { id: "email-lists", name: "Email Lists", icon: <Users className="h-5 w-5" /> },
    { id: "emailing-activity", name: "Emailing Activity", icon: <BarChart2 className="h-5 w-5" /> },
    { id: "sent", name: "Sent", icon: <Send className="h-5 w-5" /> },
    { id: "archived", name: "Archived", icon: <Archive className="h-5 w-5" /> },
    { id: "starred", name: "Starred", icon: <Star className="h-5 w-5" /> },
    { id: "trash", name: "Trash", icon: <Trash2 className="h-5 w-5" /> },
  ]

  // Sample events for when not logged in
  const sampleEvents = [
    {
      id: 1,
      title: "Team Meeting",
      startTime: "09:00",
      endTime: "10:00",
      color: "bg-blue-500",
      day: 1,
      description: "Weekly team sync-up",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
      organizer: "Alice Brown",
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      startTime: "12:30",
      endTime: "13:30",
      color: "bg-green-500",
      day: 1,
      description: "Discuss project timeline",
      location: "Cafe Nero",
      attendees: ["Sarah Lee"],
      organizer: "You",
    },
  ]

  const events = session?.accessToken && calendarEvents.length > 0 ? convertCalendarEvents() : sampleEvents

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  
  // Calculate week dates based on currentDate
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date.getDate()
    })
  }
  
  const weekDates = getWeekDates()
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8)

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  const renderPageContent = () => {
    if (activePage !== "inbox") {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ')}</h2>
          <p className="text-white/70">Content for {activePage} coming soon!</p>
        </div>
      )
    }

    return (
      <div className="flex-1 overflow-auto p-4">
        {loadingEvents && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-lg rounded-lg px-4 py-2 text-white text-sm">
            Loading calendar events...
          </div>
        )}
        
        {!session?.accessToken && (
          <div className="mb-4 bg-yellow-500/20 backdrop-blur-lg rounded-lg p-4 text-white text-sm border border-yellow-500/30">
            📅 Sign in with Google to sync your calendar events
          </div>
        )}
        
        <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
          <div className="grid grid-cols-8 border-b border-white/20">
            <div className="p-2 text-center text-white/50 text-xs"></div>
            {weekDays.map((day, i) => {
              const isToday = weekDates[i] === new Date().getDate()
              return (
                <div key={i} className="p-2 text-center border-l border-white/20">
                  <div className="text-xs text-white/70 font-medium">{day}</div>
                  <div
                    className={`text-lg font-medium mt-1 text-white ${isToday ? "burgundy-gradient rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                  >
                    {weekDates[i]}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-8">
            <div className="text-white/70">
              {timeSlots.map((time, i) => (
                <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs">
                  {time > 12 ? `${time - 12} PM` : `${time} AM`}
                </div>
              ))}
            </div>

            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={dayIndex} className="border-l border-white/20 relative">
                {timeSlots.map((_, timeIndex) => (
                  <div key={timeIndex} className="h-20 border-b border-white/10"></div>
                ))}

                {events
                  .filter((event) => event.day === dayIndex + 1)
                  .map((event, i) => {
                    const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                    return (
                      <div
                        key={i}
                        className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                        style={{
                          ...eventStyle,
                          left: "4px",
                          right: "4px",
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="font-medium tracking-wide">{event.title}</div>
                        <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="bg-image-container flex justify-center items-center mx-auto mt-10">
        <Image
          src="/logo.png"
          alt="Arkmail Branding"
          width={1000}
          height={1000}
          className="object-contain"
          priority
          sizes="1000px"
          quality={100}
        />
      </div>

      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""} bg-white/10 backdrop-blur-lg`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => console.log("menu")} className="text-white hover:text-white/80 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-2xl font-bold dripping-text tracking-wide relative">
            Arkmail
            <span className="drip drip-1"></span>
            <span className="drip drip-2"></span>
            <span className="drip drip-3"></span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              name="search"
              placeholder="Search"
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </form>
          <button onClick={handleSettings} className="text-white hover:text-white/80 transition-colors">
            <Settings className="h-6 w-6 drop-shadow-md" />
          </button>
          <button
            onClick={handleLogin}
            className="h-10 w-10 rounded-full bg-burgundy-500 flex items-center justify-center text-white font-bold shadow-md hover:bg-burgundy-600 transition-colors"
          >
            {session ? session.user?.name?.charAt(0)?.toUpperCase() || "U" : <LogIn className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main className="relative h-screen w-full pt-20 flex">
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col`}
          style={{ animationDelay: "0.4s" }}
        >
          <button
            className="mb-6 flex items-center justify-center gap-2 rounded-full burgundy-gradient hover:bg-opacity-80 transition-all duration-300 px-4 py-3 text-white w-full font-medium"
            onClick={() => setShowComposeModal(true)}
          >
            <Plus className="h-5 w-5" />
            <span>Compose</span>
          </button>

          <div className="space-y-1 mb-6">
            {navPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors text-left ${
                  activePage === page.id ? "burgundy-gradient text-white font-medium" : "text-white hover:bg-white/10"
                }`}
              >
                {page.icon}
                <span>{page.name}</span>
                {page.id === "inbox" && (
                  <span className="ml-auto bg-burgundy-500 text-white text-xs px-2 py-0.5 rounded-full">12</span>
                )}
              </button>
            ))}
          </div>

          {session?.user && (
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="w-8 h-8 rounded-full bg-burgundy-500 flex items-center justify-center font-bold">
                  {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{session.user.name}</div>
                  <div className="text-xs text-white/70 truncate">{session.user.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""} bg-white/5 backdrop-blur-lg`}
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <button
                className="px-4 py-2 text-white burgundy-gradient hover:bg-opacity-80 transition-all duration-300 rounded-md font-medium shadow-md"
                onClick={handleToday}
              >
                Today
              </button>
              <div className="flex">
                <button className="p-2 text-white hover:bg-white/10 rounded-l-md" onClick={handlePreviousDay}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 text-white hover:bg-white/10 rounded-r-md" onClick={handleNextDay}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-white bg-burgundy-500/20 px-4 py-1 rounded-full">
                  {formatDate(currentDate)}
                </h2>
                <p className="text-sm text-white/70 text-center mt-1">
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {renderPageContent()}
        </div>

        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-burgundy-400/80 via-burgundy-500/80 to-burgundy-600/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-burgundy-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-burgundy-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 burgundy-gradient hover:bg-opacity-80 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4">
                  <iframe
                    width="100%"
                    height="250"
                    src="https://www.youtube.com/embed/Wcgd1oCbW4g?autoplay=1"
                    title="Mozart Essentials"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4 bg-opacity-90`}>
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                <p className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location}
                </p>
                <p className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <span>
                    <strong>Attendees:</strong>
                    <br />
                    {selectedEvent.attendees.join(", ") || "No attendees"}
                  </span>
                </p>
                <p>
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="burgundy-gradient text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors font-medium"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showComposeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl max-w-2xl w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">New Message</h3>
                <button onClick={() => setShowComposeModal(false)} className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50"
                  placeholder="To:"
                />

                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50"
                  placeholder="Subject:"
                />

                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 h-64 resize-none"
                  placeholder="Write your message..."
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="px-4 py-2 burgundy-gradient hover:bg-opacity-80 text-white rounded-md flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}