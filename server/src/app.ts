// src/app.ts
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.config";

// routes 
import userRoutes from "./routes/user.routes";
import profileRoutes from "./routes/Profile.routes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to Database
connectDB();


// Routes
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);

app.get("/", (req, res) => {
  res.send("✅ Connecta backend is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
