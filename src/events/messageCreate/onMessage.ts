import { Client, Message } from 'discord.js';
import { giveUserXp } from './giveUserXp';
import { Redis } from 'ioredis';
import { checkForBannedWords } from './checkBannedWords';


export const onMessage = async (bot: Client, msg: Message, redis: Redis) => {
  if (msg.author.bot) return;
  // Check for banned words
  checkForBannedWords(msg, redis);
  // Give user xp
  giveUserXp(bot, msg);
};
