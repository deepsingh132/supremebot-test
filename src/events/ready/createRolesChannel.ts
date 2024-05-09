import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  ColorResolvable,
  Guild,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import { configDotenv } from 'dotenv';
import roles from '../../configs/roles.json';
import { logAction } from '../../utils/logHandler';
import { Colors } from '../../configs/colors.json';
import { convertColor } from '../../utils/convertColors';

export async function createRolesChannel(bot: Client, guild: Guild) {
  const channelName = '★⋅roles⋅★';

  if (!guild.available || !bot.user?.id) {
    console.error('Guild or bot id not available');
    return;
  }

  let rolesChannel = guild.channels.cache.find(
    (channel) => channel.name === channelName && channel.type === ChannelType.GuildText,
  );

  let rolesCategory;

  // If 'roles' channel doesn't exist, create it
  if (!rolesChannel) {
    // create a new category for the roles
    try {
      rolesCategory = await guild.channels.create({
        name: 'ROLES',
        type: ChannelType.GuildCategory,
        position: 0, // Below the welcome category
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages], // Prevents everyone from sending messages
          },
        ],
      });
      await logAction({ bot, context: 'Created roles category', color: convertColor(Colors.BLURPLE) });
    } catch (error) {
      console.error('Error creating roles category:', error);
    }
    try {
      rolesChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: 'Assign roles',
        parent: rolesCategory,
        position: 0, // Below the welcome channel
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages], // Prevents everyone from sending messages
          },
        ],
      });
      await logAction({ bot, context: 'Created roles channel', color: convertColor(Colors.BLURPLE) });
    } catch (error) {
      console.error('Error creating roles channel:', error);
    }
  }
  return rolesChannel;
}

export async function assignRoleChannel(bot: Client) {
  // load environment variables
  configDotenv();

  const GUILD_ID = process.env.GUILD_ID as string;
  const guild = bot.guilds.cache.get(GUILD_ID);

  // if message is not from a guild, return
  if (!guild) return;

  // create the roles channel
  const rolesChannel = await createRolesChannel(bot, guild);

  // if message is not from the roles channel, return
  if (guild.channels.cache.find((channel) => channel.name === 'roles'))
    return;

  if (!rolesChannel) {
    console.error('Roles channel not found');
    return;
  }

  const channel = bot.channels.cache.get(rolesChannel.id) as TextChannel;

  const row = new ActionRowBuilder<ButtonBuilder>();
  roles.forEach((role) => {
    row.components.push(
      new ButtonBuilder()
        .setCustomId(role.id)
        .setLabel(role.name)
        .setStyle(ButtonStyle.Primary),
    );
  });

  // first check if a message already exists in the roles channel
  const messages = await channel.messages.fetch();
  const existingMessage = messages.find(
    (message) => message.author.id === bot.user?.id,
  );

  // if a message for assigning roles already exists, return
  if (existingMessage) return;

  // if not, create a new message for assigning roles
  await channel.send({
    content: 'React to assign yourself a role below!',
    components: [row],
  });
}