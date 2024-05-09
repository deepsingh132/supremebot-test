import {
  Client,
  Interaction,
} from 'discord.js';
import { showRankCard } from '../../commands/economy/level';
import { playRockPaperScissors } from '../../commands/games/rockPaper';
import { Redis } from 'ioredis';
import { getServerInfo, getUserData, pingPong } from '../../commands/basic/basicCommands';
import { setupYTNotificationHandler } from '../../commands/yt-config/notification-setup';
import { removeYTNotificationHandler } from '../../commands/yt-config/notification-remove';
import { welcomeChannelHandler } from '../../commands/welcomer/setup-welcome-channel';
import { removeWelcomeChannelHandler } from '../../commands/welcomer/remove-welcome-channel';
import { simulateJoinHandler } from '../../commands/welcomer/simulate-join';
import { getLeaderboard } from '../../commands/economy/leaderboard';
import { getRank } from '../../commands/economy/rank';
import Features from '../../database/models/Features';
import { playCommandHandler } from '../../commands/audio/play';
import { controlsCommandHandler } from '../../commands/audio/controls';


export const onInteraction = async (bot: Client, interaction: Interaction, redis: Redis) => {

  if (!interaction.isChatInputCommand()) return;

  // early return if the feature is disabled
  const feature = await Features.findOne({ name: 'Bot Commands' });
  if (!feature?.isEnabled) {
    await interaction.reply({
      content: `Bot Commands are disabled. Please try again later.`,
      ephemeral: true,
    });
    return;
  }

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await pingPong(interaction);
  }

  if (commandName === 'user') {
    await getUserData(interaction);
  }

  if (commandName === 'server') {
   await getServerInfo(interaction);
  }

  if (commandName === 'level') {
    await showRankCard(interaction, redis);
  }

  if (commandName === 'rank') {
    await getRank(interaction, redis);
  }

  if (commandName === 'rock-paper-scissors') {
    await playRockPaperScissors({ interaction });
  }

  if (commandName == 'setup-welcome-channel') {
    await welcomeChannelHandler(interaction);
  }

  if (commandName === 'remove-welcome-channel') {
    await removeWelcomeChannelHandler(interaction);
  }

  if (commandName === 'simulate-join') {
    await simulateJoinHandler(bot, interaction);
  }

  if (commandName === 'notification-setup') {
      await setupYTNotificationHandler(bot, interaction);
  }

  if (commandName === 'notification-remove') {
    await removeYTNotificationHandler(interaction);
  }

  if (commandName === 'leaderboard') {
    getLeaderboard(interaction, redis);
  }

  if(commandName === 'play') {
    await playCommandHandler(interaction);
  }

  if (commandName === 'controls') {
    await controlsCommandHandler(interaction);
    await interaction.reply({
      content: '```md\n# Audio Player Controls\n\n- /play url <url> - Play a song from a URL\n- /play search <searchterms> - Search for a song to play\n- /play playlist <url> - Play a playlist from a URL\n- /controls - Show this message\n```',
    });
  }

};