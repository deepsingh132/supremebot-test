import { ChatInputCommandInteraction, Client, Events, SlashCommandBuilder, GuildMember, PermissionFlagsBits } from 'discord.js';
import WelcomeChannel from '../../database/models/WelcomeChannel';
import Features from '../../database/models/Features';

export const setupSimulateJoin = new SlashCommandBuilder()
  .setName('simulate-join')
  .setDescription('Simulate a member joining the server')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option
      .setName('member')
      .setDescription('The member to simulate joining the server')
  );

export async function simulateJoinHandler (bot : Client, interaction: ChatInputCommandInteraction) {
  try {
    const targetUser = interaction.options.getUser('member');

    // early return if the feature is disabled
    const feature = await Features.findOne({ name: 'Welcome Messages' });
    if (!feature?.isEnabled) {
      return await interaction.reply({
        content: `Welcome messages are not enabled. Please enable the feature first.`,
        ephemeral: true,
      });
    }

    let member;

    if (targetUser) {
      member =
        interaction.guild?.members.cache.get(targetUser.id) ||
        (await interaction.guild?.members
          .fetch(targetUser.id)
          .catch(() => null));
    } else {
      member = interaction.member;
    }

    bot.emit(Events.GuildMemberAdd, member as GuildMember);

    // get the first welcome channel
    const channel = await WelcomeChannel.findOne({ guildId: interaction.guildId });
    if (!channel) {
      return await interaction.reply({
        content: `No welcome channel has been set up. Please set up a welcome channel first.`,
        ephemeral: true,
      });
    }

    return await interaction.reply({
      content: `Simulated join for ${member?.user}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error(`Error in ${__filename}:\n`, error);
    return await interaction.reply({ content: `An error occurred. Please try again later.`, ephemeral: true });
  }
};