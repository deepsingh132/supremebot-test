import { Client, ColorResolvable, EmbedBuilder, Message } from 'discord.js';
import Keywords from '../database/models/Keywords';
import { handleStrike } from '../utils/handleStrike';
import { logAction } from '../utils/logHandler';
import { Colors } from '../configs/colors.json';

// create a cache for the keywords
// TODO: Implement redis for caching
let keywordCache = [] as string[];

// fetch the keywords from the database
const fetchKeywords = async () => {
  if (keywordCache.length) return;
  const keywordData = await Keywords.find({});
  keywordCache = keywordData[0].keywords;
};

//Function to preprocess the message
function preprocessMessage(message: string) {
  // Remove all spaces from the message
  return message.replace(/\s+/g, '');
}

async function checkForBannedWords(msg: Message) {

  if (!msg.guild) return;

  await fetchKeywords();
  // console.log('Keywords: ', keywordCache);

  const message = msg.content.toLowerCase();
  const processedMessage = preprocessMessage(message);
  // console.log('Processed message: ', processedMessage);
  const hasKeyword = keywordCache.some((word) =>
    processedMessage.includes(word),
  );
  if (hasKeyword) {
    // delete the message
    // await msg.delete();
    console.log('Keyword invoked!');

    // Log the action to the bot-logs channel
    await logAction({ bot: msg.client, context: `${msg.member} used a banned word`, color: Colors.YELLOW });
    await handleStrike(msg);
  }
};


export const onMessage = async (bot: Client, msg: Message) => {
  if (msg.author.bot) return;
  // Check for banned words
  checkForBannedWords(msg);
};


export const sendMessage = async (
  message: Message,
  color: ColorResolvable,
  description: string,
) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setDescription(description)
    .setTimestamp();
  // .setFooter(message.author.tag);

  await message.channel.send({ embeds: [embed] });
};