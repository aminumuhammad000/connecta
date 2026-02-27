import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}
async function listModels() {
    try {
        console.log("Fetching models list via API...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log('Body:', text);
            return;
        }
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach((m) => {
                if (m.name.includes('gemini') || m.name.includes('flash')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods ? m.supportedGenerationMethods.join(', ') : 'unknown'})`);
                }
            });
        }
        else {
            console.log("No models returned in response data:", data);
        }
    }
    catch (e) {
        console.error("Fetch failed:", e.message);
    }
}
listModels();
