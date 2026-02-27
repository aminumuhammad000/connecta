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
import collaboRoutes from "./routes/Collabo.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
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
        "http://192.168.100.10:5000"
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
app.use("/api/collabo", collaboRoutes);
app.use("/api/rewards", rewardRoutes);
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
            admin.userType = 'admin'; // Force admin role
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
        let clientTest = await User.findOne({ email: clientEmail });
        if (clientTest) {
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            clientTest.password = hashedPassword;
            clientTest.userType = 'client';
            await clientTest.save();
        }
        else {
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            clientTest = await User.create({
                firstName: 'John',
                lastName: 'Client',
                email: clientEmail,
                password: hashedPassword,
                userType: 'client',
                isVerified: true
            });
        }
        // Create a Freelancer
        const freelancerEmail = 'freelancer@connecta.com';
        let freelancerTest = await User.findOne({ email: freelancerEmail });
        if (freelancerTest) {
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            freelancerTest.password = hashedPassword;
            freelancerTest.userType = 'freelancer';
            await freelancerTest.save();
        }
        else {
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            freelancerTest = await User.create({
                firstName: 'Jane',
                lastName: 'Freelancer',
                email: freelancerEmail,
                password: hashedPassword,
                userType: 'freelancer',
                isVerified: true
            });
        }
        // Verify immediately
        const isMatch = await bcrypt.default.compare('password123', admin.password);
        res.send(`
      <style>
        body { font-family: sans-serif; padding: 40px; line-height: 1.6; background: #f4f7f6; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
        h1 { color: #2c3e50; }
        .match { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        ul { list-style: none; padding: 0; }
        li { background: #fff; margin: 10px 0; padding: 15px; border-radius: 4px; border-left: 4px solid #3498db; }
        .email { font-weight: bold; color: #2980b9; }
        .pwd { color: #7f8c8d; }
        .role { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: #e0e0e0; margin-left: 10px; }
      </style>
      <div class="card">
        <h1>Setup Complete</h1>
        <p>Database state: <b>Memory (Reset on restart)</b></p>
        <p>Verification Check: <span class="${isMatch ? 'match' : 'fail'}">${isMatch ? 'PASS' : 'FAIL'}</span></p>
        
        <h3>Test Accounts (Password: 12345678):</h3>
        <p><i>Note: Updated passwords to <b>password123</b> for consistency.</i></p>
        <ul>
          <li>
            <span class="email">${adminEmail}</span> <span class="role">Admin</span>
            <br/><span class="pwd">password123</span>
          </li>
          <li>
            <span class="email">${clientEmail}</span> <span class="role">Client</span>
            <br/><span class="pwd">password123</span>
          </li>
          <li>
            <span class="email">${freelancerEmail}</span> <span class="role">Freelancer</span>
            <br/><span class="pwd">password123</span>
          </li>
        </ul>
        <hr/>
        <p><a href="http://localhost:5173/login">Go to Admin Dashboard</a></p>
        <p>Open the Mobile App to log in as Client or Freelancer.</p>
      </div>
    `);
    }
    catch (error) {
        console.error(error);
        res.status(500).send(`Error: ${error.message}`);
    }
});
app.get("/debug/seed-freelancers", async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const bcrypt = await import('bcryptjs');
        const User = mongoose.model('User');
        let ProfileModel;
        try {
            ProfileModel = mongoose.model('Profile');
        }
        catch {
            ProfileModel = null;
        }
        const hashedPassword = await bcrypt.default.hash('password123', 10);
        const freelancerData = [
            { firstName: 'Aminu', lastName: 'Musa', email: 'aminu@test.com', jobTitle: 'Full Stack Developer', skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'], hourlyRate: 5000, location: 'Kano, Nigeria', bio: 'Experienced full-stack developer with 5+ years building scalable web apps.' },
            { firstName: 'Fatima', lastName: 'Bello', email: 'fatima@test.com', jobTitle: 'UI/UX Designer', skills: ['Figma', 'Adobe XD', 'Illustrator', 'Prototyping'], hourlyRate: 4000, location: 'Lagos, Nigeria', bio: 'Creative UI/UX designer passionate about building beautiful and intuitive products.' },
            { firstName: 'Ibrahim', lastName: 'Suleiman', email: 'ibrahim@test.com', jobTitle: 'Mobile Developer', skills: ['React Native', 'Flutter', 'Kotlin', 'Swift'], hourlyRate: 6000, location: 'Abuja, Nigeria', bio: 'Mobile developer specializing in cross-platform apps with 4 years of experience.' },
            { firstName: 'Zainab', lastName: 'Usman', email: 'zainab@test.com', jobTitle: 'Data Scientist', skills: ['Python', 'TensorFlow', 'Pandas', 'SQL', 'Machine Learning'], hourlyRate: 7000, location: 'Kaduna, Nigeria', bio: 'Data scientist turning raw data into actionable insights using modern ML techniques.' },
            { firstName: 'Umar', lastName: 'Yusuf', email: 'umar@test.com', jobTitle: 'Backend Developer', skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker'], hourlyRate: 5500, location: 'Port Harcourt, Nigeria', bio: 'Backend engineer who loves designing fast, secure, and scalable APIs.' },
            { firstName: 'Halima', lastName: 'Abdullahi', email: 'halima@test.com', jobTitle: 'Content Writer', skills: ['Copywriting', 'SEO', 'Blogging', 'Social Media', 'Research'], hourlyRate: 2000, location: 'Ibadan, Nigeria', bio: 'SEO-driven content writer with a knack for engaging storytelling and brand voice.' },
            { firstName: 'Mustapha', lastName: 'Garba', email: 'mustapha@test.com', jobTitle: 'DevOps Engineer', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'], hourlyRate: 8000, location: 'Enugu, Nigeria', bio: 'DevOps engineer building reliable infrastructure pipelines for startups and enterprises.' },
            { firstName: 'Rukayya', lastName: 'Hassan', email: 'rukayya@test.com', jobTitle: 'Graphic Designer', skills: ['Photoshop', 'Illustrator', 'Canva', 'Branding', 'Logo Design'], hourlyRate: 3000, location: 'Kano, Nigeria', bio: 'Graphic designer bringing brands to life with clean, modern visual identities.' },
            { firstName: 'Bashir', lastName: 'Isa', email: 'bashir@test.com', jobTitle: 'Cybersecurity Analyst', skills: ['Penetration Testing', 'Kali Linux', 'Network Security', 'OWASP'], hourlyRate: 9000, location: 'Abuja, Nigeria', bio: 'Certified ethical hacker protecting businesses from digital threats.' },
            { firstName: 'Aisha', lastName: 'Danladi', email: 'aisha@test.com', jobTitle: 'Project Manager', skills: ['Agile', 'Scrum', 'JIRA', 'Risk Management', 'Leadership'], hourlyRate: 6500, location: 'Lagos, Nigeria', bio: 'PMP-certified project manager delivering projects on time, within scope and budget.' },
        ];
        const created = [];
        const skipped = [];
        for (const data of freelancerData) {
            const existing = await User.findOne({ email: data.email });
            if (existing) {
                // Also fix profile for existing users (in case it was broken)
                if (ProfileModel) {
                    try {
                        await ProfileModel.deleteOne({ user: existing._id });
                        await ProfileModel.create({
                            user: existing._id,
                            bio: data.bio,
                            skills: data.skills,
                            hourlyRate: data.hourlyRate,
                            location: data.location,
                            jobTitle: data.jobTitle,
                            rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                            totalReviews: Math.floor(Math.random() * 20 + 1),
                            jobSuccessScore: Math.floor(Math.random() * 20 + 75),
                        });
                    }
                    catch (_) { }
                }
                skipped.push(data.email);
                continue;
            }
            const user = await User.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
                userType: 'freelancer',
                isVerified: true,
                jobTitle: data.jobTitle,
                skills: data.skills,
                hourlyRate: data.hourlyRate,
                location: data.location,
            });
            // Create profile if model is available (use correct field: 'user' not 'userId')
            if (ProfileModel) {
                try {
                    await ProfileModel.deleteOne({ user: user._id }); // clean up any broken profile
                    await ProfileModel.create({
                        user: user._id,
                        bio: data.bio,
                        skills: data.skills,
                        hourlyRate: data.hourlyRate,
                        location: data.location,
                        jobTitle: data.jobTitle,
                        rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5–5.0
                        totalReviews: Math.floor(Math.random() * 20 + 1),
                        jobSuccessScore: Math.floor(Math.random() * 20 + 75), // 75–95%
                    });
                }
                catch (profileErr) {
                    console.warn(`Profile creation failed for ${data.email}:`, profileErr);
                }
            }
            created.push(data.email);
        }
        const rows = freelancerData.map(d => `
      <tr>
        <td>${d.firstName} ${d.lastName}</td>
        <td>${d.email}</td>
        <td>${d.jobTitle}</td>
        <td>₦${d.hourlyRate.toLocaleString()}/hr</td>
        <td>${d.location}</td>
        <td>${created.includes(d.email) ? '<span style="color:green">✅ Created</span>' : '<span style="color:orange">⚠️ Skipped</span>'}</td>
      </tr>`).join('');
        res.send(`
      <style>
        body { font-family: sans-serif; padding: 30px; background: #f4f7f6; }
        .card { background: white; padding: 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 900px; margin: 0 auto; }
        h1 { color: #2c3e50; } table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #3498db; color: white; padding: 10px 14px; text-align: left; }
        td { padding: 10px 14px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #f9f9f9; }
        p { color: #555; }
      </style>
      <div class="card">
        <h1>🧑‍💻 Freelancer Seeding Complete</h1>
        <p>✅ Created: <strong>${created.length}</strong> &nbsp;|&nbsp; ⚠️ Skipped (already exist): <strong>${skipped.length}</strong></p>
        <p>Password for all accounts: <strong>password123</strong></p>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Job Title</th><th>Rate</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
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
