"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenRouterHeaders = exports.OPENROUTER_CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.OPENROUTER_CONFIG = {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'deepseek/deepseek-coder-33b-instruct',
    headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5000',
        'X-Title': 'Connecta Agent'
    }
};
const getOpenRouterHeaders = () => ({
    ...exports.OPENROUTER_CONFIG.headers,
    'Content-Type': 'application/json',
});
exports.getOpenRouterHeaders = getOpenRouterHeaders;
// Validate required environment variables
if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required in environment variables');
}
