"use client"

import { Rocket, List, Search, Upload, Settings, RefreshCw } from "lucide-react"

interface QuickActionsProps {
  onStartCampaign?: () => void
  onViewCampaigns?: () => void
  onOpenLeadFinder?: () => void
  onImportLeads?: () => void
  onOpenSettings?: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function QuickActions({
  onStartCampaign,
  onViewCampaigns,
  onOpenLeadFinder,
  onImportLeads,
  onOpenSettings,
  onRefresh,
  isRefreshing = false,
}: QuickActionsProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Start New Campaign */}
        <button
          onClick={onStartCampaign}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl transition-all duration-200 group"
        >
          <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-white">New Campaign</span>
        </button>

        {/* View All Campaigns */}
        <button
          onClick={onViewCampaigns}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 group"
        >
          <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
            <List className="h-5 w-5 text-white/70" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">All Campaigns</span>
        </button>

        {/* Ark Lead Gen */}
        <button
          onClick={onOpenLeadFinder}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 group"
        >
          <div className="p-3 bg-orange-500/20 rounded-full group-hover:scale-110 transition-transform">
            <Search className="h-5 w-5 text-orange-400" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Lead Finder</span>
          <span className="text-xs text-white/40">Ark Lead Gen</span>
        </button>

        {/* Import Leads */}
        <button
          onClick={onImportLeads}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 group"
        >
          <div className="p-3 bg-green-500/20 rounded-full group-hover:scale-110 transition-transform">
            <Upload className="h-5 w-5 text-green-400" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Import Leads</span>
          <span className="text-xs text-white/40">CSV / Excel</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 group lg:col-span-2"
        >
          <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
            <Settings className="h-5 w-5 text-white/70" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Agent Settings</span>
          <span className="text-xs text-white/40">Configure AI behavior, email templates</span>
        </button>
      </div>
    </div>
  )
}
