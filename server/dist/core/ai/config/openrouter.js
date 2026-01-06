"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenRouterHeaders = exports.OPENROUTER_CONFIG = exports.getOpenRouterApiKey = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const apiKeys_service_1 = require("../../../services/apiKeys.service");
dotenv_1.default.config();
let cachedApiKey = null;
const getOpenRouterApiKey = async () => {
    if (!cachedApiKey) {
        const apiKeys = await (0, apiKeys_service_1.getApiKeys)();
        cachedApiKey = apiKeys.openrouter;
    }
    return cachedApiKey;
};
exports.getOpenRouterApiKey = getOpenRouterApiKey;
exports.OPENROUTER_CONFIG = {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'deepseek/deepseek-coder-33b-instruct',
};
const getOpenRouterHeaders = async () => {
    const apiKey = await (0, exports.getOpenRouterApiKey)();
    return {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5000',
        'X-Title': 'Connecta Agent',
        'Content-Type': 'application/json',
    };
};
exports.getOpenRouterHeaders = getOpenRouterHeaders;
