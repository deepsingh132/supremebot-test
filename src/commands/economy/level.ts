import {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { LevelModel } from '../../database/models/Level';
import { RankCardBuilder, Font } from 'canvacord';
import calcLevelXp from '../../utils/calcLevelXp';
import { Colors } from '../../configs/colors.json';
import { Redis } from 'ioredis';


/**
 * Redis Implemented (✅)
 */

interface cachedData {
  xp: number;
  level: number;
  rankCard: string;
}


export const getLevel = new SlashCommandBuilder()
  .setName('level')
  .setDescription('Shows the level of the user!')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to show the level of!')
      .setRequired(true));

export async function showRankCard(interaction: ChatInputCommandInteraction, redis: Redis) {
  if (!interaction.inGuild()) {
    interaction.reply('This command can only be used in a server!');
    return;
  }

  await interaction.deferReply();

  if (!interaction.guild) return;

  const mentionedUserId = interaction.options.get('user')?.value;
  const targetUserId = mentionedUserId || interaction.member.user.id;

  // Define the Redis key for this user
  const redisKey = `level:${targetUserId}`;

  // Check if the user's data is in Redis cache
  let cachedData = await redis.get(redisKey);

  if (cachedData) {
    // If data exists in cache, parse it and use it
    cachedData = JSON.parse(cachedData);
    const { rankCard } = cachedData as any;

    const attachment = new AttachmentBuilder(Buffer.from(rankCard, 'base64'));

    await interaction.editReply({
      content: `Here is your rank card (cached data):`,
      files: [attachment],
    });

    return;
  }

  // check if the targetUserId is of the bot
  if (targetUserId === interaction.client.user?.id) {
    interaction.editReply(`I don't need a level! I'm already the best! 😎`);
    return;
  }

  const targetUserObj = await interaction.guild.members.fetch(
    targetUserId as string,
  );
  const fetchedLevel = await LevelModel.findOne({
    userId: targetUserId,
    guildId: interaction.guild.id,
  });

  if (!fetchedLevel) {
    interaction.editReply(
      mentionedUserId
        ? `The user ${targetUserObj.user.tag} has no level yet! Start chatting to gain XP!`
        : `You have no level yet! Start chatting to gain XP!`,
    );
    return;
  }

  let allLevels = await LevelModel.find({
    guildId: interaction.guild.id,
  }).select('_id userId level xp');
  allLevels.sort((a, b) => {
    if (a.level === b.level) {
      return b.xp - a.xp;
    } else {
      return b.level - a.level;
    }
  });

  let currentRank =
    allLevels.findIndex((level) => level.userId === targetUserId) + 1;

  const fontConfig = {
    progress: {
      level: {
        text: Font.loadDefault(),
        value: Font.loadDefault(),
      },
      xp: {
        text: Font.loadDefault(),
        value: Font.loadDefault(),
      },
      rank: {
        text: Font.loadDefault(),
        value: Font.loadDefault(),
      },
    },
    username: Font.loadDefault(),
  };

  const rank = new RankCardBuilder()
    .setUsername(targetUserObj.user.username)
    .setDisplayName(targetUserObj.displayName)
    .setAvatar(
      targetUserObj.user.displayAvatarURL({
        size: 256,
      }),
    )
    .setCurrentXP(fetchedLevel.xp)
    .setRequiredXP(calcLevelXp(fetchedLevel.level))
    .setStatus(targetUserObj.presence?.status as any)
    .setLevel(fetchedLevel.level)
    .setFonts(fontConfig as any)
    // .setStyles({
    //   progressbar: {
    //     container: {
    //       style: 'solid' as string,
    //       className: 'progressbar-container',
    //     },
    //     thumb: {
    //       style: 'solid' as any,
    //       className: 'progressbar-thumb',
    //     },
    //     track: {
    //       style: 'solid' as any,
    //       className: 'progressbar-track',
    //     },
    //   },
    // })
    .setRank(currentRank);

  const rankCard = await rank.build({
    format: 'png',
  });

  // Save the data to Redis cache
  const cachedDataObject = {
    xp: fetchedLevel.xp,
    level: fetchedLevel.level,
    rankCard: rankCard.toString('base64'),
  } as cachedData;

  // Cache the data for 60 seconds
  await redis.set(redisKey, JSON.stringify(cachedDataObject), 'EX', 60);

  const attachment = new AttachmentBuilder(rankCard);
  await interaction.editReply({
    files: [attachment],
  });
}
