"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterClient = void 0;
const axios_1 = __importDefault(require("axios"));
const openrouter_1 = require("../config/openrouter");
class OpenRouterClient {
    constructor() { }
    static getInstance() {
        if (!OpenRouterClient.instance) {
            OpenRouterClient.instance = new OpenRouterClient();
        }
        return OpenRouterClient.instance;
    }
    async generateCompletion(prompt) {
        try {
            const response = await axios_1.default.post(`${openrouter_1.OPENROUTER_CONFIG.baseURL}/chat/completions`, {
                model: openrouter_1.OPENROUTER_CONFIG.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            }, {
                headers: (0, openrouter_1.getOpenRouterHeaders)()
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('OpenRouter API Error:', error);
            throw new Error('Failed to generate completion from OpenRouter');
        }
    }
}
exports.OpenRouterClient = OpenRouterClient;
