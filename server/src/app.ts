// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "./config/db.config.js";
import agentRoute from "./routes/agentRoute.js"
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
app.use("/api/verifications", verificationRoutes);

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
    const users = await User.find({}, 'email _id firstName');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Removed debug setup and seeding routes



// Socket.io connection handling
const activeUsers = new Map<string, string>(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // User joins with their userId
  socket.on("user:join", (userId: string) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined with socket ${socket.id} `);

    // Emit online status
    io.emit("user:online", { userId, socketId: socket.id });
  });

  // Send message event
  socket.on("message:send", (data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    message: any;
  }) => {
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
  socket.on("typing:start", (data: { conversationId: string; userId: string; receiverId: string }) => {
    const receiverSocketId = activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:show", {
        conversationId: data.conversationId,
        userId: data.userId,
      });
    }
  });

  socket.on("typing:stop", (data: { conversationId: string; userId: string; receiverId: string }) => {
    const receiverSocketId = activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:hide", {
        conversationId: data.conversationId,
        userId: data.userId,
      });
    }
  });

  // Message read event
  socket.on("message:read", (data: { conversationId: string; userId: string; senderId: string }) => {
    const senderSocketId = activeUsers.get(data.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("message:read", {
        conversationId: data.conversationId,
        readBy: data.userId,
      });
    }
  });

  // Room management (moved outside disconnect to prevent memory leak)
  socket.on("room:join", (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId} `);
  });

  socket.on("room:leave", (roomId: string) => {
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
  } catch (err) {
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

