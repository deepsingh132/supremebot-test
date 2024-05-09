import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import WelcomeChannel from '../../database/models/WelcomeChannel';
import { logAction } from '../../utils/logHandler';
import { convertColor } from '../../utils/convertColors';
import { Colors } from '../../configs/colors.json';

export const removeWelcomeChannel = new SlashCommandBuilder()
  .setName('remove-welcome-channel')
  .setDescription(
    'Remove a welcome channel.',
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((option) =>
    option
      .setName('target-channel')
      .setDescription('The channel to remove welcome message from.')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(true),
);

export async function removeWelcomeChannelHandler(interaction: ChatInputCommandInteraction) {
  try {
    const targetChannel = interaction.options.getChannel('target-channel');

    if (!targetChannel) return await interaction.reply({ content: 'Please provide a valid channel', ephemeral: true });

    await interaction.deferReply({ ephemeral: true });

    const welcomeChannel = await WelcomeChannel.findOne({ channelId: targetChannel.id });

    if (!welcomeChannel) {
      return await interaction.followUp({ content: `That channel has not been configured for welcome messages.` });
    }

    try {
      await WelcomeChannel.deleteOne({ channelId: targetChannel.id });
      logAction({
        bot: interaction.client,
        context: 'Welcome Channel Removed ✅',
        color: convertColor(Colors.GREEN),
      });
      return await interaction.followUp({ content: `Welcome channel has been removed from <#${targetChannel.id}>` });
    } catch (error) {
      console.error(`Error in ${__filename}:\n`, error);
      logAction({
        bot: interaction.client,
        context: 'Welcome Channel Remove Failed ❌',
        color: convertColor(Colors.RED),
      });
      return await interaction.followUp({ content: `Database error. Please try again later.` });
    }

  } catch (error) {
    console.error(`Error in ${__filename}:\n`, error);
  }
}