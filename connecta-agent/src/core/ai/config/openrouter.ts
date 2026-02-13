import dotenv from 'dotenv';
import { getApiKeys } from '../../../services/apiKeys.service.js';

dotenv.config();

let cachedApiKey: string | null = null;

export const getOpenRouterApiKey = async () => {
  if (!cachedApiKey) {
    const apiKeys = await getApiKeys();
    cachedApiKey = apiKeys.openrouter;
  }
  return cachedApiKey;
};

export const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  model: 'deepseek/deepseek-coder-33b-instruct',
};

export const getOpenRouterHeaders = async () => {
  const apiKey = await getOpenRouterApiKey();
  return {
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:5000',
    'X-Title': 'Connecta Agent',
    'Content-Type': 'application/json',
  };
};
