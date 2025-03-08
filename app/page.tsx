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
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePage, setActivePage] = useState("inbox")
  const [inboxMessages, setInboxMessages] = useState([])
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [emailTo, setEmailTo] = useState("")

  useEffect(() => {
    setIsLoaded(true)
    fetchInboxMessages()
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text = "Looks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials?"
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

  const fetchInboxMessages = async () => {
    try {
      const response = await fetch("https://pdg-ai-emailing.onrender.com/api/inbox")
      const data = await response.json()
      setInboxMessages(data)
    } catch (error) {
      console.error("Error fetching inbox messages:", error)
    }
  }

  const handleSendEmail = async () => {
    if (emailTo && emailSubject) {
      try {
        const response = await fetch("https://pdg-ai-emailing.onrender.com/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody })
        })
        
        if (response.ok) {
          alert("Email sent successfully!")
          setShowComposeModal(false)
          setEmailTo("")
          setEmailSubject("")
          setEmailBody("")
        } else {
          alert("Failed to send email.")
        }
      } catch (error) {
        console.error("Error sending email:", error)
        alert("An error occurred while sending email.")
      }
    } else {
      alert("Please fill in the recipient and subject fields.")
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/64F5502D-D3B7-4D38-9542-B7B6A829B396-ENJk5YFoodoqkBcGJkaK84WmFvX0qr.jpeg" alt="Background" fill className="object-cover" priority />
      <main className="relative h-screen w-full pt-20 flex">
        <div className="w-64 h-full bg-white/10 backdrop-blur-lg p-4">
          <button onClick={() => setShowComposeModal(true)} className="mb-6 flex items-center justify-center px-4 py-3 text-white">
            <Plus className="h-5 w-5" /> Compose
          </button>
          <div>
            {inboxMessages.map((msg, index) => (
              <div key={index} className="p-3 border-b border-gray-700">
                <h4 className="text-white">{msg.subject}</h4>
                <p className="text-gray-400 text-sm">{msg.sender}</p>
              </div>
            ))}
          </div>
        </div>
        {showComposeModal && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-white">New Message</h3>
              <input type="email" placeholder="To" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="w-full p-2 mt-2" />
              <input type="text" placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full p-2 mt-2" />
              <textarea placeholder="Message" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full p-2 mt-2 h-32" />
              <button onClick={handleSendEmail} className="bg-blue-500 px-4 py-2 mt-3 text-white">Send</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
