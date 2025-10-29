import dotenv from 'dotenv';

dotenv.config();

export const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  model: 'deepseek/deepseek-coder-33b-instruct',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:5000',
    'X-Title': 'Connecta Agent'
  }
};

export const getOpenRouterHeaders = () => ({
  ...OPENROUTER_CONFIG.headers,
  'Content-Type': 'application/json',
});

// Validate required environment variables
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required in environment variables');
}
