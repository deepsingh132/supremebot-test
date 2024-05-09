import { GuildMember } from "discord.js";
import { Redis } from "ioredis";

export async function storeMemberListForLast24Hours(member: GuildMember, redis: Redis, keyPrefix : string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Milliseconds in a day

  // Generate a unique key for today's joined members list
  const key = `${keyPrefix}:${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`; // Format: joined_members:DD-MM-YYYY

  // Check if member already in list today (avoid duplicates)
  const isMemberExists = await redis.sismember(key, member.id);
  if (isMemberExists) {
    return;
  }

  // Prepare member data as JSON object
  const memberData = {
    id: member.id,
    avatar: member.user.avatarURL() || '',
    username: member.user.username,
    discriminator: member.user.discriminator,
    timestamp: keyPrefix === "joined_members" ? member.joinedAt?.toISOString() || now.toISOString() : now.toISOString(),
  };

  // Add member data (JSON string) to the set for today
  await redis.sadd(key, JSON.stringify(memberData));

  // Clean up old data (optional)
  const expiredKey = `${keyPrefix}:${oneDayAgo.getFullYear()}-${oneDayAgo.getMonth() + 1}-${oneDayAgo.getDate()}`;
  await redis.del(expiredKey); // Delete key from yesterday
}