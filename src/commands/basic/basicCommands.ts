import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ColorResolvable,
} from 'discord.js';

function getRandomColor(): ColorResolvable {
  return Math.floor(Math.random() * 16777215);
}

export const userData = new SlashCommandBuilder()
  .setName('user')
  .setDescription('Provides information about the user.')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to get information about.')
      .setRequired(false)
  );

export const ping = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function pingPong(interaction: ChatInputCommandInteraction) {
  // only reply if the interaction is in a guild
  if (!interaction.channel || !interaction.member) return;

  const color = getRandomColor();
  const embed = new EmbedBuilder()
    .setTitle('Pong!')
    .setDescription('Ping!')
    .setColor(color)
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
}

export async function getUserData(interaction: ChatInputCommandInteraction) {
  if (!interaction.channel || !interaction.member) return;

  const color = getRandomColor();

  const user = interaction.options?.getUser('user') || interaction.user;
  const embed = new EmbedBuilder()
    .setTitle('User Info')
    .setDescription(`The user's username is ${user.tag}`)
    .addFields({ name: 'User ID', value: user.id })
    .setColor(color)
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
}

export async function getServerInfo(interaction: ChatInputCommandInteraction) {
  if (!interaction.channel || !interaction.member) return;

  const color = getRandomColor();
  const embed = new EmbedBuilder()
    .setTitle('Server Info')
    .setDescription(`The server's name is ${interaction.guild!.name}`)
    .setColor(color)
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
}