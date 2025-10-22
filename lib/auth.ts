export async function getBackendToken(user: any): Promise<string | null> {
  if (!user?.primaryEmailAddress?.emailAddress) {
    return null;
  }

  try {
    const response = await fetch('https://arkmail-api.onrender.com/api/auth/google-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.primaryEmailAddress.emailAddress,
        google_id: user.id, // Use Clerk user ID
      }),
    });

    if (!response.ok) {
      console.error('Failed to get backend token:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Store the token in localStorage for future use
    localStorage.setItem('backend_token', data.access_token);
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting backend token:', error);
    return null;
  }
}