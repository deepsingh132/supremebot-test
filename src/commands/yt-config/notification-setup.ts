import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  ColorResolvable,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';

import NotificationConfig from '../../database/models/NotificationConfig';
import Parser from 'rss-parser';
import { logAction } from '../../utils/logHandler';
// import { sendEmbed } from '../../utils/embedBuilder';
import { Colors } from '../../configs/colors.json';
import { convertColor } from '../../utils/convertColors';

const parser = new Parser();

export const setupYTNotification = new SlashCommandBuilder()
  .setName('notification-setup')
  .setDescription('Set up a YouTube notification for a channel')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName('youtube-id')
      .setDescription('The YouTube channel ID')
      .setRequired(true),
  )
  .addChannelOption((option) =>
    option
      .setName('target-channel')
      .setDescription('The channel to send the notification to')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('custom-message')
      .setDescription(
        'Templates: {VIDEO_TITLE}, {VIDEO_URL}, {CHANNEL_NAME}, {CHANNEL_URL}',
      )
      .setRequired(false),
  );

export const setupYTNotificationHandler = async (
  bot: Client, interaction: ChatInputCommandInteraction,
) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    const targetYtChannelId = interaction.options.getString('youtube-id');
    const targetNotificationChannel =
      interaction.options.getChannel('target-channel');
    const targetCustomMessage = interaction.options.getString('custom-message');

    if (!targetYtChannelId || !targetNotificationChannel) {
      await interaction.reply({
        content: 'Please provide a YouTube channel ID and a target channel',
        ephemeral: true,
      });
      return;
    }

    // check if the notification is already set up
    const notificationExists = await NotificationConfig.find();

    // return if the channel is already configured
    if (notificationExists) {
      await interaction.reply(
        `The YouTube channel: ${notificationExists[0].ytChannelId} has already been configured for notifications.\nRun \`/notification-remove\` first.`,
      );
      return;
    }

    // if (duplicateExists) {
    //   interaction.followUp(
    //     'That YouTube channel has already been configured for this channel.\nRun `/notification-remove` first.',
    //   );
    //   return;
    // }

    const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${targetYtChannelId}`;

    const feed = await parser.parseURL(YOUTUBE_RSS_URL).catch((error) => {
      console.error(`Error occurred while parsing YouTube RSS: ${error}`);
      interaction.followUp(
        'An error occurred while fetching the YouTube channel. Ensure the ID is correct.',
      );
    });

    if (!feed) return;

    const channelName = feed.title;

    const notificationConfig = new NotificationConfig({
      guildId: interaction.guildId,
      notificationChannelId: targetNotificationChannel.id,
      ytChannelId: targetYtChannelId,
      customMessage: targetCustomMessage,
      lastChecked: new Date(),
      lastCheckedVid: null,
    });

    if (feed.items.length) {
      const latestVideo = feed.items[0];

      notificationConfig.lastCheckedVid = {
        id: latestVideo.id.split(':')[2],
        pubDate: latestVideo.pubDate as any,
      };
    }

    notificationConfig
      .save()
      .then(() => {
        const embed = new EmbedBuilder()
          .setTitle('YouTube Notification Setup Success!')
          .setColor(convertColor(Colors.GREEN))
          .setDescription(
            `✅  Successfully set up YouTube notifications for ${channelName} in <#${targetNotificationChannel.id}>`,
          )
          .setTimestamp();

        interaction.followUp({ embeds: [embed] });
        logAction({
          bot,
          context: 'YouTube Notification Setup done ✅',
          color: convertColor(Colors.GREEN),
        });
      })
      .catch((error) => {
        console.error(
          `Error occurred while saving notification config: ${error}`,
        );
        interaction.followUp(' Unexpected database error occurred. Try again in a moment.');
      });
  } catch (error) {
    console.error(`Error occurred in notification-setup: ${error}`);
    await interaction.reply({
      content: 'An error occurred while setting up the notification',
      ephemeral: true,
    });
  }
};
