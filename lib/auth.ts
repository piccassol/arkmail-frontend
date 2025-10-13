export async function getBackendToken(session: any): Promise<string | null> {
  if (!session?.user?.email) {
    return null;
  }

  try {
    const response = await fetch('https://arkmail-api.onrender.com/api/auth/google-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        name: session.user.name || session.user.email,
        google_id: session.user.email, // Using email as google_id for simplicity
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