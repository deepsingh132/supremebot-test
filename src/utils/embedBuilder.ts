import { Channel, ColorResolvable, EmbedBuilder, Message, TextChannel } from "discord.js";

export const sendEmbed = async (
  channel: TextChannel,
  color: string,
  title: string,
  description: string,
) => {
  try {
    const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color as ColorResolvable)
    .setDescription(description)
    .setTimestamp();

  channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending embed:', error);
  }


};