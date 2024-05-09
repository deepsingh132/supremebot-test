import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';
import { LevelModel, Level } from '../../database/models/Level';
import { Redis } from 'ioredis';
import { convertColor } from '../../utils/convertColors';
import { Colors } from '../../configs/colors.json';

export const getLeaderboardCommand = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Shows the leaderboard of the server!');

export async function getLeaderboard(
  interaction: ChatInputCommandInteraction,
  redis: Redis,
) {
  try {
    const redisKey = `leaderboard:${interaction.guildId}`;

    // check if leaderboard is cached
    const cachedLeaderboard = await redis.get(redisKey);
    if (cachedLeaderboard) {
      const leaderboard = JSON.parse(cachedLeaderboard) as Level[];
      let table = '```md\n';
      table += 'Rank | User                | Level | XP    \n';
      table += '-------------------------------------------------\n';

      leaderboard.forEach((member, index) => {
        const rank = index + 1;
        const username = `${member.username.substring(0, 15)}`; // truncate username to 15 characters
        const level = member.level;
        const xp = member.xp;

        table += `${rank.toString().padEnd(5)}| ${username.padEnd(20)}| ${level.toString().padEnd(6)}| ${xp.toString().padEnd(15)}\n`;
      });

      table += '```';

      const embed = new EmbedBuilder()
        .setTitle('Server Leaderboard (Cached)')
        .setDescription(table)
        .setColor(convertColor(Colors.TRON));

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const leaderboard = await LevelModel.find({ guildId: interaction.guildId })
      .sort({ level: -1, xp: -1 })
      .limit(10);

    if (!leaderboard || leaderboard.length === 0) {
      return 'Leaderboard is empty!';
    }

    let table = '```md\n';
    table += 'Rank | User                | Level | XP    \n';
    table += '-------------------------------------------------\n';

    leaderboard.forEach((member, index) => {
      const rank = index + 1;
      const username = `${member.username.substring(0, 15)}`; // truncate username to 15 characters
      const level = member.level;
      const xp = member.xp;

      table += `${rank.toString().padEnd(5)}| ${username.padEnd(20)}| ${level.toString().padEnd(6)}| ${xp.toString().padEnd(15)}\n`;
    });

    table += '```';

    // cache the leaderboard
    await redis.set(redisKey, JSON.stringify(leaderboard), 'EX', 60 * 5);

    const embed = new EmbedBuilder()
      .setTitle('Server Leaderboard')
      .setDescription(table)
      .setColor(convertColor(Colors.TRON));

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    await interaction.reply('Error fetching leaderboard!');
  }
}
