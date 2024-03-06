import { Client } from 'discord.js';
import { onMessage } from './onMessage';
import { onInteraction } from "./onInteraction";

export const handleEvents = (bot: Client) => {
  bot.on('ready', () => {
    if (bot.user) {
      console.log(`${bot.user.tag} is online!`);
    }
  });

  bot.on('messageCreate', async (msg) => {
    await onMessage(bot, msg)
  });

  bot.on('interactionCreate', async (interaction) => {
    await onInteraction(interaction);
  });
};