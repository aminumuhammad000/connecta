import dotenv from "dotenv";

dotenv.config();

let redisClient: any;

try {
    const { createClient } = await import("redis");
    redisClient = createClient({
        url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
        socket: {
            reconnectStrategy: retries => Math.min(retries * 50, 2000),
        },
    });

    redisClient.on("connect", () => {
        console.log("Redis connected");
    });

    redisClient.on("error", (err: any) => {
        console.error("Redis error:", err);
    });
} catch (error) {
    console.warn("Redis package not found or failed to load. Using mock Redis client.");
    redisClient = {
        on: () => { },
        connect: async () => { console.log("Mock Redis connected"); },
        get: async () => null,
        set: async () => "OK",
        del: async () => 0,
        quit: async () => "OK",
    };
}

export default redisClient;
