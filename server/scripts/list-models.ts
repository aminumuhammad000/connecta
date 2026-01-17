
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API Key missing");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Unfortunately standard SDK doesn't expose listModels easily in node,
        // but we can try a simple fetch if SDK fails.
        // Let's try to just generate content with a "safe" model first.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

listModels();
