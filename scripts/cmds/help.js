const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

const { commands, aliases } = global.GoatBot;

function toSmallCaps(text) {
  const smallCapsMap = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ',
    k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ', s:'ѕ', t:'ᴛ',
    u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ',
    A:'ᴀ', B:'ʙ', C:'ᴄ', D:'ᴅ', E:'ᴇ', F:'ꜰ', G:'ɢ', H:'ʜ', I:'ɪ', J:'ᴊ',
    K:'ᴋ', L:'ʟ', M:'ᴍ', N:'ɴ', O:'ᴏ', P:'ᴘ', Q:'ǫ', R:'ʀ', S:'ѕ', T:'ᴛ',
    U:'ᴜ', V:'ᴠ', W:'ᴡ', X:'x', Y:'ʏ', Z:'ᴢ',
    'é':'ᴇ́', 'è':'ᴇ̀', 'ê':'ᴇ̂', 'ç':'ᴄ̧', 'à':'ᴀ̀', 'ô':'ᴏ̂'
  };
  return text.split('').map(c => smallCapsMap[c] || c).join('');
}

function toBoldSans(text) {
  const boldMap = {
    'A':'𝚨','B':'𝚩','C':'𝚪','D':'𝚫','E':'𝚬','F':'𝚭','G':'𝚮','H':'𝚯','I':'𝚰','J':'𝚱','K':'𝚲','L':'𝚳','M':'𝚴',
    'N':'𝚵','O':'𝚶','P':'𝚷','Q':'𝚸','R':'𝚹','S':'𝚺','T':'𝚻','U':'𝚼','V':'𝚽','W':'𝚾','X':'𝚿','Y':'𝛀','Z':'𝛁',
    'a':'𝛂','b':'𝛃','c':'𝛄','d':'𝛅','e':'𝛆','f':'𝛇','g':'𝛈','h':'𝛉','i':'𝛊','j':'𝛋','k':'𝛌','l':'𝛍','m':'𝛎',
    'n':'𝛏','o':'𝛐','p':'𝛑','q':'𝛒','r':'𝛓','s':'𝛔','t':'𝛕','u':'𝛖','v':'𝛗','w':'𝛘','x':'𝛙','y':'𝛚','z':'𝛛',
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'
  };
  return text.split('').map(c => boldMap[c] || c).join('');
}

function toMonospace(text) {
  const monoMap = {
    'a':'𝖺','b':'𝖻','c':'𝖼','d':'𝖽','e':'𝖾','f':'𝖿','g':'𝗀','h':'𝗁','i':'𝗂','j':'𝗃','k':'𝗄','l':'𝗅','m':'𝗆',
    'n':'𝗇','o':'𝗈','p':'𝗉','q':'𝗊','r':'𝗋','s':'𝗌','t':'𝗍','u':'𝗎','v':'𝗏','w':'𝗐','x':'𝗑','y':'𝗒','z':'𝗓',
    'A':'𝖺','B':'𝖻','C':'𝖼','D':'𝖽','E':'𝖾','F':'𝖿','G':'𝗀','H':'𝗁','I':'𝗂','J':'𝗃','K':'𝗄','L':'𝗅','M':'𝗆',
    'N':'𝗇','O':'𝗈','P':'𝗉','Q':'𝗊','R':'𝗋','S':'𝗌','T':'𝗍','U':'𝗎','V':'𝗏','W':'𝗐','X':'𝗑','Y':'𝗒','Z':'𝗓',
    '0':'𝟢','1':'𝟣','2':'𝟤','3':'𝟥','4':'𝟦','5':'𝟧','6':'𝟨','7':'𝟩','8':'𝟪','9':'𝟫','-':'-'
  };
  return text.split('').map(c => monoMap[c] || c).join('');
}

