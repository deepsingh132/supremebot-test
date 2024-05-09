import { ChatInputCommandInteraction, SlashCommandBuilder, VoiceChannel, GuildMember } from "discord.js";
import { Player, useMainPlayer, useQueue } from "discord-player";

export const controlsCommand = new SlashCommandBuilder()
  .setName("controls")
  .setDescription("Shows the controls of the audio player")
  .addSubcommand((subcommand) =>
    subcommand
      .setName('pause')
      .setDescription('Pause the current song'),
  )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('resume')
          .setDescription('Resume the current song'),
    ).addSubcommand((subcommand) =>
        subcommand
          .setName('skip')
          .setDescription('Skip the current song'),
    ).addSubcommand((subcommand) =>
        subcommand
          .setName('stop')
          .setDescription('Play a playlist from a URL')
)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('shuffle')
      .setDescription('Shuffle the current playlist'),
  );


export const controlsCommandHandler = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  // early return if the member is not in a guild
  if (!interaction.guild) {
    await interaction.reply('This command can only be used in a server');
    return;
  }

  const member = interaction.member as GuildMember;
  const queue = useQueue(interaction.guild.id);

  const channel = member.voice.channel as VoiceChannel;

  if (!channel) {
    await interaction.reply(
      {
        content: 'You need to be in a voice channel to use this command',
        ephemeral: true,
      }
    );
    return;
  }

    if (!queue) {
      await interaction.reply({
        content: 'No songs are currently playing',
        ephemeral: true,
      });
      return;
    }

  await interaction.deferReply();

  if (subcommand === 'pause') {
    queue.node.pause();
  }

  if (subcommand === 'resume') {
    queue.node.resume();
  }

  if (subcommand === 'skip') {
    queue.node.skip();
  }

  if (subcommand === 'stop') {
    queue.node.stop();
  }
};