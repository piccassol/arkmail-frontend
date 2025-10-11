"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Pause,
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

// Types for API data
interface MailchimpList {
  id: string
  name: string
  stats: {
    member_count: number
    open_rate: number
    click_rate: number
  }
  date_created: string
}

interface MailchimpCampaign {
  id: string
  settings: {
    subject_line: string
    title: string
  }
  send_time: string
  recipients: {
    list_id: string
    recipient_count: number
  }
  report_summary: {
    open_rate: number
    click_rate: number
    unique_opens: number
  }
  emails_sent: number
}

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
  const [currentDate, setCurrentDate] = useState("March 5")
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // New state for dynamic data
  const [mailchimpLists, setMailchimpLists] = useState<MailchimpList[]>([])
  const [campaigns, setCampaigns] = useState<MailchimpCampaign[]>([])
  const [emailStats, setEmailStats] = useState({
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
  })
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoaded(true)

    const token = localStorage.getItem("access_token")
    if (token)  {
      setIsLoggedIn(true)
    }

    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)
    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      loadAllData()
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (showAIPopup) {
      const text =
  "You have quite a few meetings today. Shall I play some Mozart essentials to help you get into your Flow State?"
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

  const loadAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("access_token")

      try {
        const listsRes = await fetch("/api/mailchimp/lists", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (listsRes.ok) {
          const lists = await listsRes.json()
          setMailchimpLists(lists)
        }
      } catch (err) {
        console.error("Mailchimp lists error:", err)
      }

      try {
        const campaignsRes = await fetch("/api/mailchimp/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json()
          setCampaigns(campaignsData)
        }
      } catch (err) {
        console.error("Campaigns error:", err)
      }

      try {
        const statsRes = await fetch("/api/mailchimp/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (statsRes.ok) {
          const stats = await statsRes.json()
          setEmailStats(stats)
        }
      } catch (err) {
        console.error("Stats error:", err)
      }

      await loadCalendarEvents()
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadCalendarEvents = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const response = await fetch(
        `/api/calendar/events?timeMin=${startOfWeek.toISOString()}&timeMax=${endOfWeek.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.ok) {
        const events = await response.json()
        setCalendarEvents(events)
      }
    } catch (err) {
      console.error("Error loading calendar events:", err)
    }
  }

  const convertCalendarEvents = () => {
    return calendarEvents.map((event, index) => {
      const start = new Date(event.start.dateTime)
      const end = new Date(event.end.dateTime)
      const dayOfWeek = start.getDay()

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
        day: dayOfWeek + 1,
        description: event.description || "No description",
        location: event.location || "No location",
        attendees: event.attendees?.map((a) => a.displayName || a.email) || [],
        organizer: event.organizer.displayName || event.organizer.email,
      }
    })
  }

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
  }

  const handlePreviousDay = () => {
    const currentDateObj = new Date(`${currentMonth} ${Number.parseInt(currentDate.split(" ")[1])}, 2025`)
    currentDateObj.setDate(currentDateObj.getDate() - 1)
    setCurrentDate(`${currentDateObj.toLocaleString("default", { month: "long" })} ${currentDateObj.getDate()}`)
  }

  const handleNextDay = () => {
    const currentDateObj = new Date(`${currentMonth} ${Number.parseInt(currentDate.split(" ")[1])}, 2025`)
    currentDateObj.setDate(currentDateObj.getDate() + 1)
    setCurrentDate(`${currentDateObj.toLocaleString("default", { month: "long" })} ${currentDateObj.getDate()}`)
  }

  const handleToday = () => {
    setCurrentDate("March 5")
  }

  const handlePreviousMonth = () => {
    const currentMonthObj = new Date(`${currentMonth} 1, 2025`)
    currentMonthObj.setMonth(currentMonthObj.getMonth() - 1)
    setCurrentMonth(`${currentMonthObj.toLocaleString("default", { month: "long" })} ${currentMonthObj.getFullYear()}`)
  }

  const handleNextMonth = () => {
    const currentMonthObj = new Date(`${currentMonth} 1, 2025`)
    currentMonthObj.setMonth(currentMonthObj.getMonth() + 1)
    setCurrentMonth(`${currentMonthObj.toLocaleString("default", { month: "long" })} ${currentMonthObj.getFullYear()}`)
  }

  const handleDaySelect = (day: number | null) => {
    if (day) {
      setCurrentDate(`${currentMonth.split(" ")[0]} ${day}`)
    }
  }

  const handleSendEmail = async () => {
    if (emailTo && emailSubject) {
      setLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch("/api/gmail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody }),
        })

        if (response.ok) {
          setShowComposeModal(false)
          setEmailTo("")
          setEmailSubject("")
          setEmailBody("")
          alert("Email sent successfully!")
        } else {
          throw new Error("Failed to send email")
        }
      } catch (error) {
        console.error("Send email error:", error)
        alert("Failed to send email. Please try again.")
      } finally {
        setLoading(false)
      }
    } else {
      alert("Please fill in the recipient and subject fields.")
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Searching for:", (e.target as any).search.value)
  }

  const handleSettings = () => {
    console.log("Opening settings")
  }

  const handleLogin = () => {
    if (isLoggedIn) {
      localStorage.removeItem("access_token")
      setIsLoggedIn(false)
    } else {
      router.push("/login")
    }
  }

  const handleMenuClick = () => {
    console.log("Opening menu")
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
    {
      id: 3,
      title: "Project Review",
      startTime: "14:00",
      endTime: "15:30",
      color: "bg-purple-500",
      day: 3,
      description: "Q2 project progress review",
      location: "Meeting Room 3",
      attendees: ["Team Alpha", "Stakeholders"],
      organizer: "Project Manager",
    },
    {
      id: 4,
      title: "Client Call",
      startTime: "10:00",
      endTime: "11:00",
      color: "bg-yellow-500",
      day: 2,
      description: "Quarterly review with major client",
      location: "Zoom Meeting",
      attendees: ["Client Team", "Sales Team"],
      organizer: "Account Manager",
    },
    {
      id: 5,
      title: "Team Brainstorm",
      startTime: "13:00",
      endTime: "14:30",
      color: "bg-indigo-500",
      day: 4,
      description: "Ideation session for new product features",
      location: "Creative Space",
      attendees: ["Product Team", "Design Team"],
      organizer: "Product Owner",
    },
  ]

  const events = isLoggedIn && calendarEvents.length > 0 ? convertCalendarEvents() : sampleEvents

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8)

  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  const daysInMonth = 31
  const firstDayOffset = 5
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  const newsletterCategories = [
    { name: "Daily Digest", color: "bg-sky-500" },
    { name: "Tech Updates", color: "bg-green-500" },
    { name: "Industry News", color: "bg-purple-500" },
  ]

  const emailLists = [
    { name: "Customers", color: "bg-yellow-500", count: 1243 },
    { name: "Partners", color: "bg-orange-500", count: 87 },
    { name: "Subscribers", color: "bg-red-500", count: 5621 },
  ]

  const emailActivity = {
    openRate: 68,
    clickRate: 42,
    bounceRate: 2.1,
    unsubscribeRate: 0.8,
  }

  const renderPageContent = () => {
    switch (activePage) {
      case "newsletters":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-6">Newsletters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newsletterCategories.map((category, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-sm ${category.color}`}></div>
                    <h3 className="text-white font-medium">{category.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white/80 text-sm">
                      <span>Last sent:</span>
                      <span>2 days ago</span>
                    </div>
                    <div className="flex justify-between text-white/80 text-sm">
                      <span>Subscribers:</span>
                      <span>{Math.floor(Math.random() * 10000)}</span>
                    </div>
                    <div className="flex justify-between text-white/80 text-sm">
                      <span>Open rate:</span>
                      <span>{Math.floor(Math.random() * 30) + 50}%</span>
                    </div>
                  </div>
                  <button
                    className="w-full mt-4 py-2 burgundy-gradient hover:bg-opacity-80 rounded-md text-white text-sm transition-colors"
                    onClick={() => alert(`Editing ${category.name} newsletter`)}
                  >
                    Edit Newsletter
                  </button>
                </div>
              ))}
              <div
                className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => alert("Creating new newsletter")}
              >
                <Plus className="h-8 w-8 text-white/50 mb-2" />
                <p className="text-white/50 text-sm">Create New Newsletter</p>
              </div>
            </div>
          </div>
        )

      case "email-lists":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-6">Email Lists</h2>
            {loading ? (
              <div className="text-white text-center">Loading...</div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-4 text-white/80 font-medium">List Name</th>
                      <th className="text-left p-4 text-white/80 font-medium">Subscribers</th>
                      <th className="text-left p-4 text-white/80 font-medium">Open Rate</th>
                      <th className="text-left p-4 text-white/80 font-medium">Last Updated</th>
                      <th className="text-left p-4 text-white/80 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mailchimpLists.length > 0 ? (
                      mailchimpLists.map((list, index) => {
                        const colors = ["bg-yellow-500", "bg-orange-500", "bg-red-500", "bg-purple-500"]
                        return (
                          <tr key={list.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-sm ${colors[index % colors.length]}`}></div>
                                <span className="text-white">{list.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-white">{list.stats.member_count.toLocaleString()}</td>
                            <td className="p-4 text-white">{(list.stats.open_rate * 100).toFixed(1)}%</td>
                            <td className="p-4 text-white/70">{new Date(list.date_created).toLocaleDateString()}</td>
                            <td className="p-4">
                              <button
                                className="px-3 py-1 burgundy-gradient hover:bg-opacity-80 rounded text-white text-xs transition-colors"
                                onClick={() =>
                                  window.open(`https://admin.mailchimp.com/lists/members/?id=${list.id}`, "_blank")
                                }
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-white/70">
                          {isLoggedIn ? "No email lists found" : "Please log in to view email lists"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="p-4 flex justify-end">
                  <button
                    className="px-4 py-2 burgundy-gradient hover:bg-opacity-80 rounded-md text-white text-sm transition-colors flex items-center gap-2"
                    onClick={() => window.open("https://admin.mailchimp.com/lists/new-list/", "_blank")}
                  >
                    <Plus className="h-4 w-4" />
                    <span>New List</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case "emailing-activity":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-6">Emailing Activity</h2>
            {loading ? (
              <div className="text-white text-center">Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-medium mb-3">Open Rate</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{emailStats.openRate || emailActivity.openRate}%</span>
                      <span className="text-green-400 text-sm mb-1">+2.4%</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{ width: `${emailStats.openRate || emailActivity.openRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-medium mb-3">Click Rate</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{emailStats.clickRate || emailActivity.clickRate}%</span>
                      <span className="text-green-400 text-sm mb-1">+1.7%</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{ width: `${emailStats.clickRate || emailActivity.clickRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-medium mb-3">Bounce Rate</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">{emailStats.bounceRate || emailActivity.bounceRate}%</span>
                      <span className="text-red-400 text-sm mb-1">+0.3%</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${(emailStats.bounceRate || emailActivity.bounceRate) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-medium mb-3">Unsubscribe Rate</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">
                        {emailStats.unsubscribeRate || emailActivity.unsubscribeRate}%
                      </span>
                      <span className="text-green-400 text-sm mb-1">-0.2%</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-orange-500 h-full rounded-full"
                        style={{ width: `${(emailStats.unsubscribeRate || emailActivity.unsubscribeRate) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <h3 className="text-white font-medium mb-4">Recent Campaigns</h3>
                  {campaigns.length > 0 ? (
                    campaigns.slice(0, 3).map((campaign, index) => (
                      <div
                        key={campaign.id}
                        className="flex justify-between items-center p-2 hover:bg-white/5 rounded cursor-pointer"
                        onClick={() =>
                          window.open(`https://admin.mailchimp.com/campaigns/show/?id=${campaign.id}`, "_blank")
                        }
                      >
                        <div>
                          <h4 className="text-white font-medium">{campaign.settings.subject_line}</h4>
                          <p className="text-white/60 text-xs">
                            Sent {new Date(campaign.send_time).toLocaleDateString()} •{" "}
                            {campaign.recipients.recipient_count} recipients
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-white text-sm font-medium">
                              {(campaign.report_summary.open_rate * 100).toFixed(1)}%
                            </div>
                            <div className="text-white/60 text-xs">Open rate</div>
                          </div>
                          <button className="p-2 text-white/70 hover:text-white">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {[
                        { title: "Monthly Newsletter", days: 1, recipients: 3451, openRate: 72 },
                        { title: "Product Update", days: 2, recipients: 2178, openRate: 68 },
                        { title: "Special Offer", days: 3, recipients: 4923, openRate: 79 },
                      ].map((campaign, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 hover:bg-white/5 rounded cursor-pointer"
                          onClick={() => alert(`Viewing details for ${campaign.title}`)}
                        >
                          <div>
                            <h4 className="text-white font-medium">{campaign.title}</h4>
                            <p className="text-white/60 text-xs">
                              Sent {campaign.days} {campaign.days === 1 ? "day" : "days"} ago • {campaign.recipients}{" "}
                              recipients
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-white text-sm font-medium">{campaign.openRate}%</div>
                              <div className="text-white/60 text-xs">Open rate</div>
                            </div>
                            <button
                              className="p-2 text-white/70 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(`Viewing detailed analytics for ${campaign.title}`)
                              }}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )

      default:
        return (
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
              <div className="grid grid-cols-8 border-b border-white/20">
                <div className="p-2 text-center text-white/50 text-xs"></div>
                {weekDays.map((day, i) => (
                  <div key={i} className="p-2 text-center border-l border-white/20">
                    <div className="text-xs text-white/70 font-medium">{day}</div>
                    <div
                      className={`text-lg font-medium mt-1 text-white ${weekDates[i] === 5 ? "burgundy-gradient rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                    >
                      {weekDates[i]}
                    </div>
                  </div>
                ))}
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
          <button onClick={handleMenuClick} className="text-white hover:text-white/80 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-2xl font-bold dripping-text tracking-wide relative">
            Arkmail
            <span className="drip drip-1"></span>
            <span className="drip drip-2"></span>
            <span className="drip drip-3"></span>
            <span className="drip drip-4"></span>
            <span className="drip drip-5"></span>
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
            {isLoggedIn ? "J" : <LogIn className="h-5 w-5" />}
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

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">{currentMonth}</h3>
              <div className="flex gap-1">
                <button className="p-1 rounded-full hover:bg-white/20" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
                <button className="p-1 rounded-full hover:bg-white/20" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-xs text-white/70 font-medium py-1">
                  {day}
                </div>
              ))}

              {miniCalendarDays.map((day, i) => (
                <button
                  key={i}
                  className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                    day === Number.parseInt(currentDate.split(" ")[1])
                      ? "burgundy-gradient text-white"
                      : "text-white hover:bg-white/20"
                  } ${!day ? "invisible" : ""} cursor-pointer`}
                  onClick={() => handleDaySelect(day)}
                  disabled={!day}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-xs">Storage</span>
              <span className="text-white/70 text-xs">7.2 GB of 15 GB used</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-burgundy-500 h-full rounded-full" style={{ width: "48%" }}></div>
            </div>
          </div>
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
              <h2 className="text-xl font-semibold text-white bg-burgundy-500/20 px-4 py-1 rounded-full">
                {currentDate}
              </h2>
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
                <p className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${currentMonth}`}
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
                <div className="flex flex-col">
                  <label className="text-white/70 text-sm mb-1">To:</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                    placeholder="recipient@example.com"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-white/70 text-sm mb-1">Subject:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                    placeholder="Email subject"
                  />
                </div>

                <div className="flex flex-col">
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-burgundy-500 h-64 resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={loading}
                    className="px-4 py-2 burgundy-gradient hover:bg-opacity-80 text-white rounded-md flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{loading ? "Sending..." : "Send"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              <span className="text-white font-medium">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 left-8 z-20 bg-red-500/90 backdrop-blur-lg rounded-xl p-4 border border-red-300/30 max-w-md">
          <div className="flex items-start gap-3">
            <X className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Error</h4>
              <p className="text-white/90 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}