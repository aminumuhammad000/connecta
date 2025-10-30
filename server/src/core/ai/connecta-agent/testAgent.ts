import dotenv from "dotenv";
import { ConnectaAgent } from "./agent"; // adjust path if needed

// Load environment variables
dotenv.config();

async function main() {
  const agent = new ConnectaAgent({
    apiBaseUrl: "http://localhost:5000", // replace with your backend URL
    authToken: "test-auth-token",
    userId: "YOUR_USER_ID_HERE", // Replace with actual user/profile ID
    openaiApiKey: process.env.OPENROUTER_API_KEY || "your-fallback-api-key",
    mockMode: false, // Disabled - will use real API
  });

  const input = "Update my bio to say I am an AI developer passionate about automation";

  const result = await agent.process(input);

  console.log("✅ Agent response:", result);
}

main().catch(console.error);
