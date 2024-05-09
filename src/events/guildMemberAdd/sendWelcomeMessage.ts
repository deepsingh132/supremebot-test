import { GuildMember, TextChannel } from "discord.js";
import WelcomeChannel, { WelcomeChannelType } from "../../database/models/WelcomeChannel";
import { Redis } from "ioredis";
import { logAction } from "../../utils/logHandler";
import { Colors } from "../../configs/colors.json";
import { convertColor } from "../../utils/convertColors";
import Features from "../../database/models/Features";

export async function sendWelcomeMessage(member: GuildMember, redis: Redis) {
  try {
    if (member.user.bot) return;

    // Early return if the feature is disabled
    const feature = await Features.findOne({ name: 'Welcome Messages' });
    if (!feature?.isEnabled) return;

    // get the first welcome channel
    const channel = await WelcomeChannel.findOne({ guildId: member.guild.id});
    if (!channel) return;

    const targetChannel = member.guild.channels.cache.get(channel.channelId) as TextChannel;

    if (!targetChannel) {
      await WelcomeChannel.findOneAndDelete({ channelId: channel.channelId });
      logAction({
        bot: member.client,
        context: 'Welcome Channel Removed from database due to missing channel ✅',
        color: convertColor(Colors.GREEN),
      });
      return;
    }

     const message = channel.customMessage || `Hey {mention-member}, welcome to {server-name}!`;

    const formattedMessage = message
      .replace(/{username}/g, member.user.username)
      .replace(/{mention-member}/g, `<@${member.user.id}>`)
      .replace(/{server-name}/g, member.guild.name);

    targetChannel.send(formattedMessage).catch((error) => {
      console.error('Error sending welcome message:', error);
    });
  } catch (error) {
    console.error(`Error in ${__filename}: `, error);
  }
}