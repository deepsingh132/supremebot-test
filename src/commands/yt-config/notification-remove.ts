import {
  ChannelType,
  ChatInputCommandInteraction,
  ColorResolvable,
  // Colors,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import NotificationConfig from '../../database/models/NotificationConfig';
import { logAction } from '../../utils/logHandler';
import { Colors } from '../../configs/colors.json';
import { convertColor } from '../../utils/convertColors';


export const removeYTNotification = new SlashCommandBuilder()
  .setName('notification-remove')
  .setDescription('Remove a YouTube notification for a channel')
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
      .setDescription('The channel to turn off the notification for')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(true),
  );

export const removeYTNotificationHandler = async (
  interaction: ChatInputCommandInteraction,
) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    const targetYtChannelId = interaction.options.getString('youtube-id');
    const targetNotificationChannel =
      interaction.options.getChannel('target-channel');

    if (!targetYtChannelId || !targetNotificationChannel) {
      await interaction.reply({
        content: 'Please provide a YouTube channel ID and a target channel',
        ephemeral: true,
      });
      return;
    }

    const targetChannel = await NotificationConfig.findOne({
      ytChannelId: targetYtChannelId,
      notificationChannelId: targetNotificationChannel.id,
    });

    if (!targetChannel) {
      await interaction.followUp(
        'That YouTube channel has not been configured for notifications',
      );
      return;
    }

    NotificationConfig.findOneAndDelete({
      _id: targetChannel._id,
    })
      .then(() => {
        interaction.followUp(
          '✅ Turned off the notifications for that YouTube channel!',
        );
        logAction({
          bot: interaction.client,
          context:
            `Turned off the notifications for ${targetYtChannelId} in ${targetNotificationChannel.name}`,
          color: convertColor(Colors.GREEN),
        });
      })
      .catch((error) => {
        console.error('Error in removeYTNotificationHandler:', error);
        interaction.followUp('There was a database error. Please Try again in a moment.');
      });

  } catch (error) {
    console.error('Error in removeYTNotificationHandler:', error);
    await interaction.reply({
      content: 'There was an error while removing the notification',
      ephemeral: true,
    });
  }
};
