import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js';
import { Colors } from '../../configs/colors.json';
import { convertColor } from '../../utils/convertColors';

const choices = [
  {
    name: 'Rock',
    emoji: '🪨',
    beats: 'Scissors',
  },
  {
    name: 'Paper',
    emoji: '📄',
    beats: 'Rock',
  },
  {
    name: 'Scissors',
    emoji: '✂️',
    beats: 'Paper',
  },
];



export const rockPaperGame = new SlashCommandBuilder()
  .setName('rock-paper-scissors')
  .setDescription('Play rock paper scissors with another member!')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to play with!')
      .setRequired(true),
  );

export const playRockPaperScissors = async ({
  interaction,
}: {
  interaction: ChatInputCommandInteraction;
}) => {
  try {
    const targetUser = interaction.options.getUser('user');
    const challenger = interaction.user;

    if (!targetUser) {
      interaction.reply('You need to mention a user to play with!');
      return;
    }

    if (targetUser.bot) {
      interaction.reply({
        content: "You can't play rock paper scissors with a bot!",
        ephemeral: true,
      });
      return;
    }

    if (interaction.user.id === targetUser.id) {
      interaction.reply({
        content: "You can't play rock paper scissors with yourself!",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Rock Paper Scissors')
      .setDescription(`It's currently ${targetUser}'s turn.`)
      .setColor(convertColor(Colors.TRON))
      .setTimestamp();

    const buttons = choices.map((choice) => {
      return new ButtonBuilder()
        .setCustomId(choice.name)
        .setLabel(choice.name)
        .setStyle(ButtonStyle.Primary)
        .setEmoji(choice.emoji);
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const reply = await interaction.reply({
      content: `${targetUser} you have been challenged to a game of Rock Paper Scissors, by ${interaction.user}. To start playing, click on one of the buttons below!`,
      embeds: [embed],
      components: [row],
    });

    const targetUserInteraction = await reply
      .awaitMessageComponent({
        filter: (i) => i.user.id === targetUser.id,
        time: 30_000,
      })
      .catch(async (error) => {
        embed.setDescription(
          `Game over. ${targetUser} did not respond in time!`,
        );
        await reply.edit({ embeds: [embed], components: [] });

        if (error) {
          console.error("Error at targetUserInteraction: ", error);
          return;
        }
      });

    if (!targetUserInteraction) return;

    const targetUserChoice = choices.find(
      (choice) => choice.name === targetUserInteraction.customId,
    );

    if (!targetUserChoice) return;

    await targetUserInteraction.reply({
      content: `You picked ${targetUserChoice.name + targetUserChoice.emoji}!`,
      ephemeral: true,
    });

    // Edit embed to show the user's choice
    embed.setDescription(`It's currently ${interaction.user}'s turn.`);

    console.log(targetUserChoice);
    console.log(targetUserInteraction.replied);

    // only show the below message if the target user has already made their choice
    if (targetUserChoice && targetUserInteraction.replied) {
      await reply.edit({
        content: `${interaction.user} it's your turn now.`,
        embeds: [embed],
      });
    }

    const initialUserInteraction = await reply
      .awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 30_000,
      })
      .catch(async (error) => {
        embed.setDescription(
          `Game over. ${interaction.user} did not respond in time!`,
        );
        await reply.edit({ embeds: [embed], components: [] });

        if (error) {
          console.error("Error at initialUserInteraction: ", error);
          return;
        }
      });

    if (!initialUserInteraction) return;

    const initalUserChoice = choices.find(
      (choice) => choice.name === initialUserInteraction.customId,
    );

    if (!initalUserChoice) return;

    let result;

    if (targetUserChoice.beats === initalUserChoice.name) {
      result = `${targetUser} won!`;
    } else if (initalUserChoice.beats === targetUserChoice.name) {
      result = `${interaction.user} won!`;
    } else {
      result = "It's a tie!";
    }

    embed.setDescription(`${targetUser} picked ${targetUserChoice.name + targetUserChoice.emoji}\n
    ${interaction.user} picked ${initalUserChoice.name + initalUserChoice.emoji}.
    \n\n${result}`);

    await reply.edit({ embeds: [embed], components: [] });

    // stop the function from running
    return;
  } catch (error) {
    console.error("Error in playRockPaperScissors: ", error);
  }
};
