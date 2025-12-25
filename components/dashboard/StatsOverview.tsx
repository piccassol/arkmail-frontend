"use client"

import { Mail, Reply, Calendar, Users, TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface DashboardStats {
  emailsSentToday: number
  emailsSentWeek: number
  emailsSentTotal: number
  replyRate: number
  replyRateTrend: "up" | "down" | "neutral"
  replyRateChange: number
  meetingsBooked: number
  meetingsBookedTrend: "up" | "down" | "neutral"
  meetingsBookedChange: number
  activeLeads: number
  activeLeadsTrend: "up" | "down" | "neutral"
  activeLeadsChange: number
}

interface StatsOverviewProps {
  stats: DashboardStats
  isLoading?: boolean
}

// Placeholder data - clearly marked for backend integration
export const PLACEHOLDER_STATS: DashboardStats = {
  emailsSentToday: 47,
  emailsSentWeek: 312,
  emailsSentTotal: 2847,
  replyRate: 8.7,
  replyRateTrend: "up",
  replyRateChange: 2.3,
  meetingsBooked: 12,
  meetingsBookedTrend: "up",
  meetingsBookedChange: 4,
  activeLeads: 156,
  activeLeadsTrend: "neutral",
  activeLeadsChange: 0,
}

function TrendIndicator({ trend, change }: { trend: "up" | "down" | "neutral"; change: number }) {
  if (trend === "neutral") {
    return (
      <span className="flex items-center gap-1 text-xs text-white/50">
        <Minus className="h-3 w-3" />
        No change
      </span>
    )
  }

  if (trend === "up") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <TrendingUp className="h-3 w-3" />
        +{change}% from last week
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <TrendingDown className="h-3 w-3" />
      -{change}% from last week
    </span>
  )
}

export default function StatsOverview({ stats, isLoading = false }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="h-4 bg-white/10 rounded w-24 mb-4" />
            <div className="h-8 bg-white/10 rounded w-16 mb-2" />
            <div className="h-3 bg-white/10 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Overview</h3>
        <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
          {/* TODO: Replace with real data */}
          PLACEHOLDER DATA
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Emails Sent */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-2 text-white/70 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Mail className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm">Emails Sent</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{stats.emailsSentToday}</span>
              <span className="text-sm text-white/50">today</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span>{stats.emailsSentWeek} this week</span>
              <span className="text-white/30">|</span>
              <span>{stats.emailsSentTotal.toLocaleString()} total</span>
            </div>
          </div>
        </div>

        {/* Reply Rate */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-2 text-white/70 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Reply className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-sm">Reply Rate</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{stats.replyRate}</span>
              <span className="text-xl text-white/70">%</span>
            </div>
            <TrendIndicator trend={stats.replyRateTrend} change={stats.replyRateChange} />
          </div>
        </div>

        {/* Meetings Booked */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-2 text-white/70 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-sm">Meetings Booked</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{stats.meetingsBooked}</span>
              <span className="text-sm text-white/50">this week</span>
            </div>
            <TrendIndicator trend={stats.meetingsBookedTrend} change={stats.meetingsBookedChange} />
          </div>
        </div>

        {/* Active Leads */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-2 text-white/70 mb-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Users className="h-4 w-4 text-yellow-400" />
            </div>
            <span className="text-sm">Active Leads</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{stats.activeLeads}</span>
              <span className="text-sm text-white/50">in pipeline</span>
            </div>
            <TrendIndicator trend={stats.activeLeadsTrend} change={stats.activeLeadsChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
