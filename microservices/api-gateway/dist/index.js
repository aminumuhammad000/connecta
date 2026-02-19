"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway Running' });
});
// --- Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY || 'secret');
            req.headers['x-user-id'] = decoded.id;
            req.headers['x-user-role'] = decoded.role;
        }
        catch (err) {
            // Invalid token - clear headers to be safe
            delete req.headers['x-user-id'];
            delete req.headers['x-user-role'];
        }
    }
    next();
};
app.use(authenticate);
// --- Service Routes ---
const proxyOptions = (target, pathPrefix) => ({
    target,
    changeOrigin: true,
    pathRewrite: {
        [`^${pathPrefix}`]: '',
    },
    onProxyReq: (proxyReq, req) => {
        // Ensure headers injected by authenticate middleware are passed
        if (req.headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
        if (req.headers['x-user-role']) {
            proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
        }
    }
});
// Auth Service
app.use('/api/auth', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.AUTH_SERVICE_URL || 'http://localhost:3001', '/api/auth')));
// Profile Service
app.use('/api/profiles', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.PROFILE_SERVICE_URL || 'http://localhost:3002', '/api/profiles')));
// Job Service
app.use('/api/jobs', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.JOB_SERVICE_URL || 'http://localhost:3003', '/api/jobs')));
// Rewards Service
app.use('/api/rewards', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.REWARDS_SERVICE_URL || 'http://localhost:3004', '/api/rewards')));
// Contract Service
app.use('/api/contracts', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.CONTRACT_SERVICE_URL || 'http://localhost:3005', '/api/contracts')));
// Payment Service
app.use('/api/payments', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006', '/api/payments')));
// Chat Service
app.use('/api/chats', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.CHAT_SERVICE_URL || 'http://localhost:3007', '/api/chats')));
// Notification Service
app.use('/api/notifications', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008', '/api/notifications')));
// Verification Service
app.use('/api/verifications', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.VERIFICATION_SERVICE_URL || 'http://localhost:3010', '/api/verifications')));
// Media Service
app.use('/api/media', (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions(process.env.MEDIA_SERVICE_URL || 'http://localhost:3009', '/api/media')));
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
