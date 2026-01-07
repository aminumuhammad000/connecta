"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/db.config.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
dotenv_1.default.config();
let memoryServer = null;
const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI?.trim();
        // Fallback to an in-memory Mongo when no real URI is provided or reachable locally.
        if (!uri || uri === "memory") {
            memoryServer = await mongodb_memory_server_1.MongoMemoryServer.create({ instance: { dbName: "connecta" } });
            uri = memoryServer.getUri();
            console.log("⚡ Using in-memory MongoDB instance for development");
        }
        await mongoose_1.default.connect(uri);
        console.log("✅ MongoDB connected successfully");
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};
// Gracefully stop the in-memory server on shutdown.
const shutdown = async () => {
    if (memoryServer) {
        await memoryServer.stop();
        memoryServer = null;
    }
    await mongoose_1.default.disconnect();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
exports.default = connectDB;
