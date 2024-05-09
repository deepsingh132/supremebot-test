require('dotenv').config();
import { Redis } from "ioredis";
const redisUrl = process.env.REDIS_URL || null;

export async function redisClient() {
  if (!redisUrl) {
    console.error('No Redis URL provided!');
  }
  else {
    const client = new Redis(
      redisUrl,
    );
    console.log('Connected to Redis!');
    return client;
  }
}