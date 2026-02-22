import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key");
        return;
    }

    console.log("--- Testing Gemini ---");

    const configs = [
        { model: "models/gemini-1.5-flash", apiVersion: "v1" },
        { model: "models/gemini-1.5-flash", apiVersion: "v1beta" },
        { model: "models/gemini-pro", apiVersion: "v1beta" }
    ];

    for (const config of configs) {
        console.log(`\nTesting: ${JSON.stringify(config)}`);
        try {
            const llm = new ChatGoogleGenerativeAI({
                apiKey,
                ...config
            });
            const res = await llm.invoke("Hello, say 'Test OK'");
            console.log("Result:", res.content);
        } catch (error) {
            console.error("Error:", error.message);
        }
    }
}

testGemini();
