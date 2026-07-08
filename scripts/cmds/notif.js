const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const GIFEncoder = require('gifencoder');

module.exports = {
    config: {
        name: "notif",
        version: "6.5.0",
        author: "Célestin 🇦🇴🛀",
        countDown: 5,
        role: 2, // Admin uniquement
        description: "Notification Or (1000x580) - Envoi Global Absolu Multi-sources",
        category: "admin",
        guide: {
            en: "{p}notifall [texte] ou {p}notifones [texte]"
        }
    },

    onStart: async function ({ api, event, args, message, threadsData }) {
        const { threadID, senderID, body } = event;
        const messageText = args.join(" ") || "Notification Système.";
        
        const isGlobal = body.toLowerCase().startsWith("!notifall") || body.toLowerCase().includes("notifall");
        
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const gifPath = path.join(cacheDir, `notif_royal_${Date.now()}.gif`);

        await message.reply(`👑 [GoatBot] Génération du visuel (1000x580) avec effacement lent...`);

        try {
            // ─── 1. RÉCUPÉRATION DU NOM DE L'ADMIN ───
            let userName = "Administrateur";
            try {
                const userInfo = await api.getUserInfo(senderID);
                userName = userInfo[senderID]?.name || "Administrateur";
            } catch(e) {}

            // ─── 2. CHARGEMENT DE L'AVATAR (STYLE PREFIX) ───
            let avatarImg = null;
            const avatarUrl = `https://graph.facebook.com/${senderID}/picture?type=large`;
            
            try {
                avatarImg = await loadImage(avatarUrl);
            } catch (e) {
                try {
                    avatarImg = await loadImage(`https://api.mestaria.com/fb/avatar?id=${senderID}`);
                } catch (err) {
                    console.log("Impossible de charger l'avatar, utilisation du fallback graphique.");
                }
            }

            // ─── 3. ANIMATION : ÉCRITURE RAPIDE PUIS EFFACEMENT CARACTÈRE PAR CARACTÈRE ───
            let framesText = [];
            
            // Écriture
            for (let i = 1; i <= messageText.length; i += 2) {
                framesText.push(messageText.substring(0, i) + "┃");
            }
            
            // Pause (8 frames)
            for (let i = 0; i < 8; i++) {
                framesText.push(messageText + " ");
            }
            
            // Effacement LENT
            for (let i = messageText.length; i >= 0; i--) {
                framesText.push(messageText.substring(0, i) + "┃");
            }

            // ─── 4. MOTEUR CANVAS (1000x580) ───
            const width = 1000;
            const height = 580;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            
            const encoder = new GIFEncoder(width, height);
            const writeStream = fs.createWriteStream(gifPath);
            encoder.createReadStream().pipe(writeStream);
            
            encoder.start();
            encoder.setRepeat(0);   
            encoder.setDelay(140); 
            encoder.setQuality(10); 

            const avatarX = 200;
            const avatarY = 290;
            const radius = 110;

            for (let f = 0; f < framesText.length; f++) {
                ctx.clearRect(0, 0, width, height);

                // Fond Sombre
                let gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, '#0f0c20');
                gradient.addColorStop(0.5, '#0a0d16');
                gradient.addColorStop(1, '#04050a');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);

                // Dégradé Or Royal
                const themeColor = ctx.createLinearGradient(30, 30, width - 30, height - 30);
                themeColor.addColorStop(0, '#bf953f');
                themeColor.addColorStop(0.25, '#fcf6ba');
                themeColor.addColorStop(0.5, '#b38728');
                themeColor.addColorStop(0.75, '#fbf5b7');
                themeColor.addColorStop(1, '#aa771c');

                // Cadre
                ctx.strokeStyle = themeColor;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.roundRect(30, 30, width - 60, height - 60, 25);
                ctx.stroke();

                // Anneaux
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(avatarX, avatarY, radius + 12, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = themeColor;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(avatarX, avatarY, radius + 12, 0.3, Math.PI * 1.5);
                ctx.stroke();

                // Avatar
                if (avatarImg) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatarImg, avatarX - radius, avatarY - radius, radius * 2, radius * 2);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#b38728';
                    ctx.beginPath(); 
                    ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2); 
                    ctx.fill();
                }

                // Titres
                ctx.textAlign = 'left';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 36px "Sans-Serif"';
                ctx.fillText(userName.toUpperCase(), 420, 115);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '18px "Sans-Serif"';
                ctx.fillText(isGlobal ? "DIFFUSION BASE DE DONNÉES EN COURS..." : "ALERTE LOCALISÉE", 420, 155);

                const decoration = "✧ ══━━✥👑✥━━══ ࿇";
                ctx.fillStyle = themeColor;
                ctx.font = 'bold 22px Arial';
                ctx.fillText(decoration, 420, 215);

                // Texte Animé
                ctx.fillStyle = themeColor;
                ctx.font = 'bold 32px "Sans-Serif"';
                
                const maxWidth = 500;
                const words = framesText[f].split(' ');
                let line = '';
                let posY = 290;

                for (let n = 0; n < words.length; n++) {
                    let testLine = line + words[n] + ' ';
                    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                        ctx.fillText(line, 420, posY);
                        line = words[n] + ' ';
                        posY += 45;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, 420, posY);

                ctx.fillStyle = themeColor;
                ctx.font = 'bold 22px Arial';
                ctx.fillText(decoration, 420, 455);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.font = '12px "Sans-Serif"';
                ctx.fillText("» CORE MATRIX SYSTEM BROADCAST «", 420, 510);
                
                encoder.addFrame(ctx);
            }

            encoder.finish();
            await new Promise((resolve) => writeStream.on('finish', resolve));

            // ─── 5. STRATÉGIE D'ENVOI GLOBAL ABSOLU ───
            if (isGlobal) {
                // Fusion des sources pour récupérer absolument TOUS les IDs de groupes possibles
                let targetIDs = new Set();
                
                // Source 1: threadsData
                try {
                    const allThreadsData = await threadsData.getAll() || [];
                    for (const t of allThreadsData) {
                        const id = t.threadID || t.id;
                        if (id) targetIDs.add(id.toString());
                    }
                } catch(e) {}

                // Source 2: api.getThreadList
                try {
                    const threadList = await api.getThreadList(200, null, ["INBOX"]) || [];
                    for (const t of threadList) {
                        if (t.isGroup && t.threadID) targetIDs.add(t.threadID.toString());
                    }
                } catch(e) {}

                if (targetIDs.size === 0) {
                    return message.reply({ body: `❌ Aucun groupe trouvé dans les registres.`, attachment: fs.createReadStream(gifPath) });
                }

                let count = 0;
                for (const targetID of targetIDs) {
                    try {
                        await api.sendMessage({
                            body: `࿇ ✜»✜«✜»✜«✜»✜«✜»✜ ࿇\n📢 ANNONCE GLOBALE DE L'ADMIN\n✜»✜«✜»✜«✜»✜«✜»✜\n✧❁❁❁✧✿✿✿✧❁❁❁✧`,
                            attachment: fs.createReadStream(gifPath)
                        }, targetID);
                        count++;
                        await new Promise(res => setTimeout(res, 1200)); // Anti-Spam
                    } catch (err) {
                        console.log(`Le bot n'a pas pu écrire dans le salon : ${targetID}`);
                    }
                }
                if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
                return message.reply(`🔥 Diffusé avec succès dans ${count} groupes actifs !`);
            } else {
                await message.reply({
                    body: `👑 Notification Terminée :`,
                    attachment: fs.createReadStream(gifPath)
                }, () => {
                    if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
                });
            }

        } catch (error) {
            console.error(error);
            if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
            return message.reply(`❌ Erreur Système : ${error.message}`);
        }
    }
};
