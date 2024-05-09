import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { LevelModel, Level } from '../../database/models/Level';
import { convertColor } from '../../utils/convertColors';
import { Colors } from '../../configs/colors.json';
import { Redis } from 'ioredis';

export const getRankCommand = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('Shows the rank of the user!')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user you want to check the rank of'),
  );

export async function getRank(
  interaction: ChatInputCommandInteraction,
  redis: Redis,
) {
  try {
    const redisKey = `ranks:${interaction.guildId}`;

    const user = interaction.options.getUser('user') || interaction.user;

    // if user is a bot, return
    if (user.bot) {
      interaction.reply({
        content: "I don't need a rank, I'm already the best 😎!",
        ephemeral: true,
      });
    }

    const level = await LevelModel.findOne({
      userId: user.id,
      guildId: interaction.guildId,
    });

    if (!level) {
      interaction.reply({
        content: 'This user has not earned any XP yet!',
        ephemeral: true,
      });
    }

    const leaderboard = await LevelModel.find({
      guildId: interaction.guildId,
    }).sort({ level: -1, xp: -1 }); // sort by level and xp

    const userRank = leaderboard.findIndex(
      (member) => member.userId === user.id,
    );

    await redis.set(redisKey, JSON.stringify(leaderboard), 'EX', 60 * 2); // cache for 2 minutes

    // display rank in code block
    let rank = '```md\n';
    rank += `#${userRank + 1}`;
    rank += '```';

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Rank`)
      .setDescription(`Rank: ${rank}`) // add 1 to make it human readable
      .setColor(convertColor(Colors.TRON));

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
}
