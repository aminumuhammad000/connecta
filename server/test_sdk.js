import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

async function testSDK() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key");
        return;
    }

    console.log("--- Testing Official SDK ---");
    const genAI = new GoogleGenerativeAI(apiKey);

    // Testing popular models
    const models = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-pro-latest"];

    for (const modelName of models) {
        console.log(`\nTesting: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'SDK OK'");
            const response = await result.response;
            console.log("Result:", response.text());
        } catch (error) {
            console.error("SDK Error:", error.message);
        }
    }
}

testSDK();
