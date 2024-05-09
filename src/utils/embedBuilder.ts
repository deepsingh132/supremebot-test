import { Channel, ColorResolvable, EmbedBuilder, Message, TextChannel } from "discord.js";

export const sendEmbed = async (
  channel: TextChannel,
  color: ColorResolvable,
  title: string,
  thumbnail: string | null,
  description: string,
  img: string | null
) => {

  if (!channel) {
    console.error('Channel not found');
    return;
  }
  try {
    const embed = new EmbedBuilder()
      .setTitle(title)
      // .setAuthor({
      //   name: 'SupremeBot'
      // })
      .setThumbnail(thumbnail)
      .setColor(color)
      .setDescription(description)
      .setImage(img)
      .setTimestamp();

  channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending embed:', error);
  }
};