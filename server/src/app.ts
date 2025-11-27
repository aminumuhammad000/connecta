// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.config";
import agentRoute from "./routes/agentRoute"

// routes 
import userRoutes from "./routes/user.routes";
import profileRoutes from "./routes/Profile.routes";
import projectRoutes from "./routes/Project.routes";
import jobRoutes from "./routes/Job.routes";
import messageRoutes from "./routes/Message.routes";
import proposalRoutes from "./routes/Proposal.routes";
import dashboardRoutes from "./routes/Dashboard.routes";
import uploadRoutes from "./routes/upload.routes";
import contractRoutes from "./routes/contract.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import gigsRoutes from "./routes/gigs.routes";
import notificationRoutes from "./routes/notification.routes";
import insightsRoutes from "./routes/insights.routes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
import { setIO } from './core/utils/socketIO';
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8081", "http://localhost:19000", "http://localhost:19001", "*"],
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
    "http://localhost:8081"
  ],
  credentials: true
}));
app.use(express.json());

// Connect to Database
connectDB();

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
import analyticsRoutes from "./routes/analytics.routes";
app.use("/api/analytics", analyticsRoutes);
import subscriptionRoutes from "./routes/subscription.routes";
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/analytics", insightsRoutes);

app.get("/", (req, res) => {
  res.send("✅ Connecta backend is running!");
});

// Socket.io connection handling
const activeUsers = new Map<string, string>(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // User joins with their userId
  socket.on("user:join", (userId: string) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);

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
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for real-time messaging`);
});

