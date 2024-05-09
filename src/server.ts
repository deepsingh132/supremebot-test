import express from 'express';
import cookiesParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './database/connection';
import { redisClient } from './utils/redis-client';
import { Client, GatewayIntentBits } from 'discord.js';
import { handleEvents } from './events/_handleEvents';
import { configDotenv } from 'dotenv';
import router from './router/index';
import { Redis } from 'ioredis';
import http from 'http';
import { Server } from 'socket.io';
const PORT = process.env.PORT || 5000;
const app = express();

configDotenv();

const allowedOrigins = ["http://localhost:3000", "http://192.168.0.118:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['set-cookie'],
  }),
);

let redis: Redis;

(async () => {
  const bot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  // connect to redis
  redis = (await redisClient()) as Redis;
  handleEvents(bot, redis);

  await connectDB();

  // For socket.io
  const server = http.createServer(app);

  // Create a socket.io instance and pass the http server
  const io = require('socket.io')(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  }) as Server;

  // Handle socket.io connections
  io.on('connection', (socket) => {
  });

  io.on('error', (err) => {
    console.error('Socket.io Error:', err);
  });

  // // Function to emit bot's latency and API latency every second
  const emitLatencies = () => {
    const botLatency = bot.ws.ping;
    // TODO: fetch real latency instead of a random no lol
    const apiLatency = 50;

    io.sockets.emit('latencies', { botLatency, apiLatency });
  };

  // Emit latencies every second
  setInterval(emitLatencies, 1000);

  // Function to emit bot's uptime every second
  const emitUptime = () => {
    try {
      const uptimeInSeconds = process.uptime() // Get uptime in seconds
      const wholeUptime = Math.floor(uptimeInSeconds); // Round down to whole number
      io.sockets.emit('uptime', wholeUptime); // Emit the uptime to all connected clients
    } catch (error) {
      console.error('Error in emitUptime:', error);
    }
  };


  // catch uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    console.error('Error Stack:', err.stack);
  });

  // Emit uptime every second
  setInterval(emitUptime, 1000);

  // paused bot login for now
  await bot
    .login(process.env.DISCORD_TOKEN)
    .catch((err) => console.log('Error logging in:', err));

  app.use(cookiesParser());
  // app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use('/', router());
  app.get('/', (req, res) => {
    res.send('Bot is running!');
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

})();

export { redis };