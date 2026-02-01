import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
        reconnectStrategy: retries => Math.min(retries * 50, 2000),
    },
});
redisClient.on("connect", () => {
    console.log("Redis connected");
});
redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});
export default redisClient;
