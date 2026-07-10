const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Fonction utilitaire pour générer une couleur néon sombre/lumineuse aléatoire pour le contour
function getRandomNeonColor() {
  const hues = [0, 280, 330, 45]; // Rouge, Violet, Rose, Or démoniaque
  const randomHue = hues[Math.floor(Math.random() * hues.length)];
  return `hsl(${randomHue}, 100%, 55%)`;
}

module.exports = {
  config: {
    name: "bal",
    aliases: ["bal", "$", "cash"],
    version: "6.0",
    author: "Christus x Célestin 🔥",
    countDown: 3,
    role: 0,
    description: "💰 Système économique cyber-sanctuaire avec transfert et carte noire",
    category: "economy",
    guide: {
      fr: "{pn} - voir ton solde\n{pn} @utilisateur - voir le solde d'un autre\n{pn} t @utilisateur montant - transférer de l'argent"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID, mentions, messageReply } = event;

    const formatMoney = (amount) => {
      if (isNaN(amount)) return "0$";
      amount = Number(amount);
      const scales = [
        { value: 1e15, suffix: 'Q' },
        { value: 1e12, suffix: 'T' },
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'k' }
      ];
      const scale = scales.find(s => amount >= s.value);
      if (scale) return `${(amount / scale.value).toFixed(1)}${scale.suffix}$`;
      return `${amount.toLocaleString()}$`;
    };

    const fetchAvatar = async (userID) => {
      try {
        let avatarURL = `https://graph.facebook.com/${userID}/picture?type=large&width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 });
        return await loadImage(Buffer.from(res.data));
      } catch (e) {
        const size = 100;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#100015";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${size / 2}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(userID.charAt(0).toUpperCase(), size / 2, size / 2);
        return canvas;
      }
    };

    // === TRANSFERT D'ARGENT ===
    if (args[0]?.toLowerCase() === "t") {
      let targetID = Object.keys(mentions)[0] || messageReply?.senderID;
      const amountRaw = args.find(a => !isNaN(a));
      const amount = parseFloat(amountRaw);

      if (!targetID || isNaN(amount)) return message.reply("❌ Usage : !bal t @utilisateur montant");
      if (targetID === senderID) return message.reply("❌ Vous ne pouvez pas vous envoyer de l'argent.");
      if (amount <= 0) return message.reply("❌ Le montant doit être supérieur à 0.");

      const sender = await usersData.get(senderID);
      const receiver = await usersData.get(targetID);
      if (!receiver) return message.reply("❌ Utilisateur cible introuvable.");

      const taxRate = 5;
      const tax = Math.ceil(amount * taxRate / 100);
      const total = amount + tax;

      if (sender.money < total) return message.reply(
        `❌ Fonds insuffisants.\nNécessaire : ${formatMoney(total)}\nVous avez : ${formatMoney(sender.money)}`
      );

      await Promise.all([
        usersData.set(senderID, { ...sender, money: sender.money - total }),
        usersData.set(targetID, { ...receiver, money: receiver.money + amount })
      ]);

      const receiverName = await usersData.getName(targetID);
      return message.reply(
        `✅ Transfert réussi ! 💸
➤ Vers : ${receiverName}
➤ Montant envoyé : ${formatMoney(amount)}
➤ Taxe : ${formatMoney(tax)}
➤ Total débité : ${formatMoney(total)}`
      );
    }

    // === GENERATION DE LA CARTE NOIRE "MAISON SHINOBI" ===
    let targetID;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (messageReply) targetID = messageReply.senderID;
    else targetID = senderID;

    const name = await usersData.getName(targetID);
    const money = await usersData.get(targetID, "money") || 0;
    const avatar = await fetchAvatar(targetID);

    const width = 750, height = 350;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const neonColor = getRandomNeonColor();

    // 1. Fond Noir Profond Cyber-Maison
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, width, height);

    // Effet d'ombrage interne (Ambiance sombre)
    let darkGrad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 400);
    darkGrad.addColorStop(0, "rgba(15, 10, 25, 0.2)");
    darkGrad.addColorStop(1, "#000000");
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Structure géométrique "Maison / Sanctuaire" (Lignes de fond discrètes)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for(let i = 0; i < width; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }

    // 3. Cadre Principal Techno-Gothique
    ctx.fillStyle = "rgba(20, 20, 30, 0.6)";
    ctx.fillRect(40, 40, width - 80, height - 80);

    // Bordure Néon Changeante
    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Coins renforcés style "Maison forte / Coffre"
    ctx.fillStyle = neonColor;
    const cornerSize = 15;
    ctx.fillRect(35, 35, cornerSize, 5); ctx.fillRect(35, 35, 5, cornerSize); // Haut Gauche
    ctx.fillRect(width - 35 - cornerSize, 35, cornerSize, 5); ctx.fillRect(width - 35, 35, 5, cornerSize); // Haut Droite
    ctx.fillRect(35, height - 35, cornerSize, 5); ctx.fillRect(35, height - 35 - cornerSize, 5, cornerSize); // Bas Gauche
    ctx.fillRect(width - 35 - cornerSize, height - 35, cornerSize, 5); ctx.fillRect(width - 35, height - 35 - cornerSize, 5, cornerSize); // Bas Droite

    // 4. Intégration Avatar avec Auréole Néon
    const avatarSize = 120;
    const avatarX = 75, avatarY = 115;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Textes et Données (Style Épuré Haut de Gamme)
    // Titre de la Banque / Maison
    ctx.fillStyle = neonColor;
    ctx.font = "bold 24px 'Impact', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("CASSIDY VAULT SYSTEM", width - 60, 80);

    // Nom du détenteur
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 34px 'Arial', sans-serif";
    ctx.textAlign = "left";
    const cleanName = name.length > 18 ? name.substring(0, 16) + ".." : name;
    ctx.fillText(cleanName.toUpperCase(), 220, 155);

    // Statut / ID
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(`ACC. HOLDER // ${targetID}`, 220, 185);

    // Séparateur
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(220, 205); ctx.lineTo(width - 60, 205); ctx.stroke();

    // Label Solde
    ctx.font = "bold 13px 'Arial'", sans-serif;
    ctx.fillStyle = neonColor;
    ctx.fillText("SOLDE DISPONIBLE", 220, 230);

    // Chiffre du Solde (Gros et Impactant)
    ctx.font = "bold 52px 'Impact', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${formatMoney(money)}`, 220, 285);

    // 6. Sauvegarde et Envoi
    const tmpDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    
    const filePath = path.join(tmpDir, `vault_card_${Date.now()}_${targetID}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    return message.reply({
      body: `🖤 [ ᴍᴀɪsᴏɴ ᴄᴀssɪᴅʏ ] Fiche financière de ${name} mise à jour.`,
      attachment: fs.createReadStream(filePath)
    }).then(() => {
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 7000);
    });
  }
};
