import { Client, Events } from 'discord.js';
import { onMessage } from './messageCreate/onMessage';
import { onInteraction } from './interactionCreate/onInteraction';
import { readyFunctions } from './ready/readyFunctions';
import { assignRoles } from './ready/assignRole';
import { Redis } from 'ioredis';
import { sendWelcomeMessage } from './guildMemberAdd/sendWelcomeMessage';
import { storeMemberListForLast24Hours } from '../utils/storeMemberList';

export const handleEvents = (bot: Client, redisClient: Redis) => {
  bot.on(Events.ClientReady, async () => {
    if (bot.user) {
      console.log(`${bot.user.tag} is online!`);
    }
    await readyFunctions(bot, redisClient);
  });

  bot.on(Events.GuildMemberAdd, async (member) => {
    await sendWelcomeMessage(member, redisClient);
    await storeMemberListForLast24Hours(member, redisClient, 'joined_members');
  });

  bot.on(Events.MessageCreate, async (msg) => {
    await onMessage(bot, msg, redisClient);
  });

  bot.on(Events.InteractionCreate, async (interaction) => {
    await onInteraction(bot, interaction, redisClient);
    try {
      if (!interaction.isButton() || !interaction.member || !interaction.guild)
        return;
      await interaction.deferReply({ ephemeral: true });
      await assignRoles(interaction);
    } catch (error) {
      console.error('Error handling interaction:', error);
    }
  });
};
