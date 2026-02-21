import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
// Environment variables
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
const MODEL = "dslim/bert-base-NER";
/**
 * Extract named entities from a text using Hugging Face model.
 * @param text The input text to analyze
 */
async function extractEntities(text) {
    try {
        const response = await axios.post(`https://api-inference.huggingface.co/models/${MODEL}`, { inputs: text }, {
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
        });
        const rawData = response.data.flat(); // Flatten nested arrays from HuggingFace output
        // Map and structure entities into clean JSON
        const entities = rawData.map((item) => ({
            entity: item.entity_group || item.entity || "UNKNOWN",
            word: item.word,
            score: item.score,
        }));
        const output = { text, entities };
        // Save results to a JSON file
        // fs.writeFileSync("entities.json", JSON.stringify(output, null, 2));
        console.log("✅ Entities extracted and saved to entities.json");
    }
    catch (error) {
        console.error("❌ Error extracting entities:", error.response?.data || error.message);
    }
}
// Example usage
const text = "Aminu Muhammad is a developer at Swallern in Nigeria.";
extractEntities(text);
