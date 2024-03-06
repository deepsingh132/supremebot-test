import express from "express";
import routes from "./routes/index";
import cors from "cors";
import { connectDB } from "./database/connection";
import { Client, GatewayIntentBits } from "discord.js";
import { handleEvents } from "./events/_handleEvents";
import { setupBotLogsChannel } from "./utils/logHandler";
import { configDotenv } from "dotenv";
const GUILD_ID = process.env.GUILD_ID;
const PORT = process.env.PORT || 5000;
const app = express();

configDotenv();

(async () => {
  const bot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  handleEvents(bot);

  await connectDB();

  await bot
    .login(process.env.DISCORD_TOKEN)
    .catch((err) => console.log("Error logging in:", err));

  app.use(cors());
  app.use(express.json());
  routes(app as express.Application);
  app.get("/", (req, res) => {
    res.send("Bot is running!");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();

/**
 * TODO:
 * - Modify the route from a get request to a post request that takes in username and password for auth
 *
 */

// app.get("/clear/:userId", (req, res) => {
//   const userId = req.params.userId;
//   console.log("Clearing strikes for user:", userId);
//   if (userStrikes[userId]) {
//     // remove the user from the userStrikes const object
//     delete userStrikes[userId];
//     res.status(200).send("User strikes cleared");
//   } else {
//     console.log("User not found!");

//     res.status(404).send("User not found");
//   }
// });