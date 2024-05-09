import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { redis } from '../server';

export async function getRecentMembers(req: Request, res: Response, keyPrefix: string) {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Milliseconds in a day

    // Generate a unique key for today's joined members list
    const key = `${keyPrefix}:${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`; // Format: joined_members:DD-MM-YYYY

    // Get all members who joined today
    const members = await redis.smembers(key);

    // Clean up old data (optional)
    const expiredKey = `${keyPrefix}:${oneDayAgo.getDate()}-${oneDayAgo.getMonth() + 1}-${oneDayAgo.getFullYear()}`;
    await redis.del(expiredKey); // Delete key from yesterday

    const membersInfo = members.map((member: string) => JSON.parse(member));

    return res.status(200).json(membersInfo);
  } catch (error) {
    console.error('Error in getRecentMembers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
