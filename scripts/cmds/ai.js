const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    let word = words[i];
    let width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

module.exports = {
  config: {
    name: "ai",
    version: "4.0",
    author: "Célestin Olua",
    role: 0,
    category: "ai",
    shortDescription: "Alerte Canvas Cyber Bleu & Noir avec vraie photo corrigée",
    guide: "Écrivez simplement 'Ai'"
  },

  onStart: async function({ message }) {
    return;
  },

  onChat: async function({ event, message, usersData }) {
    const userMsg = event.body?.trim();
    if (!userMsg) return;

    const text = userMsg
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

    if (text.startsWith("ai")) {
      const uid = event.senderID;
      let userName = "User";
      
      // Solution Radical : Utilisation d'un résolveur d'image tiers ou de l'URL brute Messenger
      let avatarUrl = `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      try {
        if (usersData && typeof usersData.getName === "function") {
          userName = await usersData.getName(uid) || "User";
        }
      } catch (e) {
        userName = "User";
      }

      try {
        const width = 1000;
        const height = 550;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 🖤 Fond Noir Absolu
        ctx.fillStyle = "#050508";
        ctx.fillRect(0, 0, width, height);

        // 🌐 Grille Tech Bleue
        ctx.strokeStyle = "rgba(0, 229, 255, 0.03)";
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }
        for (let j = 0; j < height; j += 50) {
          ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke();
        }

        // 🟦 Bordure Cyber Cyan
        ctx.strokeStyle = "rgba(0, 229, 255, 0.2)";
        ctx.lineWidth = 3;
        ctx.strokeRect(40, 40, width - 80, height - 80);

        // ⚡ Coins Lumineux Bleus
        ctx.fillStyle = "#00e5ff";
        const offset = 35;
        const len = 40;
        const thick = 5;
        ctx.fillRect(offset, offset, len, thick); ctx.fillRect(offset, offset, thick, len);
        ctx.fillRect(width - offset - len, offset, len, thick); ctx.fillRect(width - offset, offset, thick, len);
        ctx.fillRect(offset, height - offset, len, thick); ctx.fillRect(offset, height - offset - len, thick, len);
        ctx.fillRect(width - offset - len, height - offset, len, thick); ctx.fillRect(width - offset, height - offset - len, thick, len);

        // 👤 Zone de la photo de profil
        const avatarSize = 140;
        const avatarX = 80;
        const avatarY = height / 2 - avatarSize / 2;

        try {
          // Requête configurée avec des en-têtes de navigateur pour contourner les blocages
          const response = await axios.get(avatarUrl, { 
            responseType: 'arraybuffer', 
            timeout: 6000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          const avatarImg = await loadImage(Buffer.from(response.data));

          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
          ctx.restore();

          // Contour Néon
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2, true);
          ctx.stroke();

        } catch (err) {
          // Fallback : Génère un avatar en texte avec l'initiale de l'utilisateur si l'image refuse toujours de charger
          ctx.fillStyle = "rgba(0, 229, 255, 0.1)";
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
          ctx.fill();
          
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = "#00e5ff";
          ctx.font = "bold 50px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(userName.charAt(0).toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2);
        }

        // 📝 Section Textes réajustée
        const textStartX = 270;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic"; // Corrige les coupures et l'alignement du texte

        // ID Logs
        ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
        ctx.font = "bold 16px Courier New, monospace";
        ctx.fillText(`// ACCESS_DENIED // TARGET: ${userName.toUpperCase()}`, textStartX, 130);

        // Titre Principal
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px Arial, sans-serif";
        ctx.fillText("COMMANDE DIRECTE INVALIDE", textStartX, 185);

        // Message d'explication avec gestion automatique du retour à la ligne
        ctx.fillStyle = "#8a99ad";
        ctx.font = "19px Arial, sans-serif";
        const infoText = "L'accès direct via le mot 'Ai' est indisponible. Vous devez obligatoirement utiliser un préfixe valide.";
        const infoLines = wrapText(ctx, infoText, 640);
        let currentY = 225;
        infoLines.forEach(line => {
          ctx.fillText(line, textStartX, currentY);
          currentY += 28;
        });

        // 🟦 Encadré de commande
        ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
        ctx.fillRect(textStartX, 310, 650, 90);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(textStartX, 310, 650, 90);

        // Syntaxe Correcte
        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 24px Courier New, monospace";
        ctx.fillText("👉 Utilisez : neo [message]  ou  flash [message]", textStartX + 20, 365);

        // Exemples
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "italic 16px Arial, sans-serif";
        ctx.fillText("💡 Exemples : 'neo bonjour'  |  'flash aide-moi'", textStartX, 445);

        // Footer
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0, 229, 255, 0.2)";
        ctx.font = "12px Courier New, monospace";
        ctx.fillText("SYSTEM: ONLINE // ARCHIVES DU ROI V4.0 // ROUTER MAIN", width / 2, 510);

        // 💾 Cache & Envoi
        const cachePath = path.join(__dirname, `cache_ai_fixed_${Date.now()}.png`);
        const buffer = canvas.toBuffer();
        await fs.outputFile(cachePath, buffer);

        return message.reply({
          body: `🛸 **Erreur, ${userName}.** L'accès direct est bloqué. Veuillez utiliser la commande **neo** comme indiqué ci-dessous :`,
          attachment: fs.createReadStream(cachePath)
        }, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        });

      } catch (error) {
        console.error("Erreur Canvas:", error);
        return message.reply("⚙️ Erreur d'accès. Utilisez le préfixe **neo** pour parler à l'IA.");
      }
    }
  }
};
