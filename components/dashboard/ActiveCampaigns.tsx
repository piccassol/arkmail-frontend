"use client"

import { Play, Pause, Square, MoreVertical, TrendingUp, Mail, MousePointer, AlertTriangle } from "lucide-react"

export type CampaignStatus = "running" | "paused" | "completed" | "draft"

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  emailsSent: number
  totalEmails: number
  openRate: number
  replyRate: number
  bounceRate: number
  startedAt?: Date
  lastActivity?: Date
}

interface ActiveCampaignsProps {
  campaigns: Campaign[]
  isLoading?: boolean
  onPause?: (campaignId: string) => void
  onResume?: (campaignId: string) => void
  onStop?: (campaignId: string) => void
  onViewDetails?: (campaignId: string) => void
}

// Placeholder data - clearly marked for backend integration
export const PLACEHOLDER_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Q1 Outreach - Series A Startups",
    status: "running",
    emailsSent: 147,
    totalEmails: 500,
    openRate: 42.5,
    replyRate: 8.2,
    bounceRate: 2.1,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: "2",
    name: "Enterprise Leads - Fortune 500",
    status: "running",
    emailsSent: 89,
    totalEmails: 200,
    openRate: 38.2,
    replyRate: 12.4,
    bounceRate: 1.5,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 12), // 12 mins ago
  },
  {
    id: "3",
    name: "Re-engagement Campaign",
    status: "paused",
    emailsSent: 234,
    totalEmails: 350,
    openRate: 28.7,
    replyRate: 4.1,
    bounceRate: 5.2,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "4",
    name: "Product Launch Announcement",
    status: "completed",
    emailsSent: 1250,
    totalEmails: 1250,
    openRate: 51.3,
    replyRate: 15.8,
    bounceRate: 1.2,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
]

const statusColors = {
  running: "bg-green-500/20 text-green-400 border-green-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const statusLabels = {
  running: "Running",
  paused: "Paused",
  completed: "Completed",
  draft: "Draft",
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

export default function ActiveCampaigns({
  campaigns,
  isLoading = false,
  onPause,
  onResume,
  onStop,
  onViewDetails,
}: ActiveCampaignsProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Campaigns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-lg p-4">
              <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
              <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
              <div className="h-2 bg-white/10 rounded-full w-full mb-3" />
              <div className="flex gap-4">
                <div className="h-8 bg-white/10 rounded w-16" />
                <div className="h-8 bg-white/10 rounded w-16" />
                <div className="h-8 bg-white/10 rounded w-16" />
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
        <h3 className="text-lg font-semibold text-white">Active Campaigns</h3>
        <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
          {/* TODO: Replace with real data */}
          PLACEHOLDER DATA
        </span>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No active campaigns</p>
          <p className="text-sm">Start a new campaign to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => {
            const progress = (campaign.emailsSent / campaign.totalEmails) * 100

            return (
              <div
                key={campaign.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{campaign.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[campaign.status]}`}>
                        {statusLabels[campaign.status]}
                      </span>
                      {campaign.lastActivity && (
                        <span className="text-xs text-white/40">
                          Last: {formatTimeAgo(campaign.lastActivity)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                    onClick={() => onViewDetails?.(campaign.id)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                    <span>Progress</span>
                    <span>{campaign.emailsSent} / {campaign.totalEmails} emails</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        campaign.status === "completed"
                          ? "bg-blue-500"
                          : campaign.status === "paused"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-sm font-semibold">{campaign.openRate}%</span>
                    </div>
                    <span className="text-xs text-white/50">Opens</span>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <MousePointer className="h-3 w-3" />
                      <span className="text-sm font-semibold">{campaign.replyRate}%</span>
                    </div>
                    <span className="text-xs text-white/50">Replies</span>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-sm font-semibold">{campaign.bounceRate}%</span>
                    </div>
                    <span className="text-xs text-white/50">Bounces</span>
                  </div>
                </div>

                {/* Actions */}
                {campaign.status !== "completed" && (
                  <div className="flex items-center gap-2">
                    {campaign.status === "running" ? (
                      <button
                        onClick={() => onPause?.(campaign.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => onResume?.(campaign.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                      >
                        <Play className="h-4 w-4" />
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => onStop?.(campaign.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </button>
                  </div>
                )}

                {campaign.status === "completed" && (
                  <div className="text-center py-2 text-sm text-blue-400 bg-blue-500/10 rounded-lg">
                    Campaign completed successfully
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
