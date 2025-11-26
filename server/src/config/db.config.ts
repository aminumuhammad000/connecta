// src/config/db.config.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let memoryServer: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  try {
    let uri = (process.env.MONGO_URI as string | undefined)?.trim();

    // Fallback to an in-memory Mongo when no real URI is provided or reachable locally.
    if (!uri || uri === "memory") {
      memoryServer = await MongoMemoryServer.create({ instance: { dbName: "connecta" } });
      uri = memoryServer.getUri();
      console.log("⚡ Using in-memory MongoDB instance for development");
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
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
  await mongoose.disconnect();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default connectDB;
