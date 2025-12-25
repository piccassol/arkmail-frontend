import { getAuthToken } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://mailapi.arktechnologies.ai'

// Types matching backend schemas
export interface DashboardStats {
  emails_sent_today: number
  emails_sent_week: number
  emails_sent_total: number
  reply_rate: number
  reply_rate_trend: 'up' | 'down' | 'neutral'
  reply_rate_change: number
  meetings_booked: number
  meetings_booked_trend: 'up' | 'down' | 'neutral'
  meetings_booked_change: number
  active_leads: number
  active_leads_trend: 'up' | 'down' | 'neutral'
  active_leads_change: number
}

export interface AgentActivity {
  id: string
  user_id: string
  campaign_id: string | null
  activity_type: string
  description: string | null
  recipient_email: string | null
  recipient_name: string | null
  campaign_name: string | null
  created_at: string
}

export interface Campaign {
  id: string
  user_id: string
  name: string
  description: string | null
  status: 'draft' | 'running' | 'paused' | 'completed'
  total_leads: number
  sent_count: number
  open_count: number
  reply_count: number
  bounce_count: number
  open_rate: number
  reply_rate: number
  bounce_rate: number
  subject_template: string | null
  body_template: string | null
  created_at: string
  updated_at: string | null
  started_at: string | null
  completed_at: string | null
}

export interface CampaignCreate {
  name: string
  description?: string
  subject_template?: string
  body_template?: string
}

export interface Lead {
  email: string
  name?: string
  company?: string
  title?: string
}

export interface CampaignsSummary {
  total: number
  running: number
  paused: number
  completed: number
  draft: number
}

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch stats' }))
    throw new Error(error.detail || 'Failed to fetch stats')
  }

  return res.json()
}

/**
 * Fetch agent activities
 */
export async function fetchActivities(limit = 50): Promise<AgentActivity[]> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/dashboard/activities?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch activities' }))
    throw new Error(error.detail || 'Failed to fetch activities')
  }

  return res.json()
}

/**
 * Fetch campaigns summary (counts by status)
 */
export async function fetchCampaignsSummary(): Promise<CampaignsSummary> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/dashboard/campaigns/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch summary' }))
    throw new Error(error.detail || 'Failed to fetch summary')
  }

  return res.json()
}

/**
 * Fetch all campaigns
 */
export async function fetchCampaigns(status?: string): Promise<Campaign[]> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const url = status
    ? `${API_BASE}/api/campaigns?status=${status}`
    : `${API_BASE}/api/campaigns`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch campaigns' }))
    throw new Error(error.detail || 'Failed to fetch campaigns')
  }

  return res.json()
}

/**
 * Get a single campaign by ID
 */
export async function fetchCampaign(campaignId: string): Promise<Campaign> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Campaign not found' }))
    throw new Error(error.detail || 'Campaign not found')
  }

  return res.json()
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: CampaignCreate): Promise<Campaign> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to create campaign' }))
    throw new Error(error.detail || 'Failed to create campaign')
  }

  return res.json()
}

/**
 * Update campaign status (pause, resume, stop)
 */
export async function updateCampaignStatus(
  campaignId: string,
  status: 'running' | 'paused' | 'completed'
): Promise<Campaign> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to update campaign' }))
    throw new Error(error.detail || 'Failed to update campaign')
  }

  return res.json()
}

/**
 * Start a campaign
 */
export async function startCampaign(campaignId: string): Promise<Campaign> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to start campaign' }))
    throw new Error(error.detail || 'Failed to start campaign')
  }

  return res.json()
}

/**
 * Pause a campaign
 */
export async function pauseCampaign(campaignId: string): Promise<Campaign> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/pause`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to pause campaign' }))
    throw new Error(error.detail || 'Failed to pause campaign')
  }

  return res.json()
}

/**
 * Stop a campaign
 */
export async function stopCampaign(campaignId: string): Promise<Campaign> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/stop`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to stop campaign' }))
    throw new Error(error.detail || 'Failed to stop campaign')
  }

  return res.json()
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to delete campaign' }))
    throw new Error(error.detail || 'Failed to delete campaign')
  }
}

/**
 * Add leads to a campaign
 */
export async function addLeadsToCampaign(campaignId: string, leads: Lead[]): Promise<any[]> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/leads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ leads })
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to add leads' }))
    throw new Error(error.detail || 'Failed to add leads')
  }

  return res.json()
}

/**
 * Fetch leads for a campaign
 */
export async function fetchCampaignLeads(campaignId: string, status?: string): Promise<any[]> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const url = status
    ? `${API_BASE}/api/campaigns/${campaignId}/leads?status=${status}`
    : `${API_BASE}/api/campaigns/${campaignId}/leads`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch leads' }))
    throw new Error(error.detail || 'Failed to fetch leads')
  }

  return res.json()
}
