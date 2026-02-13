// Mock SystemSettings to use environment variables instead of MongoDB
export const SystemSettings = {
    findOne: async () => {
        return {
            ai: {
                provider: process.env.AI_PROVIDER || 'gemini',
                openaiApiKey: process.env.OPENROUTER_API_KEY || '',
                geminiApiKey: process.env.GEMINI_API_KEY || '',
                model: process.env.AI_MODEL || 'gemini-2.0-flash'
            },
            apiKeys: {
                openrouter: process.env.OPENROUTER_API_KEY || '',
                huggingface: process.env.HUGGINGFACE_API_KEY || '',
            }
        };
    }
};

export default SystemSettings;
