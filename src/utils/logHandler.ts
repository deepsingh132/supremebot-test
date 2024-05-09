import {
  ChannelType,
  Client,
  ColorResolvable,
  Guild,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';

import { Colors } from '../configs/colors.json';
import { sendEmbed } from './embedBuilder';

export async function setupBotLogsChannel(params: {
  bot: Client;
  guild: Guild;
}) {
  const { bot, guild } = params;
  const channelName = 'bot-logs';

  if (!guild.available || !bot.user?.id) {
    console.error('Guild or bot id not available');
    return;
  }

  let botLogsChannel = guild.channels.cache.find(
    (channel) =>
      channel.name === channelName && channel.type === ChannelType.GuildText,
  );

  let botLogsCategory;

  // If 'bot logs' channel doesn't exist, create it
  if (!botLogsChannel) {
    // create a new category for the bot logs
    try {
      botLogsCategory = await guild.channels.create({
        name: 'Bot Logs',
        type: ChannelType.GuildCategory,
        position: guild.channels.cache.size,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages], // Prevents everyone from sending messages
          },
        ],
      });
    } catch (error) {
      console.error('Error creating bot logs category:', error);
    }
    try {
      botLogsChannel = await guild.channels.create({
        name: 'bot-logs',
        type: ChannelType.GuildText,
        topic: 'Log of bot actions',
        parent: botLogsCategory,
        // make the channel at the bottom of the list
        position: guild.channels.cache.size,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages], // Prevents everyone from sending messages
          },
        ],
      });
    } catch (error) {
      console.error('Error creating bot logs channel:', error);
    }
  }

  return botLogsChannel;
}

export async function logAction(params: {
  bot: Client;
  context: string;
  color: ColorResolvable;
}) {
  const { bot, context, color } = params;

  const guild = bot.guilds.cache.first() as Guild;

  // console.log('Guild: ', guild);

  const botLogsChannel = await setupBotLogsChannel({ bot, guild });

  if (!botLogsChannel) {
    console.error('Bot logs channel not found');
    return;
  }

  const channel = bot.channels.cache.get(botLogsChannel.id);
  // (channel as TextChannel).send(msg);
  await sendEmbed(channel as TextChannel, color, 'Bot Action',null, context, null);
}
