const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

// ==========================================
// 🎨 ENGIN CANVAS POUR LA CONFIRMATION VISUELLE
// ==========================================
async function generateResultCanvas(actionType, usersProcessed) {
    const listToDisplay = usersProcessed.slice(0, 5);
    const canvasHeight = 150 + (listToDisplay.length * 90);
    const canvas = createCanvas(700, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fond sombre Néo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 700, canvasHeight);
    
    // Bordure lumineuse selon l'action (Vert pour Accepté, Rouge pour Refusé)
    ctx.strokeStyle = actionType === "Acceptée" ? '#10b981' : '#ef4444';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 692, canvasHeight - 8);

    // Titres
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText("CONFIRMATION D'ACTIONS", 50, 60);
    
    ctx.fillStyle = actionType === "Acceptée" ? '#10b981' : '#ef4444';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Statut : Demande ${actionType}`, 50, 100);

    // Ligne de séparation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(50, 125); ctx.lineTo(650, 125); ctx.stroke();

    // Rendu de la liste
    for (let i = 0; i < listToDisplay.length; i++) {
        const user = listToDisplay[i];
        const yOffset = 150 + (i * 90);

        try {
            const avatarUrl = `https://graph.facebook.com/${user.node.id}/picture?width=200&height=200`;
            const avatar = await loadImage(avatarUrl);
            ctx.save();
            ctx.beginPath();
            ctx.arc(85, yOffset + 35, 35, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 50, yOffset, 70, 70);
            ctx.restore();
            
            ctx.strokeStyle = actionType === "Acceptée" ? '#10b981' : '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(85, yOffset + 35, 37, 0, Math.PI * 2); ctx.stroke();
        } catch (e) {
            ctx.fillStyle = '#334155';
            ctx.beginPath(); ctx.arc(85, yOffset + 35, 35, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(user.node.name, 150, yOffset + 30);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.fillText(`ID: ${user.node.id}`, 150, yOffset + 55);
    }

    if (usersProcessed.length > 5) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 16px sans-serif';
        ctx.fillText(`... et ${usersProcessed.length - 5} autres requêtes traitées.`, 150, canvasHeight - 25);
    }

    const cachePath = path.join(__dirname, 'cache', `accept_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, 'cache'));
    await fs.writeFile(cachePath, canvas.toBuffer('image/png'));
    return cachePath;
}

// ==========================================
// 🚀 MODULE MAIN
// ==========================================
module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "2.6",
    author: "Christus x Célestin (Canvas Fixed)",
    countDown: 5,
    role: 2,
    description: "Gère les demandes d'amis reçues avec un rendu visuel",
    category: "utility",
    guide: "{p}accept"
  },

  onReply: async function ({ message, Reply, event, api }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;

    const args = event.body.trim().toLowerCase().split(/\s+/);
    const action = args[0];

    if (action !== "add" && action !== "del") {
      return message.reply("❌ Action invalide. Utilisez 'add' ou 'del'.");
    }

    let targetIndexes = args.slice(1);
    if (args[1] === "all") {
      targetIndexes = Array.from({ length: listRequest.length }, (_, i) => (i + 1).toString());
    }

    if (targetIndexes.length === 0) {
      return message.reply("❌ Veuillez spécifier les numéros ou utiliser 'all'.");
    }

    const usersProcessed = [];
    let actionType = action === "add" ? "Acceptée" : "Refusée";

    message.reply(`⚙️ Traitement de ${targetIndexes.length} demande(s) en cours...`);

    for (const indexStr of targetIndexes) {
      const index = parseInt(indexStr) - 1;
      const user = listRequest[index];

      if (user) {
        // Reconstruction propre de la payload pour chaque requête GraphQL
        const payload = {
          av: api.getCurrentUserID(),
          fb_api_caller_class: "RelayModern",
          fb_api_req_friendly_name: action === "add" ? "FriendingCometFriendRequestConfirmMutation" : "FriendingCometFriendRequestDeleteMutation",
          doc_id: action === "add" ? "3147613905362928" : "4108254489275063",
          variables: JSON.stringify({
            input: {
              source: "friends_tab",
              actor_id: api.getCurrentUserID(),
              client_mutation_id: Math.round(Math.random() * 100).toString(),
              friend_requester_id: user.node.id
            },
            scale: 3,
            refresh_num: 0
          })
        };

        try {
          await api.httpPost("https://www.facebook.com/api/graphql/", payload);
          usersProcessed.push(user);
        } catch (err) {
          console.error(`Erreur ID ${user.node.id}:`, err.message);
        }
      }
    }

    if (usersProcessed.length > 0) {
        const imagePath = await generateResultCanvas(actionType, usersProcessed);
        await api.sendMessage({
            body: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n✅ Opération terminée avec succès.\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
            attachment: fs.createReadStream(imagePath)
        }, event.threadID);
        await fs.unlink(imagePath);
    } else {
        message.reply("❌ Impossible de traiter les requêtes (Erreur de communication Facebook).");
    }

    try { api.unsendMessage(messageID); } catch(e) {}
  },

  onStart: async function ({ message, api, event, commandName }) {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FriendingCometFriendRequestsListQuery",
      doc_id: "4496580977054653",
      variables: JSON.stringify({ count: 20, scale: 3 })
    };

    try {
      const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const data = JSON.parse(res.replace("for (;;);", ""));
      const listRequest = data.data.viewer.friending_possibilities.edges || [];

      if (listRequest.length === 0) {
        return message.reply("✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n Aucune demande d'ami en attente.\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧");
      }

      let msg = "✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n👥 LISTE DES DEMANDES D'AMIS\n\n";
      listRequest.forEach((user, index) => {
        msg += `${index + 1}. 👤 ${user.node.name}\n🆔 ID: ${user.node.id}\n\n`;
      });
      msg += "👉 Répondez à ce message avec :\n• 'add [numéro / all]' pour accepter\n• 'del [numéro / all]' pour refuser.\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧";

      message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          listRequest
        });
      });

    } catch (e) {
      return message.reply(`❌ Erreur lors de la récupération : ${e.message}`);
    }
  }
};
