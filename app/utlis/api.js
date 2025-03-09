const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://your-backend-url.com";

export const sendEmail = async (to, subject, body) => {
  try {
    const response = await fetch(`${API_BASE_URL}/emails/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        recipient_ids: to,
        subject: subject,
        body: body,
        is_draft: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
