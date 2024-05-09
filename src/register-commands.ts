require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "user",
    description: "Replies with user info!",
  },
  {
    name: "server",
    description: "Replies with server info!",
  },
  {
    name: "leaderboard",
    description: "Shows the leaderboard of the server!",
  },
  // {
  //   name: "stats",
  //   description: "Shows the stats of the server!",
  // },
  // {
  //   name: "help",
  //   description: "Shows the help message!",
  // },
  {
    name: "level",
    description: "Shows the level of the user!",
  },
  {
    name: "rank",
    description: "Shows the rank of the user!",
  },
  // {
  //   name: "games",
  //   description: "Shows the games available!",
  // },
  {
    name: "rock-paper-scissors",
    description: "Play rock paper scissors with another member!",
  },

  {
    name: "play",
    description: "Play song from a URL",
  },

  {
    name: "controls",
    description: "Shows the controls of the audio player",
  }


];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {

    console.log("Registering slash commands...")

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands,
      });

    console.log("Slash commands registered successfully!");

  } catch (error) {
    console.log("Error while registering application commands: ", error);
  }
})();