export const getApiKeys = async () => {
    return {
        openrouter: process.env.OPENROUTER_API_KEY || '',
        huggingface: process.env.HUGGINGFACE_API_KEY || '',
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackUrl: process.env.GOOGLE_CALLBACK_URL || ''
        }
    };
};
