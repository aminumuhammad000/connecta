// import dotenv from "dotenv";
// import { ConnectaAgent } from "../agent/connectaAgent.js";
// dotenv.config();
// async function main() {
//   const agent = new ConnectaAgent({
//     apiBaseUrl: "https://your-api-base-url.com", // 👈 Your backend
//     authToken: "Bearer YOUR_AUTH_TOKEN",
//     openaiApiKey: process.env.OPENROUTER_API_KEY!, // 👈 Make sure this is in your .env
//     baseURL: "https://openrouter.ai/api/v1", // 👈 or leave blank for OpenAI
//   });
//   const userMessage = "Update my bio to say I am a fullstack web developer specializing in AI tools.";
//   console.log("🧠 Processing:", userMessage);
//   const response = await agent.process(userMessage);
//   console.log("✅ Response:", response);
// }
// main().catch(console.error);
