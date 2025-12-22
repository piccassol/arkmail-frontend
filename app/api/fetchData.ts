export const fetchData = async (endpoint: string) => {
  try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://arkmail-api.onrender.com";

      const response = await fetch(`${API_BASE_URL}/${endpoint}`);

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
  } catch (error) {
      console.error("API request failed:", error);
      return { message: "API not available yet." };
  }
};

export async function sendEmail({
  to,
  subject,
  html,
  token,
}: {
  to: string;
  subject: string;
  html: string;
  token: string;
}) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://arkmail-api.onrender.com";
    const response = await fetch(`${API_BASE_URL}/api/emails/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ recipient: to, subject, body: html }),
    });

    // Accept both 200 and 201 as success
    if (response.status !== 200 && response.status !== 201) {
      const errorData = await response.text();
      console.error('Email send error:', errorData);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}