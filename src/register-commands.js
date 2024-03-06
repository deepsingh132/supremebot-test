require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  // {
  //   name: "ping",
  //   description: "Replies with Pong!",
  // },
  // {
  //   name: "user",
  //   description: "Replies with user info!",
  // },
  // {
  //   name: "server",
  //   description: "Replies with server info!",
  // }

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