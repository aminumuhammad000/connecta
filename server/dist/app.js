"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_config_1 = __importDefault(require("./config/db.config"));
const agentRoute_1 = __importDefault(require("./routes/agentRoute"));
// routes 
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const Profile_routes_1 = __importDefault(require("./routes/Profile.routes"));
const Project_routes_1 = __importDefault(require("./routes/Project.routes"));
const Job_routes_1 = __importDefault(require("./routes/Job.routes"));
const Message_routes_1 = __importDefault(require("./routes/Message.routes"));
const Proposal_routes_1 = __importDefault(require("./routes/Proposal.routes"));
const Dashboard_routes_1 = __importDefault(require("./routes/Dashboard.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const contract_routes_1 = __importDefault(require("./routes/contract.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const gigs_routes_1 = __importDefault(require("./routes/gigs.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const insights_routes_1 = __importDefault(require("./routes/insights.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.io
const socketIO_1 = require("./core/utils/socketIO");
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:8081", "http://localhost:19000", "http://localhost:19001", "*"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
(0, socketIO_1.setIO)(io);
// Middleware
app.use((0, cors_1.default)({
    origin: [
        "http://102.68.84.56",
        "http://localhost:5173",
        "http://localhost:8081"
    ],
    credentials: true
}));
app.use(express_1.default.json());
// Connect to Database
(0, db_config_1.default)();
// Routes
app.use("/api/users", user_routes_1.default);
app.use("/api/profiles", Profile_routes_1.default);
app.use("/api/projects", Project_routes_1.default);
app.use("/api/jobs", Job_routes_1.default);
app.use("/api/messages", Message_routes_1.default);
app.use("/api/proposals", Proposal_routes_1.default);
app.use("/api/dashboard", Dashboard_routes_1.default);
app.use("/api/uploads", upload_routes_1.default);
app.use("/api/agent", agentRoute_1.default);
app.use("/api/contracts", contract_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/gigs", gigs_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
app.use("/api/analytics", analytics_routes_1.default);
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
app.use("/api/subscriptions", subscription_routes_1.default);
app.use("/api/analytics", insights_routes_1.default);
app.get("/", (req, res) => {
    res.send("✅ Connecta backend is running!");
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
