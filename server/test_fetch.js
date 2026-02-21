import dotenv from 'dotenv';

dotenv.config();

async function testEndpoints() {
    const apiKey = process.env.GEMINI_API_KEY;
    const versions = ['v1', 'v1beta'];
    const model = 'gemini-1.5-flash';

    console.log("--- Testing Direct Fetch ---");
    for (const v of versions) {
        const url = `https://generativelanguage.googleapis.com/${v}/models/${model}:generateContent?key=${apiKey}`;
        console.log(`\nTesting version ${v}...`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
            });
            const data = await response.json();
            console.log("Status:", response.status);
            if (data.candidates) {
                console.log("Success! Candidate found.");
            } else {
                console.log("Error Response:", JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error("Fetch call failed:", error);
        }
    }
}

testEndpoints();
