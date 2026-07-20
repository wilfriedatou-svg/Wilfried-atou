const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

app.use(express.json());

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: false});
const url = 'https://wilfried-atou.onrender.com';

const PORT = process.env.PORT || 3000;

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Bot is running'));

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'HELLO, WORLD! ✅ Ton bot marche');
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await bot.setWebHook(`${url}/bot${token}`);
  console.log('Webhook set successfully');
});