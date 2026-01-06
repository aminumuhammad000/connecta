"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKeys = void 0;
const SystemSettings_model_1 = __importDefault(require("../models/SystemSettings.model"));
/**
 * Get API keys from database settings with fallback to environment variables
 */
const getApiKeys = async () => {
    try {
        const settings = await SystemSettings_model_1.default.findOne();
        return {
            openrouter: settings?.apiKeys?.openrouter || process.env.OPENROUTER_API_KEY || '',
            huggingface: settings?.apiKeys?.huggingface || process.env.HUGGINGFACE_API_KEY || '',
            google: {
                clientId: settings?.apiKeys?.google?.clientId || process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: settings?.apiKeys?.google?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '',
                callbackUrl: settings?.apiKeys?.google?.callbackUrl || process.env.GOOGLE_CALLBACK_URL || ''
            }
        };
    }
    catch (error) {
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
exports.getApiKeys = getApiKeys;
