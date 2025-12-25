"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk, SignInButton } from '@clerk/nextjs'
import { getBackendToken } from '@/lib/auth'
import {
  Search,
  Settings,
  Menu,
  Bot,
  LayoutDashboard,
  Mail,
  FileText,
  BarChart2,
} from "lucide-react"

// Dashboard components
import {
  AgentActivityFeed,
  ActiveCampaigns,
  StatsOverview,
  QuickActions,
  CreateCampaignModal,
  PLACEHOLDER_ACTIVITIES,
  PLACEHOLDER_CAMPAIGNS,
  PLACEHOLDER_STATS,
} from '@/components/dashboard'
import type { AgentActivity, Campaign, DashboardStats } from '@/components/dashboard'

// API functions
import {
  fetchDashboardStats,
  fetchActivities,
  fetchCampaigns,
  pauseCampaign,
  startCampaign,
  stopCampaign,
  type DashboardStats as ApiDashboardStats,
  type AgentActivity as ApiAgentActivity,
  type Campaign as ApiCampaign,
} from '@/lib/api/dashboard'

export default function Home() {
  const router = useRouter()
  const { user, isLoaded: isClerkLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const [isLoaded, setIsLoaded] = useState(false)
  const [activePage, setActivePage] = useState("dashboard")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Dashboard state - using placeholder data initially
  // TODO: Replace with real API calls when backend is ready
  const [activities, setActivities] = useState<AgentActivity[]>(PLACEHOLDER_ACTIVITIES)
  const [campaigns, setCampaigns] = useState<Campaign[]>(PLACEHOLDER_CAMPAIGNS)
  const [stats, setStats] = useState<DashboardStats>(PLACEHOLDER_STATS)
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)

  // Initialize backend token when user is authenticated
  useEffect(() => {
    if (user) {
      getBackendToken(user)
    }
  }, [user])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Load dashboard data from API
  const loadDashboardData = useCallback(async () => {
    if (!user) return

    setIsLoadingStats(true)
    setIsLoadingActivities(true)
    setIsLoadingCampaigns(true)

    try {
      const [statsData, activitiesData, campaignsData] = await Promise.all([
        fetchDashboardStats(),
        fetchActivities(),
        fetchCampaigns()
      ])

      // Map API data to component types
      setStats({
        emailsSentToday: statsData.emails_sent_today,
        emailsSentWeek: statsData.emails_sent_week,
        emailsSentTotal: statsData.emails_sent_total,
        replyRate: statsData.reply_rate,
        replyRateTrend: statsData.reply_rate_trend,
        replyRateChange: statsData.reply_rate_change,
        meetingsBooked: statsData.meetings_booked,
        meetingsBookedTrend: statsData.meetings_booked_trend,
        meetingsBookedChange: statsData.meetings_booked_change,
        activeLeads: statsData.active_leads,
        activeLeadsTrend: statsData.active_leads_trend,
        activeLeadsChange: statsData.active_leads_change,
      })

      setActivities(activitiesData.map((a: ApiAgentActivity) => ({
        id: a.id,
        type: a.activity_type as any,
        message: a.description || `${a.activity_type} activity`,
        timestamp: a.created_at,
        campaignName: a.campaign_name || undefined,
        recipientEmail: a.recipient_email || undefined,
        recipientName: a.recipient_name || undefined,
      })))

      setCampaigns(campaignsData.map((c: ApiCampaign) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        progress: c.total_leads > 0 ? Math.round((c.sent_count / c.total_leads) * 100) : 0,
        sent: c.sent_count,
        total: c.total_leads,
        opens: c.open_count,
        replies: c.reply_count,
        openRate: c.open_rate,
        replyRate: c.reply_rate,
      })))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Keep placeholder data on error
    } finally {
      setIsLoadingStats(false)
      setIsLoadingActivities(false)
      setIsLoadingCampaigns(false)
    }
  }, [user])

  // Load data on mount and when user changes
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      loadDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [user, loadDashboardData])

  // Show loading while Clerk initializes
  if (!isClerkLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700 text-center">
          <img src="/logo.jpg" alt="Arkmail" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">ArkMail Agent Dashboard</h1>
          <p className="text-gray-400 mb-6">Monitor your AI email agents in real-time</p>
          <SignInButton mode="redirect">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    )
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleSettings = () => {
    console.log("Opening settings")
  }

  const handleLogout = async () => {
    await clerkSignOut()
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDashboardData()
    setIsRefreshing(false)
  }

  // Campaign actions - connected to real backend
  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign(campaignId)
      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, status: "paused" as const } : c
      ))
    } catch (error) {
      console.error("Failed to pause campaign:", error)
    }
  }

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      await startCampaign(campaignId)
      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, status: "running" as const } : c
      ))
    } catch (error) {
      console.error("Failed to resume campaign:", error)
    }
  }

  const handleStopCampaign = async (campaignId: string) => {
    try {
      await stopCampaign(campaignId)
      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, status: "completed" as const } : c
      ))
    } catch (error) {
      console.error("Failed to stop campaign:", error)
    }
  }

  const handleViewCampaignDetails = (campaignId: string) => {
    console.log("View campaign details:", campaignId)
    // TODO: Navigate to campaign details page
  }

  // Quick action handlers
  const handleStartCampaign = () => {
    setIsCreateCampaignOpen(true)
  }

  const handleViewAllCampaigns = () => {
    console.log("View all campaigns")
    router.push("/campaigns")
  }

  const handleOpenLeadFinder = () => {
    console.log("Open Ark Lead Gen")
    // TODO: Open lead finder modal/page
  }

  const handleImportLeads = () => {
    console.log("Import leads")
    // TODO: Open import modal
  }

  const handleOpenSettings = () => {
    console.log("Open agent settings")
    // TODO: Open settings modal/page
  }

  const navPages = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "campaigns", name: "Campaigns", icon: <Bot className="h-5 w-5" /> },
    { id: "inbox", name: "Inbox", icon: <Mail className="h-5 w-5" />, href: "/inbox" },
    { id: "newsletters", name: "Newsletters", icon: <FileText className="h-5 w-5" />, href: "/newsletters" },
    { id: "analytics", name: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
  ]

  const renderMainContent = () => {
    if (activePage === "dashboard") {
      return (
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Overview */}
          <StatsOverview stats={stats} isLoading={isLoadingStats} />

          {/* Main Grid: Activity Feed + Quick Actions on left, Campaigns on right */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column: Activity Feed + Quick Actions */}
            <div className="xl:col-span-1 space-y-6">
              <QuickActions
                onStartCampaign={handleStartCampaign}
                onViewCampaigns={handleViewAllCampaigns}
                onOpenLeadFinder={handleOpenLeadFinder}
                onImportLeads={handleImportLeads}
                onOpenSettings={handleOpenSettings}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
              <AgentActivityFeed
                activities={activities}
                isLoading={isLoadingActivities}
                maxHeight="400px"
              />
            </div>

            {/* Right Column: Active Campaigns */}
            <div className="xl:col-span-2">
              <ActiveCampaigns
                campaigns={campaigns}
                isLoading={isLoadingCampaigns}
                onPause={handlePauseCampaign}
                onResume={handleResumeCampaign}
                onStop={handleStopCampaign}
                onViewDetails={handleViewCampaignDetails}
              />
            </div>
          </div>
        </div>
      )
    }

    if (activePage === "campaigns") {
      return (
        <div className="flex-1 overflow-auto p-6">
          <ActiveCampaigns
            campaigns={campaigns}
            isLoading={isLoadingCampaigns}
            onPause={handlePauseCampaign}
            onResume={handleResumeCampaign}
            onStop={handleStopCampaign}
            onViewDetails={handleViewCampaignDetails}
          />
        </div>
      )
    }

    if (activePage === "analytics") {
      return (
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <StatsOverview stats={stats} isLoading={isLoadingStats} />
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Analytics</h3>
            <div className="text-center py-12 text-white/50">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Detailed analytics coming soon</p>
              <p className="text-sm">Charts and graphs for campaign performance will be displayed here</p>
              <span className="inline-block mt-4 text-xs bg-white/10 px-3 py-1 rounded">
                AWAITING BACKEND INTEGRATION
              </span>
            </div>
          </div>
        </div>
      )
    }

    // For pages that navigate away, show redirect
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/50">
          <p>Navigating...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 -z-10" />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-4 opacity-0 ${isLoaded ? "animate-fade-in" : ""} bg-white/10 backdrop-blur-lg border-b border-white/10`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => console.log("menu")} className="text-white hover:text-white/80 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-14 w-14" />
            <div>
              <span className="text-xl font-bold text-white tracking-wide">
                
              </span>
              <span className="ml-2 text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">
                Agent Dashboard
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              name="search"
              placeholder="Search campaigns, leads..."
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
            />
          </form>
          <button onClick={handleSettings} className="text-white hover:text-white/80 transition-colors p-2 hover:bg-white/10 rounded-lg">
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={handleLogout}
            className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md hover:from-purple-500 hover:to-blue-500 transition-colors"
          >
            {user.firstName?.charAt(0)?.toUpperCase() || "U"}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="relative min-h-screen w-full pt-16 flex">
        {/* Sidebar */}
        <div
          className={`w-64 min-h-screen bg-white/5 backdrop-blur-lg p-4 border-r border-white/10 opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col`}
          style={{ animationDelay: "0.4s" }}
        >
          {/* Agent Status Indicator */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-green-400" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Agent Active</div>
                <div className="text-xs text-green-400">Processing campaigns</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1">
            {navPages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  if (page.href) {
                    router.push(page.href)
                  } else {
                    setActivePage(page.id)
                  }
                }}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg transition-colors text-left ${
                  activePage === page.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {page.icon}
                <span>{page.name}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-white text-sm p-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold">
                {user.firstName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user.fullName || user.firstName}</div>
                <div className="text-xs text-white/50 truncate">{user.primaryEmailAddress?.emailAddress}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {renderMainContent()}
        </div>
      </main>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  )
}
