import axios from 'axios';
import { OPENROUTER_CONFIG, getOpenRouterHeaders } from '../config/openrouter';
export class OpenRouterClient {
    constructor() { }
    static getInstance() {
        if (!OpenRouterClient.instance) {
            OpenRouterClient.instance = new OpenRouterClient();
        }
        return OpenRouterClient.instance;
    }
    async generateCompletion(prompt) {
        try {
            const response = await axios.post(`${OPENROUTER_CONFIG.baseURL}/chat/completions`, {
                model: OPENROUTER_CONFIG.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            }, {
                headers: await getOpenRouterHeaders()
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('OpenRouter API Error:', error);
            throw new Error('Failed to generate completion from OpenRouter');
        }
    }
}
