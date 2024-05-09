import { Client, ColorResolvable, Message, TextChannel } from 'discord.js';
import { LevelModel } from '../../database/models/Level';
import calcLevelXp from '../../utils/calcLevelXp';
import { sendEmbed } from '../../utils/embedBuilder';
import { Colors } from '../../configs/colors.json';
import { logAction } from '../../utils/logHandler';
import { embedImages } from '../../configs/embedUrls.json';
import { convertColor } from '../../utils/convertColors';
import Features from '../../database/models/Features';

// To prevent spamming
const cooldowns = new Set<string>();

function getRandomXp(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Client} bot
 * @param {Message} message
 */

export async function giveUserXp(bot: Client, message: Message) {
  if (
    !message.inGuild() ||
    message.author.bot ||
    cooldowns.has(message.author.id)
  )
    return;

  const feature = await Features.findOne({ name: 'Levelling System' });
  // If the feature is disabled, return
  if (!feature?.isEnabled) return;

  const xpToGive = getRandomXp(10, 15);

  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  try {
    const level = await LevelModel.findOne(query);
    if (!level) {
      const newLevel = new LevelModel({
        userId: message.author.id,
        username: message.author.displayName,
        guildId: message.guild.id,
        xp: xpToGive,
        level: 0,
      });
      await newLevel.save();
      // Set a cooldown to prevent spamming
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    } else {
      level.xp += xpToGive;

      if (level.xp > calcLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;

        await sendEmbed(
          message.channel as TextChannel,
          convertColor(Colors.TRON),
          'Level Up!',
          embedImages.lvlUp,
          `GG ${message.member}! You have advanced to level ${level.level}!`,
          null,
        );
        await logAction({
          bot,
          context: `upgraded ${message.member} to level ${level.level}!`,
          color: convertColor(Colors.TRON),
        });
      }

      await level.save().catch((e) => {
        console.error(`Error saving updated level: ${e}`);
        return;
      });
      // Set a cooldown to prevent spamming
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
  } catch (error) {
    console.error(`Error granting xp: ${error}`);
  }
}
