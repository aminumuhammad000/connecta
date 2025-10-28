import axios, { type AxiosResponse } from "axios";

// In a Vite (frontend) app you cannot use `dotenv` or `fs` (Node-only).
// Read the Hugging Face API key from Vite env (must be prefixed with VITE_)
// e.g. VITE_HUGGINGFACE_API_KEY in your .env
const HF_API_KEY: string = import.meta.env.VITE_HUGGINGFACE_API_KEY || "";
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
export async function extractEntities(text: string): Promise<ExtractedOutput | null> {
  if (!HF_API_KEY) {
    console.error("Hugging Face API key not set. Set VITE_HUGGINGFACE_API_KEY in your .env");
    return null;
  }

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

    const rawData = Array.isArray(response.data) ? (response.data as any).flat() : [];

    const entities = rawData.map((item: any) => ({
      entity: item.entity_group || item.entity || "UNKNOWN",
      word: item.word,
      score: item.score,
    }));

    const output: ExtractedOutput = { text, entities };

    // Return the parsed output instead of writing to disk (not available in browser)
    return output;
  } catch (error: any) {
    console.error("❌ Error extracting entities:", error.response?.data || error.message);
    return null;
  }
}

// Example usage (in browser code import and call the function):
// const result = await extractEntities("Aminu Muhammad is a developer at Swallern in Nigeria.");
// console.log(result);
