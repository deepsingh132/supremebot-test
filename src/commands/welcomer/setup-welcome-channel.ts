import { ChannelType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import WelcomeChannel from '../../database/models/WelcomeChannel';
import { logAction } from '../../utils/logHandler';
import { Colors } from '../../configs/colors.json';
import { convertColor } from '../../utils/convertColors';

export const setupWelcomeChannel = new SlashCommandBuilder()
  .setName('setup-welcome-channel')
  .setDescription('Setup a channel to send a welcome message when a user joins the server.')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((option) =>
    option
      .setName('target-channel')
      .setDescription('The channel to set as the welcome channel')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('custom-message')
      .setDescription(`TEMPLATES: {user} {mention-member} {server-name} to mention the user and server.`)
      .setRequired(false),
  );

export async function welcomeChannelHandler(interaction: ChatInputCommandInteraction) {
  try {
    const targetChannel = interaction.options.getChannel('target-channel');
    const customMessage = interaction.options.getString('custom-message');

    if (!targetChannel) return await interaction.reply({ content: 'Please provide a valid channel', ephemeral: true });

    await interaction.deferReply({ ephemeral: true });

    const welcomeChannel = await WelcomeChannel.findOne({ channelId: targetChannel.id });

    if(!welcomeChannel) {
      const newWelcomeChannel = new WelcomeChannel({
        guildId: interaction.guildId,
        channelId: targetChannel.id,
        customMessage: customMessage || ''
      });

      try {
        await newWelcomeChannel.save();
        logAction({
          bot: interaction.client,
          context: 'Welcome Channel Setup Success ✅',
          color: convertColor(Colors.GREEN),
        });
        return await interaction.followUp({ content: `Welcome channel has been set to <#${targetChannel.id}>` });
      } catch (error) {
        console.error(`Error in ${__filename}:\n`, error);
        logAction({
          bot: interaction.client,
          context: 'Welcome Channel Setup Failed ❌',
          color: convertColor(Colors.RED),
        });
        return await interaction.followUp({ content: `Database error. Please try again later.` });
      }
    }

    interaction.followUp({ content: `Welcome channel has already been set to <#${targetChannel.id}>` });

  } catch (error) {
    console.error(`Error in ${__filename}:\n`, error)
  }
}