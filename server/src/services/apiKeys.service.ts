import SystemSettings from '../models/SystemSettings.model.js';

/**
 * Get API keys from database settings with fallback to environment variables
 */
export const getApiKeys = async () => {
    try {
        const settings = await SystemSettings.findOne();

        return {
            openrouter: settings?.apiKeys?.openrouter || process.env.OPENROUTER_API_KEY || '',
            huggingface: settings?.apiKeys?.huggingface || process.env.HUGGINGFACE_API_KEY || '',
            google: {
                clientId: settings?.apiKeys?.google?.clientId || process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: settings?.apiKeys?.google?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '',
                callbackUrl: settings?.apiKeys?.google?.callbackUrl || process.env.GOOGLE_CALLBACK_URL || ''
            }
        };
    } catch (error) {
        console.error('Error fetching API keys from database:', error);
        // Fallback to environment variables on error
        return {
            openrouter: process.env.OPENROUTER_API_KEY || '',
            huggingface: process.env.HUGGINGFACE_API_KEY || '',
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                callbackUrl: process.env.GOOGLE_CALLBACK_URL || ''
            }
        };
    }
};
