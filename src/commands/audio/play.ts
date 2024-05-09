import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  VoiceChannel,
  GuildMember,
  Client,
  EmbedBuilder,
} from 'discord.js';
// import { playAudio } from "../../audio/player";
import { Player, useMainPlayer } from 'discord-player';
import { convertColor } from '../../utils/convertColors';
import { Colors } from '../../configs/colors.json';

export async function setupAudioPlayer(bot: Client) {
  const player = new Player(bot, {
    ytdlOptions: {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
    },
    ipconfig: {
      blocks: ['fa25::/48', '2001:2::/48'],
    },
  });

  await player.extractors.loadDefault();

  player.events.on('playerStart', (queue, track) => {
    console.log(`Now playing ${track.title}`);
  });

  // on error
  player.events.on('error', (error, queue) => {
    console.error(`Error from queue ${queue}: ${error}`);
  });

  //
}

export const playCommand = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play audio from a URL')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('search')
      .setDescription('Search for a song to play')
      .addStringOption((option) =>
        option
          .setName('searchterms')
          .setDescription('search by song title and artist')
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('url')
      .setDescription('Play song from a yt URL')
      .addStringOption((option) =>
        option
          .setName('url')
          .setDescription('URL of the song to play')
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('playlist')
      .setDescription('Play a playlist from a URL')
      .addStringOption((option) =>
        option
          .setName('url')
          .setDescription('URL of the playlist to play')
          .setRequired(true),
      ),
  );

export const playCommandHandler = async (
  interaction: ChatInputCommandInteraction,
) => {
  const url = interaction.options.getString('url');
  const searchterms = interaction.options.getString('searchterms');
  const playlist = interaction.options.getString('playlist');
  const bot = interaction.client;

  if (!interaction.guild) {
    await interaction.reply('This command can only be used in a server');
    return;
  }

  if (!url && !searchterms && !playlist) {
    await interaction.reply(
      'Please provide a URL, search terms, or playlist URL to play audio',
    );
    return;
  }

  const member = interaction.member as GuildMember;

  const channel = member.voice.channel as VoiceChannel;

  if (!channel) {
    await interaction.reply('You need to be in a voice channel to play audio');
    return;
  }

  await interaction.deferReply();

  let embed = new EmbedBuilder();
  let searchQuery = searchterms || url || (playlist as string);

  try {
    await setupAudioPlayer(bot);
    const player = useMainPlayer();
    const result = await player.search(searchQuery, {
      requestedBy: interaction.user,
    });
    const track = await player.play(channel, result, {
      nodeOptions: {
        metadata: interaction,
      },
    });

    embed.setTitle(`Now playing ${track.track.title}`);
    embed.setURL(track.track.url);
    embed.setThumbnail(track.track.thumbnail);
    embed.setColor(convertColor(Colors.TRON));
    embed.setFooter({
      text: `Requested by ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    });

    return await interaction.followUp({ embeds: [embed] });
  } catch (error) {
    console.error('Error playing audio', error);
    await interaction.followUp(`Error playing audio: ${error}`);
  }

  // await interaction.reply(`Playing ${url}`);
};
