import dotenv from "dotenv";
import { ConnectaAgent } from "./agent"; // adjust path if needed

// Load environment variables
dotenv.config();

async function main() {
  const agent = new ConnectaAgent({
    apiBaseUrl: "http://localhost:5000",
    authToken: "test-auth-token",
    openaiApiKey: process.env.OPENROUTER_API_KEY || "your-fallback-api-key",
    mockMode: false,
    userId: "68fc1d4fbea3f44d815cc272",
  });

  const input = "who are you?";

  const result = await agent.process(input);

  console.log("✅ Agent response:", result);
}

main().catch(console.error);
