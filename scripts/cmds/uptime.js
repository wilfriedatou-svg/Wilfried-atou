const os = require("os");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "3.0",
    author: "Messie",
    role: 0,
    category: "system",
    shortDescription: {
      en: "System status"
    }
  },

  onStart: async ({ api, event, usersData }) => {
    try {

      const senderID = event.senderID;

      // 🔥 GET USER INFO
      const userName = await usersData.getName(senderID);

      // 🔥 AVATAR FACEBOOK
      const avatar = `https://graph.facebook.com/${senderID}/picture?height=720&width=720`;

      // 🔥 GIF NARUTO (IMGUR)
      const narutoGif = "https://i.imgur.com/3GvwNBf.gif";

      // 🔥 DATA
      const format = (s) => {
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return `${d}j ${h}h ${m}m ${sec}s`;
      };

      const botUptime = format(process.uptime());
      const serverUptime = format(os.uptime());

      const cpu = (os.cpus()[0].speed / 1000).toFixed(2);

      const totalMem = os.totalmem() / 1024 / 1024 / 1024;
      const usedMem = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;

      const time = moment().tz("Africa/Kinshasa")
        .format("HH:mm:ss | DD/MM/YYYY");

      // 🔥 MESSAGE
      const msg = `
╭───「 SYSTEM 」───╮

👤 ${userName}

🤖 BOT
➤ ${botUptime}

🌐 SERVER
➤ ${serverUptime}

⚙️ CPU : ${cpu} GHz
💾 RAM : ${usedMem.toFixed(2)} / ${totalMem.toFixed(2)} GB

⏰ ${time}

╰──────────────╯
`;

      // 🔥 SEND AVATAR + GIF
      return api.sendMessage({
        body: msg,
        attachment: [
          await global.utils.getStreamFromURL(avatar),
          await global.utils.getStreamFromURL(narutoGif)
        ]
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Erreur.", event.threadID);
    }
  },

  // 🔥 SI QUELQU’UN RÉPOND AU MESSAGE
  onReply: async ({ api, event }) => {
    return api.sendMessage("📊 Utilise uptime pour voir le statut.", event.threadID);
  }
};
