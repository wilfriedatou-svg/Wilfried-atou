const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_TOKEN;
const URL = `https://api.telegram.org/bot${TOKEN}`;
const WEBHOOK_URL = "https://wilfried-atou.onrender.com";

app.post('/', async (req, res) => {
  const { message } = req.body;
  if (message && message.text) {
    if (message.text === '/start') {
      await axios.post(`${URL}/sendMessage`, {
        chat_id: message.chat.id,
        text: "HELLO, WORLD! ✅ Ton bot marche"
      });
    } else {
      await axios.post(`${URL}/sendMessage`, {
        chat_id: message.chat.id,
        text: `Tu as dit: ${message.text}`
      });
    }
  }
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Bot is running'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  await axios.post(`${URL}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(`Bot running on port ${PORT}`);
});