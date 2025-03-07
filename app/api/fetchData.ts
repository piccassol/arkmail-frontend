export const fetchData = async (endpoint: string) => {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://pdg-ai-emailing.onrender.com";

        const response = await fetch(`${API_BASE_URL}/${endpoint}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("⚠️ API request failed:", error);
        return { message: "API not available yet." };
    }
};