async function generateHelpCanvas(userId, userName, categories) {
  const allFlattened = [];
  
  Object.keys(categories).sort().forEach(cat => {
    const authors = [...new Set(categories[cat].map(c => commands.get(c).config.author || "Système"))].join(", ");
    allFlattened.push({ type: 'cat', name: `${cat.toUpperCase()}`, author: authors });
    
    categories[cat].sort().forEach(cmd => {
      allFlattened.push({ type: 'cmd', name: cmd });
    });
  });

  const startY = 170;
  const lineHeight = 30;
  const colWidth = 270; 
  const startX = 50;
  
  const columnsCount = 4;
  const itemsPerCol = Math.ceil(allFlattened.length / columnsCount);
  const contentHeight = itemsPerCol * lineHeight;
  
  const canvasWidth = (columnsCount * colWidth) + (startX * 2);
  const canvasHeight = Math.max(900, startY + contentHeight + 80);

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Palette Studio Dark 2026 : Anthracite, Bleu Cobalt Épuré et Blanc Pur
  const bgMain = '#090d16';
  const bgCard = '#111827';
  const accentColor = '#60a5fa'; 
  const textMuted = '#6b7280';

  // Fond d'écran principal
  ctx.fillStyle = bgMain;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Dégradé radial d'ambiance ultra discret en arrière-plan
  let gradient = ctx.createRadialGradient(canvasWidth / 2, 0, 100, canvasWidth / 2, 0, canvasWidth);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Encart d'en-tête (Header Card)
  ctx.fillStyle = bgCard;
  ctx.roundRect ? ctx.roundRect(30, 30, canvasWidth - 60, 105, 12) : ctx.fillRect(30, 30, canvasWidth - 60, 105);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Trait d'accentuation vertical gauche du Dashboard
  ctx.fillStyle = accentColor;
  ctx.fillRect(30, 45, 4, 75);

  // Gestion de la Photo de Profil (Avatar)
  const avatarUrl = `https://graph.facebook.com/${userId}/picture?type=large&redirect=true&width=150&height=150`;
  const avSize = 64;
  const avX = 55;
  const avY = 50;

  try {
    const userAvatar = await loadImage(avatarUrl);
    ctx.save();
    ctx.beginPath(); 
    ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2, true); 
    ctx.clip();
    ctx.drawImage(userAvatar, avX, avY, avSize, avSize);
    ctx.restore();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; 
    ctx.lineWidth = 2; 
    ctx.beginPath(); 
    ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2 + 1, 0, Math.PI * 2); 
    ctx.stroke();
  } catch (e) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; 
    ctx.beginPath(); 
    ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2); 
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(userName ? userName.charAt(0).toUpperCase() : 'U', avX + avSize / 2, avY + avSize / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Textes Professionnels du En-tête
  ctx.fillStyle = '#ffffff'; 
  ctx.font = '600 22px system-ui, sans-serif'; 
  ctx.fillText("TABLEAU DE BORD SYSTEME", 140, 78);
  
  ctx.fillStyle = textMuted; 
  ctx.font = '500 13px system-ui, sans-serif';
  const cleanName = userName.length > 25 ? userName.substring(0, 25) + "..." : userName;
  const totalModules = allFlattened.filter(i => i.type === 'cmd').length;
  ctx.fillText(`SESSION OPTIMISÉE POUR : ${cleanName.toUpperCase()}  |  ${totalModules} FONCTIONS CHARGÉES`, 140, 102);

  // Rendu de la grille des catégories et commandes
  allFlattened.forEach((item, index) => {
    const col = Math.floor(index / itemsPerCol);
    const row = index % itemsPerCol;
    const x = startX + (col * colWidth);
    const y = startY + (row * lineHeight);

    if (item.type === 'cat') {
      // Intitulé de la catégorie
      ctx.fillStyle = accentColor;
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.fillText(item.name, x, y);
      
      // Métadonnées d'auteur discrètes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '400 9px system-ui, sans-serif';
      const displayAuthor = item.author.length > 15 ? item.author.substring(0, 12) + '..' : item.author;
      ctx.fillText(`[${displayAuthor}]`, x + ctx.measureText(item.name).width + 6, y - 1);
    } else {
      // Nom de la commande
      ctx.fillStyle = '#f3f4f6';
      ctx.font = '400 13px system-ui, sans-serif';
      const displayCmd = item.name.length > 24 ? item.name.substring(0, 21) + '..' : item.name;
      ctx.fillText(`▪  ${displayCmd}`, x + 4, y);
    }
  });

  // Bordure globale invisible mais structurante pour l'exportation
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);

  const tmpDir = path.join(__dirname, "..", "cache");
  await fs.ensureDir(tmpDir);
  const imagePath = path.join(tmpDir, `dashboard_v2026_${Date.now()}_${userId}.png`);
  fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
  return imagePath;
}

