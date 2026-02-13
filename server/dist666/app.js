// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "./config/db.config.js";
import agentRoute from "./routes/agentRoute.js";
import { initCronJobs } from "./services/cron.service.js";
// routes 
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/Profile.routes.js";
import projectRoutes from "./routes/Project.routes.js";
import jobRoutes from "./routes/Job.routes.js";
import messageRoutes from "./routes/Message.routes.js";
import proposalRoutes from "./routes/Proposal.routes.js";
import dashboardRoutes from "./routes/Dashboard.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import contractRoutes from "./routes/contract.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import gigsRoutes from "./routes/gigs.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import redisClient from "./config/redis.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Create HTTP server
const server = http.createServer(app);
// Initialize Socket.io
import { setIO } from './core/utils/socketIO.js';
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:8081", "http://localhost:19000", "http://localhost:19001", "http://172.20.10.3:5000", "*"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
setIO(io);
// Middleware
app.use(cors({
    origin: [
        "http://102.68.84.56",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8081",
        "https://myconnecta.ng",
        "https://www.myconnecta.ng",
        "https://admin.myconnecta.ng",
        "https://app.myconnecta.ng",
        "https://api.myconnecta.ng",
        "http://172.20.10.3:5000",
        "*"
    ],
    credentials: true
}));
app.use(express.json());
// Connect to Database
// Database connection moved to end of file to ensure server starts only after DB is ready
// Routes
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/agent", agentRoute);
app.use("/api/contracts", contractRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/gigs", gigsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/verifications", verificationRoutes);
import analyticsRoutes from "./routes/analytics.routes.js";
app.use("/api/analytics", analyticsRoutes);
import subscriptionRoutes from "./routes/Subscription.routes.js";
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/analytics", insightsRoutes);
import settingsRoutes from "./routes/settings.routes.js";
app.use("/api/settings", settingsRoutes);
import webhookRoutes from "./webhooks/routes/webhook.js";
app.use("/api/webhooks", webhookRoutes);
import broadcastRoutes from "./routes/broadcast.routes.js";
app.use("/api/broadcast", broadcastRoutes);
import externalGigsRoutes from "./routes/external-gigs.routes.js";
app.use("/api/external-gigs", externalGigsRoutes);
import avatarRoutes from "./routes/avatar.routes.js";
app.use("/api/avatars", avatarRoutes);
import contactRoutes from "./routes/contact.routes.js";
app.use("/api/contact", contactRoutes);
app.get("/health", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const stateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };
    const isHealthy = dbState === 1;
    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? "ok" : "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dbState: stateMap[dbState] || "unknown",
        dbHost: mongoose.connection.host
    });
});
app.get("/", (req, res) => {
    res.send("✅ Connecta backend is running!");
});
app.get("/debug/users", async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const User = mongoose.model('User');
        const users = await User.find({}, 'email _id firstName');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/debug/setup", async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const bcrypt = await import('bcryptjs');
        const User = mongoose.model('User');
        // Create Admin
        const adminEmail = 'admin@connecta.com';
        let admin = await User.findOne({ email: adminEmail });
        if (admin) {
            // Update password if exists
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            admin.password = hashedPassword;
            await admin.save();
        }
        else {
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            admin = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: hashedPassword,
                userType: 'admin',
                isVerified: true
            });
        }
        // Create a Client
        const clientEmail = 'client@connecta.com';
        let client = await User.findOne({ email: clientEmail });
        if (!client) {
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            client = await User.create({
                firstName: 'John',
                lastName: 'Client',
                email: clientEmail,
                password: hashedPassword,
                userType: 'client',
                isVerified: true
            });
        }
        // Verify immediately
        const isMatch = await bcrypt.default.compare('password123', admin.password);
        res.send(`
      <h1>Setup Complete (Passwords Hashed)</h1>
      <p><b>Verification Check: ${isMatch ? '<span style="color:green">MATCH</span>' : '<span style="color:red">FAIL</span>'}</b></p>
      <p>Users created/updated:</p>
      <ul>
        <li>Admin: <b>${adminEmail}</b> / password123</li>
        <li>Client: <b>${clientEmail}</b> / password123</li>
      </ul>
      <p><a href="http://localhost:5174/login">Go to Admin Login</a></p>
    `);
    }
    catch (error) {
        console.error(error);
        res.status(500).send(`Error: ${error.message}`);
    }
});
app.get("/debug/notifications", async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const Notification = mongoose.model('Notification');
        const User = mongoose.model('User');
        const emails = ['a@gmail.com', 'b@gmail.com', 'd@gmail.com', 'f@gmail.com'];
        const results = [];
        for (const email of emails) {
            const user = await User.findOne({ email });
            if (user) {
                const notifs = await Notification.find({ userId: user._id }).populate('relatedId');
                results.push({ email, userId: user._id, count: notifs.length, notifications: notifs });
            }
        }
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Socket.io connection handling
const activeUsers = new Map(); // userId -> socketId
io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);
    // User joins with their userId
    socket.on("user:join", (userId) => {
        activeUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} joined with socket ${socket.id}`);
        // Emit online status
        io.emit("user:online", { userId, socketId: socket.id });
    });
    // Send message event
    socket.on("message:send", (data) => {
        console.log("Message sent:", data);
        // Send to receiver if online
        const receiverSocketId = activeUsers.get(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("message:receive", data.message);
        }
        // Send confirmation to sender
        socket.emit("message:sent", data.message);
    });
    // Typing indicator
    socket.on("typing:start", (data) => {
        const receiverSocketId = activeUsers.get(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing:show", {
                conversationId: data.conversationId,
                userId: data.userId,
            });
        }
    });
    socket.on("typing:stop", (data) => {
        const receiverSocketId = activeUsers.get(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing:hide", {
                conversationId: data.conversationId,
                userId: data.userId,
            });
        }
    });
    // Message read event
    socket.on("message:read", (data) => {
        const senderSocketId = activeUsers.get(data.senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("message:read", {
                conversationId: data.conversationId,
                readBy: data.userId,
            });
        }
    });
    // Room management (moved outside disconnect to prevent memory leak)
    socket.on("room:join", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    socket.on("room:leave", (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
    });
    // Disconnect
    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        // Find and remove user from activeUsers
        for (const [userId, socketId] of activeUsers.entries()) {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
                io.emit("user:offline", { userId });
                break;
            }
        }
    });
});
// Start Server
// Connect to Database and then Start Server
(async () => {
    try {
        await redisClient.connect();
        console.log("✅ Redis connected");
    }
    catch (err) {
        console.error("❌ Redis connection failed:", err);
    }
})();
connectDB().then(() => {
    console.log("🚀 Database connected and ready.");
    server.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        console.log(`🔌 Socket.io ready for real-time messaging`);
        // Initialize cron jobs
        initCronJobs();
    });
}).catch(err => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
});
