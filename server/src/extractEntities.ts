import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Environment variables
const HF_API_KEY: string = process.env.HUGGINGFACE_API_KEY || "";
const MODEL: string = "dslim/bert-base-NER";

// Define types for clarity
interface Entity {
  entity_group?: string;
  entity?: string;
  word: string;
  score: number;
}

interface ExtractedOutput {
  text: string;
  entities: {
    entity: string;
    word: string;
    score: number;
  }[];
}

/**
 * Extract named entities from a text using Hugging Face model.
 * @param text The input text to analyze
 */
async function extractEntities(text: string): Promise<void> {
  try {
    const response: AxiosResponse<Entity[][]> = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawData = response.data.flat(); // Flatten nested arrays from HuggingFace output

    // Map and structure entities into clean JSON
    const entities = rawData.map((item: any) => ({
      entity: item.entity_group || item.entity || "UNKNOWN",
      word: item.word,
      score: item.score,
    }));

    const output: ExtractedOutput = { text, entities };

    // Save results to a JSON file
    fs.writeFileSync("entities.json", JSON.stringify(output, null, 2));

    console.log("✅ Entities extracted and saved to entities.json");
  } catch (error: any) {
    console.error("❌ Error extracting entities:", error.response?.data || error.message);
  }
}

// Example usage
const text = "Aminu Muhammad is a developer at Swallern in Nigeria.";
extractEntities(text);
