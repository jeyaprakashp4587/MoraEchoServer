import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis Client Connected");
    });

    redisClient.on("ready", () => {
      console.log("redis ready");
    });

    redisClient.on("end", () => {
      console.warn("Redis Client Connection Ended");
    });

    await redisClient.connect();

    const pong = await redisClient.ping();
  } catch (error) {
    console.error("Redis connection failed:", error);
    throw error;
  }
};

export const setCache = async (key, value, expireTime = 3600) => {
  try {
    // console.log("key cached kgf");

    await redisClient.set(key, JSON.stringify(value), {
      EX: expireTime,
    });
    return true;
  } catch (error) {
    console.error("Cache Set Error:", error);
    return false;
  }
};

export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Cache Get Error:", error);
    return null;
  }
};

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Cache Delete Error:", error);
    return false;
  }
};

export const getRedisClient = () => {
  if (!redisClient) throw new Error("Redis client not initialized");
  return redisClient;
};

export { connectRedis };
