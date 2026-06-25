const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

const ROYAL_COLORS = ['#0c0d21', '#181b3a', '#00f2fe', '#ff0055'];

function getBalancedGradient(ctx, width, height) {
  let gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#020208');
  gradient.addColorStop(0.5, '#0c0d21');
  gradient.addColorStop(1, '#181b3a');
  return gradient;
}

async function generateStatusCanvas(title, message, senderID, isSuccess = false) {
  const width = 850;
  const height = isSuccess ? 500 : 350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const themeColor = isSuccess ? '#00f2fe' : '#ff0055';

  ctx.fillStyle = getBalancedGradient(ctx, width, height);
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.font = 'bold 110px "Sans-Serif"';
  ctx.fillText("CELESTIN", 50, height - 50);

  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, width - 30, height - 30);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(22, 22, width - 44, height - 44);

  const avatarX = 50;
  const avatarY = 55;
  const avatarSize = 95;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.clip();

  try {
    // Utilisation d'une URL de redirection FB Graph alternative plus permissive
    const fbAvatarUrl = `https://graph.facebook.com/v15.0/${senderID}/picture?type=large&redirect=true`;
    const response = await axios.get(fbAvatarUrl, {
      responseType: 'arraybuffer',
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const avatarImg = await loadImage(Buffer.from(response.data));
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
  } catch (e) {
    try {
      // Deuxième tentative avec le service d'avatars uniques par ID
      const fallbackRes = await axios.get(`https://api.multiavatar.com/${senderID}.png`, {
        responseType: 'arraybuffer'
      });
      const avatarImg = await loadImage(Buffer.from(fallbackRes.data));
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    } catch (err) {
      ctx.fillStyle = '#0b0c16';
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
      ctx.fillStyle = themeColor;
      ctx.font = 'bold 30px "Sans-Serif"';
      ctx.textAlign = 'center';
      ctx.fillText("ROI", avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 10);
      ctx.textAlign = 'left';
    }
  }
  ctx.restore();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, (avatarSize / 2) + 3, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = themeColor;
  ctx.font = 'bold 26px "Sans-Serif"';
  ctx.fillText(`⚜️ ${title} ⚜️`, avatarX + avatarSize + 30, 95);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(avatarX + avatarSize + 30, 115, 350, 8);
  ctx.fillStyle = themeColor;
  ctx.fillRect(avatarX + avatarSize + 30, 115, isSuccess ? 350 : 110, 8);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 175); ctx.lineTo(width - 40, 175); ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = isSuccess ? '13px "Courier New"' : '18px "Sans-Serif"';
  
  const lines = message.split('\n');
  let y = 220;
  const maxLines = isSuccess ? 10 : 4;
  const displayLines = lines.slice(0, maxLines);

  for (const line of displayLines) {
    ctx.fillText(line, 50, y);
    y += isSuccess ? 22 : 32;
  }

  if (isSuccess) {
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 14px "Sans-Serif"';
    ctx.fillText("👉 RÉPONDEZ (REPLY) À CETTE IMAGE POUR EXTRAIRE LE CODE SOURCE EN ENTIER", 50, height - 40);
  }

  const tmpDir = path.join(process.cwd(), "cache");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const imagePath = path.join(tmpDir, `archive_${Date.now()}.png`);
  fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
  return imagePath;
}

module.exports = {
  config: {
    name: "file",
    aliases: ["f"],
    version: "7.8",
    author: "Célestin",
    countDown: 5,
    role: 0,
    shortDescription: "Send bot script",
    longDescription: "Affiche le script sous forme de Canvas avec protocole de photo renforcé.",
    category: "owner",
    guide: { en: "{p}{n} [nom_du_fichier]" }
  },

  onStart: async function (context) {
    const api = context.api || this.api;
    const event = context.event || this.event;
    const args = context.args || [];
    if (!api || !event) return;

    const senderID = event.senderID;
    const permission = ["61561648169981"]; 

    if (!permission.includes(senderID)) {
      const imgPath = await generateStatusCanvas("ACCÈS REFUSÉ", "Tu n’es pas autorisé à utiliser cette commande.", senderID, false);
      return api.sendMessage({ attachment: fs.createReadStream(imgPath) }, event.threadID, () => { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); }, event.messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      const imgPath = await generateStatusCanvas("COMMANDE INCOMPLÈTE", "Indiquez le nom du fichier.\nExemple : -file join", senderID, false);
      return api.sendMessage({ attachment: fs.createReadStream(imgPath) }, event.threadID, () => { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); }, event.messageID);
    }

    const filePath = path.join(__dirname, `${fileName}.js`);
    if (!fs.existsSync(filePath)) {
      const imgPath = await generateStatusCanvas("FICHIER INTROUVABLE", `Le fichier "${fileName}.js" n’existe pas.`, senderID, false);
      return api.sendMessage({ attachment: fs.createReadStream(imgPath) }, event.threadID, () => { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); }, event.messageID);
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const imgPath = await generateStatusCanvas(`ARCHIVE SECRÈTE : ${fileName}.js`, fileContent, senderID, true);

      return api.sendMessage({ attachment: fs.createReadStream(imgPath) }, event.threadID, (err, info) => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        if (err) return console.error(err);

        const replyData = {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          content: fileContent,
          fileName: fileName
        };

        if (global.GoatBot && global.GoatBot.onReply) {
          global.GoatBot.onReply.set(info.messageID, replyData);
        } else if (global.client && global.client.handleReply) {
          global.client.handleReply.push(replyData);
        }
      }, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ Erreur lors du traitement de l'archive.", event.threadID);
    }
  },

  onReply: async function ({ api, event, reply }) {
    const handleReply = reply || arguments[0].Reply || arguments[0].handleReply;
    if (!handleReply) return;

    const { author, content, fileName, messageID } = handleReply;
    if (event.senderID !== author) return;

    try {
      await api.sendMessage({
        body: `࿇ ══━━✥👑✥━━══ ࿇\n     📦 CODE BRUT DÉVERROUILLÉ\n࿇ ══━━✥👑✥━━══ ࿇\n\n📜 Fichier : ${fileName}.js\n\n${content}`
      }, event.threadID, event.messageID);
    } catch (e) {
      console.error(e);
    } finally {
      if (global.GoatBot && global.GoatBot.onReply) {
        global.GoatBot.onReply.delete(messageID);
      }
    }
  }
};
