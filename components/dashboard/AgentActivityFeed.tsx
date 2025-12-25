"use client"

import { useEffect, useRef } from "react"
import { Mail, Reply, Clock, CheckCircle, AlertCircle, Send, UserPlus } from "lucide-react"

export interface AgentActivity {
  id: string
  type: "email_sent" | "reply_received" | "followup_scheduled" | "bounce" | "lead_added" | "meeting_booked"
  timestamp: Date
  recipient?: string
  recipientEmail?: string
  campaignName?: string
  subject?: string
  message?: string
}

interface AgentActivityFeedProps {
  activities: AgentActivity[]
  isLoading?: boolean
  maxHeight?: string
}

// Placeholder data - clearly marked for backend integration
export const PLACEHOLDER_ACTIVITIES: AgentActivity[] = [
  {
    id: "1",
    type: "email_sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
    recipient: "Sarah Chen",
    recipientEmail: "sarah.chen@techcorp.io",
    campaignName: "Q1 Outreach - Series A Startups",
    subject: "Quick question about TechCorp's growth plans"
  },
  {
    id: "2",
    type: "reply_received",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    recipient: "Marcus Johnson",
    recipientEmail: "m.johnson@innovate.co",
    campaignName: "Q1 Outreach - Series A Startups",
    message: "Thanks for reaching out! I'd love to learn more..."
  },
  {
    id: "3",
    type: "followup_scheduled",
    timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 mins ago
    recipient: "Emily Rodriguez",
    recipientEmail: "emily@startupxyz.com",
    campaignName: "Q1 Outreach - Series A Startups",
    message: "Follow-up #2 scheduled for tomorrow 9:00 AM"
  },
  {
    id: "4",
    type: "meeting_booked",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    recipient: "David Park",
    recipientEmail: "david.park@ventureco.com",
    campaignName: "Enterprise Leads",
    message: "Discovery call booked for Jan 3, 2025 at 2:00 PM"
  },
  {
    id: "5",
    type: "bounce",
    timestamp: new Date(Date.now() - 1000 * 60 * 22), // 22 mins ago
    recipient: "Unknown",
    recipientEmail: "old.contact@defunct.com",
    campaignName: "Re-engagement Campaign",
    message: "Email bounced - invalid address"
  },
  {
    id: "6",
    type: "lead_added",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    recipient: "Jennifer Walsh",
    recipientEmail: "j.walsh@growthio.com",
    campaignName: "Ark Lead Gen Import",
    message: "New lead added from Ark Lead Gen"
  },
  {
    id: "7",
    type: "email_sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
    recipient: "Michael Torres",
    recipientEmail: "mtorres@scaleup.io",
    campaignName: "Q1 Outreach - Series A Startups",
    subject: "Helping ScaleUp automate their outreach"
  },
  {
    id: "8",
    type: "reply_received",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    recipient: "Lisa Kim",
    recipientEmail: "lisa@nextstep.co",
    campaignName: "Enterprise Leads",
    message: "Not interested at this time, but please check back in Q2"
  },
]

const activityIcons = {
  email_sent: <Send className="h-4 w-4" />,
  reply_received: <Reply className="h-4 w-4" />,
  followup_scheduled: <Clock className="h-4 w-4" />,
  bounce: <AlertCircle className="h-4 w-4" />,
  lead_added: <UserPlus className="h-4 w-4" />,
  meeting_booked: <CheckCircle className="h-4 w-4" />,
}

const activityColors = {
  email_sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  reply_received: "bg-green-500/20 text-green-400 border-green-500/30",
  followup_scheduled: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  bounce: "bg-red-500/20 text-red-400 border-red-500/30",
  lead_added: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  meeting_booked: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
}

const activityLabels = {
  email_sent: "Email Sent",
  reply_received: "Reply Received",
  followup_scheduled: "Follow-up Scheduled",
  bounce: "Bounced",
  lead_added: "Lead Added",
  meeting_booked: "Meeting Booked",
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function AgentActivityFeed({
  activities,
  isLoading = false,
  maxHeight = "500px"
}: AgentActivityFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to top when new activities come in
  useEffect(() => {
    if (feedRef.current && activities.length > 0) {
      feedRef.current.scrollTop = 0
    }
  }, [activities.length])

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Agent Activity
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-8 h-8 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Agent Activity
          <span className="text-xs text-white/50 font-normal ml-2">Live</span>
        </h3>
        <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
          {/* TODO: Replace with real data */}
          PLACEHOLDER DATA
        </span>
      </div>

      <div
        ref={feedRef}
        className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{ maxHeight }}
      >
        {activities.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Agent activities will appear here in real-time</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              <div className={`p-2 rounded-full border ${activityColors[activity.type]}`}>
                {activityIcons[activity.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${activityColors[activity.type]}`}>
                    {activityLabels[activity.type]}
                  </span>
                  <span className="text-xs text-white/40">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>

                <div className="mt-1">
                  {activity.recipient && (
                    <p className="text-sm text-white font-medium truncate">
                      {activity.recipient}
                      {activity.recipientEmail && (
                        <span className="text-white/50 font-normal ml-1">
                          ({activity.recipientEmail})
                        </span>
                      )}
                    </p>
                  )}

                  {activity.subject && (
                    <p className="text-sm text-white/70 truncate">
                      Subject: {activity.subject}
                    </p>
                  )}

                  {activity.message && (
                    <p className="text-sm text-white/70 truncate">
                      {activity.message}
                    </p>
                  )}

                  {activity.campaignName && (
                    <p className="text-xs text-white/40 mt-1">
                      Campaign: {activity.campaignName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