module.exports = {
  config: {
    name: "help",
    version: "2026.1",
    author: "Célestin 🔥 (Clean & Professional)",
    countDown: 2,
    role: 0,
    shortDescription: { en: "Catalogue épuré et moderne d'indexation des fonctionnalités système." },
    category: "info",
    guide: { en: "help [all / commande]" },
  },

  onReply: async function ({ message, Reply, event }) {
    try {
      const targetCmd = event.body.trim().toLowerCase();
      const checkCmd = commands.get(targetCmd) || commands.get(aliases.get(targetCmd));

      if (checkCmd) {
        const cfg = checkCmd.config;
        const replyMsg = `
✧ [ SPÉCIFICATIONS DU MODULE // ${cfg.name.toUpperCase()} ]
──────────────────────────────
  ▫️ Fonction : ${toSmallCaps(cfg.name)}
  ▫️ Créateur : ${cfg.author || "Système"}
  ▫️ Parchemin : ${cfg.description?.en || cfg.shortDescription?.en || "Aucun manuel disponible."}
  ▫️ Catégorie : ${toSmallCaps(cfg.category || "info")}
  ▫️ Latence : ${cfg.countDown || 0}s
  ▫️ Niveau requis : ${cfg.role === 2 ? "Propriétaire" : cfg.role === 1 ? "Administrateur" : "Utilisateur public"}
──────────────────────────────`;
        
        const res = await message.reply(replyMsg);
        global.GoatBot.onReply.set(res.messageID, {
          commandName: this.config.name,
          messageID: res.messageID,
          author: event.senderID
        });
        return;
      }
    } catch (err) {
      console.error(err);
    }
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const uid = event.senderID;
      const userName = await usersData.getName(uid);
      
      const categories = {};
      let totalCmds = 0;

      for (let [name, cmd] of commands) {
        const cat = cmd.config.category || "Autres";
        const formattedCat = cat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (!categories[formattedCat]) categories[formattedCat] = [];
        categories[formattedCat].push(name);
        totalCmds++;
      }

      // ---- INTERFACE TEXTUELLE ÉPURÉE DISCRÈTE ----
      if (args[0] && args[0].toLowerCase() === "all") {
        let textList = `✧ ${toBoldSans("Index Global des Modules")} ✧ (${totalCmds} Fonctions)\n`;
        textList += `──────────────────────────────\n\n`;
        
        const sortedCategories = Object.keys(categories).sort();
        
        for (const cat of sortedCategories) {
          const cmds = categories[cat].sort();
          textList += `▪️ [ ${toBoldSans(cat)} ] — ${cmds.length} items\n`;
          
          let lineBuffer = [];
          for (let i = 0; i < cmds.length; i++) {
            lineBuffer.push(`• ${toMonospace(cmds[i])}`);
            if (lineBuffer.length === 3 || i === cmds.length - 1) {
              textList += `  ${lineBuffer.join("   ")}\n`;
              lineBuffer = [];
            }
          }
          textList += `\n`;
        }
        
        textList += `──────────────────────────────\n`;
        textList += `ℹ️ Entrer : .help [nom du module] pour obtenir des précisions.\n`;
        textList += `💼 Développé et maintenu par Célestin`;

        const res = await message.reply(textList);
        global.GoatBot.onReply.set(res.messageID, {
          commandName: this.config.name,
          messageID: res.messageID,
          author: uid
        });
        return;
      }

      if (args[0]) {
        const checkCmd = commands.get(args[0].toLowerCase()) || commands.get(aliases.get(args[0].toLowerCase()));
        if (checkCmd) {
          const cfg = checkCmd.config;
          const replyMsg = `
✧ [ SPÉCIFICATIONS DU MODULE // ${cfg.name.toUpperCase()} ]
──────────────────────────────
  ▫️ Fonction : ${toSmallCaps(cfg.name)}
  ▫️ Créateur : ${cfg.author || "Système"}
  ▫️ Parchemin : ${cfg.description?.en || cfg.shortDescription?.en || "Aucun manuel disponible."}
  ▫️ Catégorie : ${toSmallCaps(cfg.category || "info")}
  ▫️ Latence : ${cfg.countDown || 0}s
  ▫️ Niveau requis : ${cfg.role === 2 ? "Propriétaire" : cfg.role === 1 ? "Administrateur" : "Utilisateur public"}
──────────────────────────────`;
          return message.reply(replyMsg);
        }
      }

      // ---- INTERFACE GRAPHIQUE CANVAS DASHBOARD 2026 ----
      const imagePath = await generateHelpCanvas(uid, userName, categories);

      const res = await message.reply({
        body: `📂 **INTERFACE DE CONTRÔLE INTERACTIVE**\n\n📑 Pour analyser les paramètres d'une commande précise, répondez simplement à ce message avec son nom.\n\n📱 *Note technique : Entrez ".help all" pour afficher instantanément la liste brute au format texte.*`,
        attachment: fs.createReadStream(imagePath)
      });

      setTimeout(() => {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }, 7000);

      global.GoatBot.onReply.set(res.messageID, {
        commandName: this.config.name,
        messageID: res.messageID,
        author: uid
      });

    } catch (err) {
      console.error(err);
    }
  }
};
