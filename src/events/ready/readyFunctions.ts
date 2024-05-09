import { Client, ActivityType } from 'discord.js';
import { assignRoleChannel } from './createRolesChannel';
import { rockPaperGame } from '../../commands/games/rockPaper';
import { getLevel } from '../../commands/economy/level';
import { userData } from '../../commands/basic/basicCommands';
import { setupYTNotification } from '../../commands/yt-config/notification-setup';
import { removeYTNotification } from '../../commands/yt-config/notification-remove';
import { checkYoutube } from './check-youtube';
import { Redis } from 'ioredis';
import { setupWelcomeChannel } from '../../commands/welcomer/setup-welcome-channel';
import { removeWelcomeChannel } from '../../commands/welcomer/remove-welcome-channel';
import { setupSimulateJoin } from '../../commands/welcomer/simulate-join';
import { getLeaderboardCommand } from '../../commands/economy/leaderboard';
import { getRankCommand } from '../../commands/economy/rank';
import { playCommand } from '../../commands/audio/play';
import { controlsCommand } from '../../commands/audio/controls';

let status = [
  {
    name: 'Sabka badla lega tera SupremeBot',
    type: ActivityType.Custom,
    state: '🦾 Sabka badla lega tera SupremeBot',
  },
  {
    name: 'democracy get destroyed',
    type: ActivityType.Watching,
    state: '👀',
  },
];

export const readyFunctions = async (bot: Client, redis: Redis) => {
  // Add ready functions here
  await assignRoleChannel(bot);

  // set initial status
  const randomStatus = status[1];
  bot.user?.setActivity(randomStatus.name, {
    type: randomStatus.type,
    state: randomStatus?.state,
  });

  // Rotate bot status every 5 minutes
  setInterval(
    () => {
      const randomStatus = status[Math.floor(Math.random() * status.length)];
      bot.user?.setActivity(randomStatus.name, {
        type: randomStatus.type,
        state: randomStatus?.state,
      });
    },
    1000 * 60 * 2,
  ); // 2 minutes

  // Set up commands

  if (!bot.application?.commands) return;
  // Create rock paper scissor command
  bot.application.commands.create(rockPaperGame);
  // Create level command
  bot.application.commands.create(getLevel);
  // Create user command
  bot.application.commands.create(userData);
  // Create notification setup command
  bot.application.commands.create(setupYTNotification);
  // Create notification remove command
  bot.application.commands.create(removeYTNotification);
  // Create welcome channel command
  bot.application.commands.create(setupWelcomeChannel);
  // Create remove welcome channel command
  bot.application.commands.create(removeWelcomeChannel);
  // Create simulate send welcome message command
  bot.application.commands.create(setupSimulateJoin);
  // Create Leaderboard command
  bot.application.commands.create(getLeaderboardCommand);
  // Create Rank command
  bot.application.commands.create(getRankCommand);
  // Create Audio play command
  bot.application.commands.create(playCommand);
  // Create audio controls command
  bot.application.commands.create(controlsCommand);

  checkYoutube(bot, redis);

  // Check youtube every 15 minutes
  setInterval(() => checkYoutube(bot, redis), 1000 * 60 * 15); // 15 minutes
};
