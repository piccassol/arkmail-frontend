"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [emailTo, setEmailTo] = useState("")
  const [emails, setEmails] = useState([])
  const [emailActivity, setEmailActivity] = useState({})
  const [newsletters, setNewsletters] = useState([])
  
  useEffect(() => {
    setIsLoaded(true)
    fetchEmails()
    fetchEmailActivity()
    fetchNewsletters()
  }, [])

  const fetchEmails = async () => {
    try {
      const response = await fetch("http://localhost:8000/emails?folder=inbox", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch emails")
      const data = await response.json()
      setEmails(data)
    } catch (error) {
      console.error("Error fetching emails:", error)
    }
  }

  const fetchEmailActivity = async () => {
    try {
      const response = await fetch("http://localhost:8000/analytics/email-activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch email activity")
      const data = await response.json()
      setEmailActivity(data)
    } catch (error) {
      console.error("Error fetching email activity:", error)
    }
  }

  const fetchNewsletters = async () => {
    try {
      const response = await fetch("http://localhost:8000/newsletters", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch newsletters")
      const data = await response.json()
      setNewsletters(data)
    } catch (error) {
      console.error("Error fetching newsletters:", error)
    }
  }

  const handleSendEmail = async () => {
    if (emailTo && emailSubject) {
      try {
        const response = await fetch("http://localhost:8000/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            recipient_ids: [emailTo],
            subject: emailSubject,
            body: emailBody,
            is_draft: false,
          }),
        })

        if (!response.ok) throw new Error("Failed to send email")

        setShowComposeModal(false)
        setEmailTo("")
        setEmailSubject("")
        setEmailBody("")
        alert("Email sent successfully!")
      } catch (error) {
        console.error("Error sending email:", error)
        alert("Failed to send email.")
      }
    } else {
      alert("Please fill in the recipient and subject fields.")
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gray-900 text-white">
      <header className="p-4 flex justify-between items-center bg-gray-800">
        <span className="text-2xl font-bold">PDGmail</span>
        <Search className="w-5 h-5" />
      </header>

      <main className="p-4">
        <button onClick={() => setShowComposeModal(true)} className="p-2 bg-blue-500 rounded">
          Compose
        </button>
        <h2 className="text-xl mt-4">Inbox</h2>
        <ul>
          {emails.map((email) => (
            <li key={email.id} className="p-2 border-b border-gray-700">{email.subject}</li>
          ))}
        </ul>

        <h2 className="text-xl mt-4">Email Activity</h2>
        <p>Open Rate: {emailActivity.openRate}%</p>
        <p>Click Rate: {emailActivity.clickRate}%</p>

        <h2 className="text-xl mt-4">Newsletters</h2>
        <ul>
          {newsletters.map((newsletter) => (
            <li key={newsletter.id} className="p-2 border-b border-gray-700">{newsletter.name}</li>
          ))}
        </ul>
      </main>

      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-bold">New Email</h3>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="Recipient"
              className="w-full p-2 bg-gray-700 rounded mt-2"
            />
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="w-full p-2 bg-gray-700 rounded mt-2"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Message"
              className="w-full p-2 bg-gray-700 rounded mt-2"
            />
            <button onClick={handleSendEmail} className="mt-4 bg-blue-500 p-2 rounded">
              Send
            </button>
            <button onClick={() => setShowComposeModal(false)} className="mt-4 ml-2 bg-red-500 p-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
