
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway Running' });
});

// --- Middleware ---

const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_KEY || 'secret');
            req.headers['x-user-id'] = decoded.id;
            req.headers['x-user-role'] = decoded.role;
        } catch (err) {
            // Invalid token - clear headers to be safe
            delete req.headers['x-user-id'];
            delete req.headers['x-user-role'];
        }
    }
    next();
};

app.use(authenticate);

// --- Service Routes ---

const proxyOptions = (target: string, pathPrefix: string) => ({
    target,
    changeOrigin: true,
    pathRewrite: {
        [`^${pathPrefix}`]: '',
    },
    onProxyReq: (proxyReq: any, req: any) => {
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
app.use('/api/auth', createProxyMiddleware(proxyOptions(process.env.AUTH_SERVICE_URL || 'http://localhost:3001', '/api/auth')));

// Profile Service
app.use('/api/profiles', createProxyMiddleware(proxyOptions(process.env.PROFILE_SERVICE_URL || 'http://localhost:3002', '/api/profiles')));

// Job Service
app.use('/api/jobs', createProxyMiddleware(proxyOptions(process.env.JOB_SERVICE_URL || 'http://localhost:3003', '/api/jobs')));

// Rewards Service
app.use('/api/rewards', createProxyMiddleware(proxyOptions(process.env.REWARDS_SERVICE_URL || 'http://localhost:3004', '/api/rewards')));

// Contract Service
app.use('/api/contracts', createProxyMiddleware(proxyOptions(process.env.CONTRACT_SERVICE_URL || 'http://localhost:3005', '/api/contracts')));

// Payment Service
app.use('/api/payments', createProxyMiddleware(proxyOptions(process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006', '/api/payments')));

// Chat Service
app.use('/api/chats', createProxyMiddleware(proxyOptions(process.env.CHAT_SERVICE_URL || 'http://localhost:3007', '/api/chats')));

// Notification Service
app.use('/api/notifications', createProxyMiddleware(proxyOptions(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008', '/api/notifications')));

// Verification Service
app.use('/api/verifications', createProxyMiddleware(proxyOptions(process.env.VERIFICATION_SERVICE_URL || 'http://localhost:3010', '/api/verifications')));

// Media Service
app.use('/api/media', createProxyMiddleware(proxyOptions(process.env.MEDIA_SERVICE_URL || 'http://localhost:3009', '/api/media')));


app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
