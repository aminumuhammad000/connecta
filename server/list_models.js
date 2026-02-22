import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("--- Listing Models ---");
        // Using raw fetch if SDK doesn't have listModels easily exposed in this version
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            data.models.forEach(m => {
                console.log(`${m.name} - ${m.supportedGenerationMethods}`);
            });
        } else {
            console.log("No models found or error:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
