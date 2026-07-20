const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token);
const url = 'https://wilfried-atou.onrender.com';

// On dit à Telegram d'envoyer les messages ici
bot.setWebHook(`${url}/bot${token}`);

app.use(express.json());
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Quand quelqu'un tape /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'HELLO, WORLD! ✅ Ton bot marche');
});

app.get('/', (req, res) => res.send('Bot is running'));
app.listen(10000);