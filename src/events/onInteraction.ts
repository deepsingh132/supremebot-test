import { ColorResolvable, EmbedBuilder, Interaction } from "discord.js";

function getRandomColor(): ColorResolvable {
  return Math.floor(Math.random() * 16777215);
}

export const onInteraction = async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const color =  getRandomColor();

  if (commandName === "ping") {

    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription('Ping!')
      .setColor(color)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === "user") {
    const user = interaction.user;
    const embed = new EmbedBuilder()
      .setTitle('User Info')
      .setDescription(`The user's username is ${user.tag}`)
      .addFields(
        { name: 'User ID', value: user.id },
      )
      .setColor(color)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === "server") {
    const embed = new EmbedBuilder()
      .setTitle('Server Info')
      .setDescription(`The server's name is ${interaction.guild!.name}`)
      .setColor(color)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};