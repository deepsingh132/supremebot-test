require('dotenv').config();
import Keywords from '../../database/models/Keywords';
import { handleStrike } from '../../utils/handleStrike';
import { logAction } from '../../utils/logHandler';
import { Colors } from '../../configs/colors.json';
import { Redis } from 'ioredis';
import { Message } from 'discord.js';
import { convertColor } from '../../utils/convertColors';
import Features from '../../database/models/Features';


/**
 * Redis Implemented (✅)
 */

// create a local cache for the keywords
let keywordCache = [] as string[];
// set the cache expiry time: 60*60*24*1000
let cacheExpiry = parseInt(process.env.KEYWORD_CACHE_EXPIRY || '86400000'); // 24 hours in milliseconds

// fetch the keywords from the database
const fetchAndUpdateKeywords = async (redis: Redis) => {
  const keywordData = await Keywords.find({});
  keywordCache = keywordData.map((word) => word.keywords).flat();
  // console.log('Updated Keywords: ', keywordCache);
  // set the cache in redis
  await redis.set(
    'keywords',
    JSON.stringify(keywordCache),
    'EX',
    cacheExpiry / 1000,
  );
};

//Function to preprocess the message and remove all spaces
function preprocessMessage(message: string) {
  // Remove special characters, spaces, and symbols except letters
  let processedMessage = message.replace(/[^a-zA-Z]/g, '');

  return processedMessage.trim().toLowerCase();
}

export async function checkForBannedWords(msg: Message, redis: Redis) {
  if (!msg.guild) return;

  // Early return if the feature is disabled
  const feature = await Features.findOne({ name: 'Auto Mod' });
  if (!feature?.isEnabled) return;

  // Check if the cache needs to be updated based on expiration time
  const currentTime = new Date().getTime();
  const lastUpdatedTime = await redis.get('keywordsLastUpdated');

  // Fetch and update the keywords if the local cache is empty or expired
  if (keywordCache.length === 0 || !lastUpdatedTime || currentTime - parseInt(lastUpdatedTime) > cacheExpiry) {
    await fetchAndUpdateKeywords(redis);
    await redis.set('keywordsLastUpdated', currentTime.toString());
  }

  const messageContent = msg.content.toLowerCase();
  const processedMessage = preprocessMessage(messageContent);
  const hasKeyword = keywordCache.some((word) =>
    processedMessage.includes(word),
  );

  if (hasKeyword) {
    // delete the message
    // await msg.delete();
    // console.log('Keyword invoked!');

    // delete the message after 5 seconds
    // setTimeout(async () => {
    //   await msg.delete();
    // }, 5000);


    // Log the action to the bot-logs channel
    await logAction({
      bot: msg.client,
      context: `${msg.member} used a banned word`,
      color: convertColor(Colors.YELLOW),
    });
    await handleStrike(msg, redis);
  }
}
