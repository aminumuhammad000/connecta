import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function findWorkingModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const genAI = new GoogleGenerativeAI(apiKey);
    const content = fs.readFileSync('available_models.txt', 'utf8');
    const models = content.split('\n')
        .filter(line => line.includes('generateContent'))
        .map(line => line.split(' ')[0].replace('models/', ''));

    console.log(`Found ${models.length} models to test.`);

    for (const modelName of models) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'Hi' }] }] });
            const response = await result.response;
            console.log("OK: " + response.text().substring(0, 10).replace(/\n/g, ' '));
        } catch (error) {
            console.log("FAIL: " + error.message.substring(0, 50));
        }
    }
}

findWorkingModel();
