import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("user")
  .setDescription("Provides information about the user.");
export async function execute(interaction: ChatInputCommandInteraction) {
  // interaction.user is the object representing the User who ran the command
  // interaction.member is the GuildMember object, which represents the user in the specific guild
  if (!interaction.channel || !interaction.member) return;
  await interaction.reply(
    `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}\nYour guild id: ${interaction.guildId}`
  );
}
