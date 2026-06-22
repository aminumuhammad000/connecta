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
import jobRoutes from "./routes/Job.routes.js";
import messageRoutes from "./routes/Message.routes.js";
import proposalRoutes from "./routes/Proposal.routes.js";
import dashboardRoutes from "./routes/Dashboard.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import contractRoutes from "./routes/contract.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import projectRoutes from "./routes/Project.routes.js";
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
        origin: [
            "http://localhost:5173",
            "http://localhost:8081",
            "http://localhost:19000",
            "http://localhost:19001",
            "http://192.168.100.10:5000",
            "http://192.168.100.10:8081",
            "http://192.168.42.137:5000",
            "http://192.168.42.137:8081",
            "http://192.168.42.227:5000",
            "http://192.168.42.227:8081",
            "http://172.20.10.3:5000",
            "http://172.20.10.4:5000",
            "http://172.20.10.4:8081"
        ],
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
        "http://172.20.10.4",
        "http://172.20.10.4:8081",
        "http://172.20.10.4:5000",
        "http://192.168.100.10",
        "http://192.168.100.10:8081",
        "http://192.168.100.10:5000",
        "http://192.168.42.137",
        "http://192.168.42.137:8081",
        "http://192.168.42.137:5000",
        "http://192.168.42.227",
        "http://192.168.42.227:8081",
        "http://192.168.42.227:5000"
    ],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));
// Connect to Database
// Database connection moved to end of file to ensure server starts only after DB is ready
// Routes
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/agent", agentRoute);
app.use("/api/contracts", contractRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/verifications", verificationRoutes);
import broadcastRoutes from "./routes/broadcast.routes.js";
app.use("/api/broadcast", broadcastRoutes);
import settingsRoutes from "./routes/settings.routes.js";
app.use("/api/settings", settingsRoutes);
import webhookRoutes from "./webhooks/routes/webhook.js";
app.use("/api/webhooks", webhookRoutes);
import avatarRoutes from "./routes/avatar.routes.js";
app.use("/api/avatars", avatarRoutes);
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
        const users = await User.find({}, 'email _id firstName userType');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/debug/seed-full", async (req, res) => {
    try {
        const bcrypt = await import('bcryptjs');
        const mongoose = await import('mongoose');
        const User = mongoose.model('User');
        const Job = (await import('./models/Job.model.js')).default;
        const FeedPost = (await import('./models/Feed.model.js')).default;
        await User.deleteMany({ email: { $ne: 'testuser@gmail.com' }, userType: { $in: ['client', 'freelancer'] } });
        await Job.deleteMany({});
        await FeedPost.deleteMany({});
        const hashedPassword = await bcrypt.default.hash('Password123!', 10);
        const usersToCreate = [
            { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.client@example.com', password: hashedPassword, userType: 'client', isVerified: true, profileImage: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random', jobTitle: 'Product Manager' },
            { firstName: 'David', lastName: 'Okafor', email: 'david.client@example.com', password: hashedPassword, userType: 'client', isVerified: true, profileImage: 'https://ui-avatars.com/api/?name=David+Okafor&background=random', jobTitle: 'Startup Founder' },
            { firstName: 'Elena', lastName: 'Rodriguez', email: 'elena.freelancer@example.com', password: hashedPassword, userType: 'freelancer', isVerified: true, profileImage: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random', jobTitle: 'UI Designer' },
            { firstName: 'James', lastName: 'Smith', email: 'james.freelancer@example.com', password: hashedPassword, userType: 'freelancer', isVerified: true, profileImage: 'https://ui-avatars.com/api/?name=James+Smith&background=random', jobTitle: 'Backend Engineer' }
        ];
        const createdUsers = await User.insertMany(usersToCreate);
        const client1 = createdUsers.find(u => u.email === 'sarah.client@example.com');
        const client2 = createdUsers.find(u => u.email === 'david.client@example.com');
        const freelancer1 = createdUsers.find(u => u.email === 'elena.freelancer@example.com');
        const freelancer2 = createdUsers.find(u => u.email === 'james.freelancer@example.com');
        for (const user of createdUsers) {
            await FeedPost.create({
                type: 'new_member', actor: user._id, actorName: `${user.firstName} ${user.lastName}`, actorAvatar: user.profileImage, actorRole: user.jobTitle, title: `Welcome ${user.firstName}!`, body: `${user.firstName} joined Connecta.`, emoji: '👋', targetAudience: 'all'
            });
        }
        const jobs = [
            { clientId: client1._id, title: 'Mobile App Redesign (Figma)', description: 'Overhaul our mobile app interface.', category: 'Design & Creative', skills: ['Figma', 'UI/UX'], budget: 1500, duration: 30, status: 'active' },
            { clientId: client1._id, title: 'Senior Node.js Developer', description: 'Integrate third-party APIs into Express.', category: 'Development & IT', skills: ['Node.js', 'API', 'AWS'], budget: 50, duration: 14, status: 'active' },
            { clientId: client2._id, title: 'Web3 / Smart Contract Developer', description: 'Write and audit smart contracts.', category: 'Web3 & Blockchain', skills: ['Solidity', 'Blockchain'], budget: 4000, duration: 90, status: 'active' }
        ];
        const createdJobs = await Job.insertMany(jobs);
        for (const job of createdJobs) {
            const owner = createdUsers.find(u => u._id.toString() === job.clientId.toString());
            await FeedPost.create({
                type: 'job_posted', actor: owner._id, actorName: `${owner.firstName} ${owner.lastName}`, actorAvatar: owner.profileImage, actorRole: owner.jobTitle, title: `New Job: ${job.title}`, body: job.description, emoji: '💼', relatedType: 'job', relatedId: job._id, targetAudience: 'all'
            });
        }
        await FeedPost.create({ type: 'project_completed', actor: freelancer1._id, actorName: `${freelancer1.firstName} ${freelancer1.lastName}`, actorAvatar: freelancer1.profileImage, title: `Project Success: App Redesign`, body: 'Elena perfectly executed the app design.', emoji: '🏆', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop', targetAudience: 'all' });
        await FeedPost.create({ type: 'review_received', actor: freelancer2._id, actorName: `${freelancer2.firstName} ${freelancer2.lastName}`, actorAvatar: freelancer2.profileImage, title: `5-Star Rating Received`, body: '"James delivered exactly what we needed!"', emoji: '⭐', targetAudience: 'all' });
        await FeedPost.create({ type: 'platform_win', isSystemPost: true, title: `Connecta Milestone!`, body: 'We just passed 10,000 active projects completed on the platform!', emoji: '🎉', imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop', targetAudience: 'all' });
        res.json({ success: true, message: 'Comprehensive seed completed' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Removed debug setup and seeding routes
// Socket.io connection handling
const activeUsers = new Map(); // userId -> socketId
io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);
    // User joins with their userId
    socket.on("user:join", (userId) => {
        activeUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} joined with socket ${socket.id} `);
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
        console.log(`Socket ${socket.id} joined room ${roomId} `);
    });
    socket.on("room:leave", (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId} `);
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
