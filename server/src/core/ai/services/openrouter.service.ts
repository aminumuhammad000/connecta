import axios from 'axios';
import { OPENROUTER_CONFIG, getOpenRouterHeaders } from '../config/openrouter';

export class OpenRouterClient {
  private static instance: OpenRouterClient;

  private constructor() {}

  static getInstance(): OpenRouterClient {
    if (!OpenRouterClient.instance) {
      OpenRouterClient.instance = new OpenRouterClient();
    }
    return OpenRouterClient.instance;
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${OPENROUTER_CONFIG.baseURL}/chat/completions`,
        {
          model: OPENROUTER_CONFIG.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: getOpenRouterHeaders()
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error('Failed to generate completion from OpenRouter');
    }
  }
}
