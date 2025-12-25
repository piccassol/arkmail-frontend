import { setAuthToken } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://mailapi.arktechnologies.ai";

export async function getBackendToken(user: any): Promise<string | null> {
  if (!user?.primaryEmailAddress?.emailAddress) {
    return null;
  }

  // Check if we have a cached token
  const cachedToken = typeof window !== 'undefined' ? localStorage.getItem('backend_token') : null;
  if (cachedToken) {
    setAuthToken(cachedToken);
    return cachedToken;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.primaryEmailAddress.emailAddress,
        google_id: user.id,
      }),
    });

    if (!response.ok) {
      console.error('Failed to get backend token:', response.statusText);
      return null;
    }

    const data = await response.json();

    // Store the token in localStorage and set it in the API module
    localStorage.setItem('backend_token', data.access_token);
    setAuthToken(data.access_token);

    return data.access_token;
  } catch (error) {
    console.error('Error getting backend token:', error);
    return null;
  }
}

export function clearBackendToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('backend_token');
  }
  setAuthToken(null);
}

/**
 * Get the current auth token from localStorage
 * Use this for API calls - call getBackendToken(user) first to ensure token exists
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('backend_token');
}