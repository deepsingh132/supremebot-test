require('dotenv').config();
import NotificationConfig, {
  NotificationConfigType,
} from '../../database/models/NotificationConfig';
import {
  Client,
  Colors,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';

import { Redis } from 'ioredis';
import Features from '../../database/models/Features';


type YoutubeData = {
  kind: string;
  etag: string;
  regionCode: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
  id: { kind: string; videoId: string };
  items: [
    {
      kind: string;
      etag: string;
      id: { kind: string; videoId: string };
      snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
          default: { url: string; width: number; height: number };
          medium: { url: string; width: number; height: number };
          high: { url: string; width: number; height: number };
        };
        channelTitle: string;
        liveBroadcastContent: string;
        publishTime: string;
      };
    },
  ];
};

type redisData = { id: string; pubDate: Date };

async function hitYoutubeApi(channelId: string, apiKey: string) {
  console.log('Checking youtube...');
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}&maxResults=1`,
    // cache the response to avoid rate limiting
    { cache: 'force-cache' },
  );
  return (await res.json()) as YoutubeData;
}

async function sendNotification(
  bot: Client,
  config: NotificationConfigType,
  data: YoutubeData,
) {
  const liveVideo = data.items[0];
  const videoId = liveVideo.id.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const notifyChannel = bot.channels.cache.get(
    config.notificationChannelId,
  ) as TextChannel;
  const ytChannelName = liveVideo.snippet.channelTitle;
  const customMessage = config.customMessage ? config.customMessage + ` ${videoId}` : `Hey @everyone ${ytChannelName} just went live! \n${videoUrl}`;

  const liveEmbed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle(`🔴  ${' ' + liveVideo.snippet.title}`)
    .setURL(videoUrl)
    .setAuthor({
      name: ytChannelName,
      iconURL: 'https://yt3.ggpht.com/T4ThRGFw1nFeESeFfVeeA-905Q_56uWK4aiL_mIF2eEjjdbJ2r4qovctwbc39WKmlkCMkyjkU50=s88-c-k-c0x00ffffff-no-rj',
      url: `https://www.youtube.com/channel/${liveVideo.snippet.channelId}`,
    })
    .setDescription(`${liveVideo.snippet.description}`)
    .setImage(liveVideo.snippet.thumbnails.high.url);

  if (notifyChannel && config.lastCheckedVid?.id !== videoId) {
    notifyChannel.send({ content: customMessage, embeds: [liveEmbed] });

    try {
      config.lastCheckedVid = {
        id: videoId,
        pubDate: new Date(),
      };
      await config.save();
      console.log('Saved last checked video to db.');
    } catch (error) {
      console.error('Error saving lastCheckedVid:', error);
    }
    console.log('Sent live notification to:', notifyChannel.name);
  }
}

async function checkLastLive(redis: Redis) {
  const lastLive = await redis.get(`yt:lastLive`);
  if (lastLive) {
    const lastLiveVid = JSON.parse(lastLive) as redisData;
    const lastLiveDate = new Date(lastLiveVid.pubDate);
    const now = new Date();
    const diff = now.getTime() - lastLiveDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60)); // 6 hours
    if (hours < 6) {
      console.log('Last live: ', lastLiveDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      console.log('Last live video was less than 6 hours ago');
      return true;
    }
    console.log('Last live video was more than 6 hours ago');
  }
  return false;
}

async function saveLastLive(redis: Redis, videoId: string) {
  const key = `yt:lastLive`;
  const redisData = JSON.stringify({
    id: videoId,
    pubDate: new Date(),
  });
  const lastLiveCacheExpiry = parseInt(process.env.YOUTUBE_LAST_LIVE_CACHE_EXPIRY || '21600'); // 6 hours
  await redis.set(key, redisData, 'EX', lastLiveCacheExpiry); // 6 hours
  console.log('Saved last live video to Redis.');
}

export async function checkYoutube(bot: Client, redis: Redis) {
  try {
    const config = await NotificationConfig.findOne({ isEnabled: true });
    const feature = await Features.findOne({
      name: 'Youtube Live Notifications',
    });

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error('Youtube API key not found!');
    }

    // early return if no notification config is found or is disabled
    if (!config || !feature?.isEnabled) {
      throw new Error('No notification config found or is disabled!');
    }

    // early return if last live video was broadcasted less than 6 hours ago
    const lastLiveRecently = await checkLastLive(redis);
    if (lastLiveRecently) {
      console.log('Skipping YouTube API check due to recent live video.');
      return;
    }

    const data = await hitYoutubeApi(config.ytChannelId, apiKey);
    console.log('YouTube API response: ', data);
    if (data.items && data.items.length) {
      await sendNotification(bot, config, data); // The channel is live, send notification
      await saveLastLive(redis, data.items[0].id.videoId); // send to redis to avoid hitting the youtube api again
    }
  } catch (error) {
    console.error(`Error in ${__filename}:\n`, error);
  }
}