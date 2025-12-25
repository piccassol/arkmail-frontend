// Token will be set by the app when Clerk auth is ready
let clerkToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  clerkToken = token;
};

export const getAuthToken = () => clerkToken;

// Your backend URL - same backend for auth and emails
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://mailapi.arktechnologies.ai";

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Generic API request handler with authentication
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add auth token if required
  if (requireAuth && clerkToken) {
    headers["Authorization"] = `Bearer ${clerkToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==================== TYPE DEFINITIONS ====================

export interface Email {
  id: number;
  subject: string;
  body: string;
  recipient: string;
  sender_id: string;
  sender_email?: string;
  is_sent: boolean;
  is_draft: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EmailCreate {
  subject: string;
  body: string;
  recipient: string;
  is_draft?: boolean;
}

export interface EmailUpdate {
  subject?: string;
  body?: string;
  is_archived?: boolean;
  is_deleted?: boolean;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ==================== EMAIL API ====================

export const emailApi = {
  /**
   * Send a new email
   */
  send: (data: EmailCreate) =>
    apiRequest<Email>("/api/emails/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Get inbox emails (received)
   */
  getInbox: (skip = 0, limit = 50) =>
    apiRequest<Email[]>(`/api/emails/inbox?skip=${skip}&limit=${limit}`),

  /**
   * Get sent emails
   */
  getSent: (skip = 0, limit = 50) =>
    apiRequest<Email[]>(`/api/emails/sent?skip=${skip}&limit=${limit}`),

  /**
   * Get draft emails
   */
  getDrafts: (skip = 0, limit = 50) =>
    apiRequest<Email[]>(`/api/emails/drafts?skip=${skip}&limit=${limit}`),

  /**
   * Get archived emails
   */
  getArchived: (skip = 0, limit = 50) =>
    apiRequest<Email[]>(`/api/emails/archived?skip=${skip}&limit=${limit}`),

  /**
   * Get trash (deleted emails)
   */
  getTrash: (skip = 0, limit = 50) =>
    apiRequest<Email[]>(`/api/emails/trash?skip=${skip}&limit=${limit}`),

  /**
   * Get single email by ID
   */
  getById: (id: number) => apiRequest<Email>(`/api/emails/${id}`),

  /**
   * Update email (generic)
   */
  update: (id: number, data: EmailUpdate) =>
    apiRequest<Email>(`/api/emails/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /**
   * Delete email permanently
   */
  delete: (id: number) =>
    apiRequest<void>(`/api/emails/${id}`, {
      method: "DELETE",
    }),

  /**
   * Archive email
   */
  archive: (id: number) =>
    apiRequest<Email>(`/api/emails/${id}/archive`, {
      method: "POST",
    }),

  /**
   * Move email to trash
   */
  moveToTrash: (id: number) =>
    apiRequest<Email>(`/api/emails/${id}/trash`, {
      method: "POST",
    }),

  /**
   * Restore email from trash
   */
  restore: (id: number) =>
    apiRequest<Email>(`/api/emails/${id}/restore`, {
      method: "POST",
    }),
};

// ==================== AUTH API ====================

export const authApi = {
  /**
   * Login user
   */
  login: (data: LoginRequest) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      requireAuth: false,
    }),

  /**
   * Register new user
   */
  signup: (data: SignupRequest) =>
    apiRequest<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
      requireAuth: false,
    }),

  /**
   * Get current user info
   */
  getCurrentUser: () => apiRequest<User>("/api/auth/me"),
};

// ==================== NEWSLETTER API ====================

export interface Newsletter {
  id: number;
  title: string;
  content?: string;
  owner_id: string;
  created_at?: string;
}

export interface NewsletterCreate {
  title: string;
  content?: string;
}

export const newsletterApi = {
  /**
   * Get all newsletters
   */
  getAll: (skip = 0, limit = 50) =>
    apiRequest<Newsletter[]>(`/api/newsletters/?skip=${skip}&limit=${limit}`),

  /**
   * Get newsletter by ID
   */
  getById: (id: number) =>
    apiRequest<Newsletter>(`/api/newsletters/${id}`),

  /**
   * Create/send newsletter
   */
  send: (data: NewsletterCreate) =>
    apiRequest<Newsletter>("/api/newsletters/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Delete newsletter
   */
  delete: (id: number) =>
    apiRequest<void>(`/api/newsletters/${id}`, {
      method: "DELETE",
    }),
};

// ==================== AI API ====================

export interface ComposeRequest {
  prompt: string;
  tone?: string;
}

export interface ImproveRequest {
  text: string;
  instruction?: string;
}

export interface SubjectLinesRequest {
  email_body: string;
  count?: number;
}

export interface SummarizeRequest {
  email_body: string;
}

export interface SmartRepliesRequest {
  email_body: string;
  count?: number;
}

export const aiApi = {
  /**
   * Generate email draft from prompt
   */
  compose: (data: ComposeRequest) =>
    apiRequest<{ content: string }>("/api/ai/compose", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Improve or rewrite text
   */
  improve: (data: ImproveRequest) =>
    apiRequest<{ content: string }>("/api/ai/improve", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Generate subject line options
   */
  generateSubjectLines: (data: SubjectLinesRequest) =>
    apiRequest<{ subject_lines: string[] }>("/api/ai/subject-lines", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Summarize email content
   */
  summarize: (data: SummarizeRequest) =>
    apiRequest<{ summary: string }>("/api/ai/summarize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Generate smart reply suggestions
   */
  smartReplies: (data: SmartRepliesRequest) =>
    apiRequest<{ replies: string[] }>("/api/ai/smart-replies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () =>
  apiRequest<{ status: string; service: string; database: string }>("/health", {
    requireAuth: false,
  });