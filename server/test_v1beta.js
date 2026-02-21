import dotenv from 'dotenv';

dotenv.config();

async function testV1Beta() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-1.5-flash-latest"; // Try -latest
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    };

    console.log(`--- Testing ${model} on v1beta ---`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.candidates) {
            console.log("Success! OK");
        } else {
            console.log("Error:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testV1Beta();
