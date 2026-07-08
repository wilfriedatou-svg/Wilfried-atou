const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const GIFEncoder = require('gifencoder');

module.exports = {
    config: {
        name: "notif", // Le nom de base (le script gère l'alias ou tu peux dupliquer le fichier)
        version: "2.5.0",
        author: "Célestin",
        countDown: 10,
        role: 2, // Réservé aux admins
        description: "Notification animée dont la taille s'adapte au message (all = tous les groupes, ones = ce groupe)",
        category: "admin",
        guide: "Tapez '!notifall [texte]' pour diffuser partout ou '!notifones [texte]' pour ce groupe uniquement."
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID, body } = event;
        const messageText = args.join(" ") || "Système Admin : Initialisation.";
        
        // Détection du mode choisi par l'utilisateur via le mot tapé
        const isGlobal = body.toLowerCase().startsWith("!notifall");

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const gifPath = path.join(cacheDir, `notif_cyber_${senderID}.gif`);

        await api.sendMessage(`🎬 Génération de l'animation personnalisée (${isGlobal ? "Diffusion Globale" : "Mode Solo"})...`, threadID, messageID);

        try {
            // 1. Récupération des infos admin
            const info = await api.getUserInfo(senderID);
            const userName = info[senderID]?.name || "Administrateur";
            
            // Récupération de la photo de profil avec sécurité
            let avatarImg = null;
            const avatarUrls = [
                `https://graph.facebook.com/${senderID}/picture?type=large`,
                `https://graph.facebook.com/${senderID}/picture?width=300&height=300`,
                `https://i.imgur.com/8QnUq8K.png` 
            ];

            for (const url of avatarUrls) {
                try {
                    const response = await axios.get(url, { 
                        responseType: 'arraybuffer',
                        headers: { 'User-Agent': 'Mozilla/5.0' },
                        timeout: 3000 
                    });
                    avatarImg = await loadImage(Buffer.from(response.data));
                    break;
                } catch (e) {
                    console.log("Erreur avatar, tentative URL suivante...");
                }
            }

            // 2. Préparation des frames (écriture/effacement)
            let framesText = [];
            for(let i = 1; i <= messageText.length; i++) {
                framesText.push(messageText.substring(0, i) + "┃");
            }
            for(let i = 0; i < 12; i++) { // Petite pause sur le texte complet
                framesText.push(messageText + (i % 2 === 0 ? "┃" : " ")); 
            }
            for(let i = messageText.length; i >= 0; i -= 2) {
                framesText.push(messageText.substring(0, i) + "┃");
            }

            // 3. CALCUL DYNAMIQUE DE LA TAILLE DU CANVAS
            // Base fixe pour l'avatar et les marges (~140px) + la longueur estimée du texte
            // On impose un minimum de 320px et un maximum de 600px pour que ça reste lisible sur mobile
            const textEstimation = messageText.length * 7.5;
            const dynamicWidth = Math.min(Math.max(320, Math.floor(140 + textEstimation)), 600);
            const height = 110;

            const canvas = createCanvas(dynamicWidth, height);
            const ctx = canvas.getContext('2d');
            
            const encoder = new GIFEncoder(dynamicWidth, height);
            encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
            encoder.start();
            encoder.setRepeat(0);   
            encoder.setDelay(60);   
            encoder.setQuality(8);  

            // 4. Dessin des images du GIF
            for (let f = 0; f < framesText.length; f++) {
                ctx.clearRect(0, 0, dynamicWidth, height);

                // Fond Cyber Noir & Bleu Nuit adapté à la largeur dynamique
                const bgGradient = ctx.createLinearGradient(0, 0, dynamicWidth, height);
                bgGradient.addColorStop(0, '#060913');
                bgGradient.addColorStop(0.5, '#0b1120');
                bgGradient.addColorStop(1, '#05070c');
                ctx.fillStyle = bgGradient;
                ctx.beginPath();
                ctx.roundRect(10, 10, dynamicWidth - 20, 90, 18);
                ctx.fill();

                // Bordure Néon Animée adaptée
                const borderGradient = ctx.createLinearGradient(10 + (f * 3) % dynamicWidth, 10, dynamicWidth - (f * 2) % dynamicWidth, height);
                borderGradient.addColorStop(0, '#0052d4'); 
                borderGradient.addColorStop(0.5, '#651fff'); 
                borderGradient.addColorStop(1, '#00c6ff'); 
                ctx.strokeStyle = borderGradient;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Photo de Profil en Cercle
                const avatarSize = 54;
                const avatarX = 25;
                const avatarY = 28;

                ctx.save();
                ctx.beginPath();
                ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                if (avatarImg) {
                    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
                }
                ctx.restore();

                // Contour brillant de l'avatar
                ctx.beginPath();
                ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(0, 198, 255, 0.6)";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Statut en ligne clignotant
                ctx.beginPath();
                ctx.arc(avatarX + avatarSize - 3, avatarY + avatarSize - 3, 6, 0, Math.PI * 2);
                ctx.fillStyle = (f % 10 < 7) ? "#00e676" : "#007b3e";
                ctx.fill();
                ctx.strokeStyle = "#060913";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Nom de l'Admin
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 14px sans-serif";
                ctx.fillText(userName, avatarX + avatarSize + 15, 44);

                // Badge "SYSTEM" automatique après le nom
                ctx.fillStyle = "rgba(0, 82, 212, 0.4)";
                ctx.beginPath();
                ctx.roundRect(avatarX + avatarSize + 15 + ctx.measureText(userName).width + 8, 31, 48, 16, 4);
                ctx.fill();
                ctx.fillStyle = "#00c6ff";
                ctx.font = "bold 9px sans-serif";
                ctx.fillText("SYSTEM", avatarX + avatarSize + 15 + ctx.measureText(userName).width + 14, 42);

                // Date à droite (s'adapte à la fin du rectangle dynamique)
                ctx.fillStyle = "#58a6ff";
                ctx.font = "11px sans-serif";
                ctx.fillText("Maintenant", dynamicWidth - 85, 44);

                // Message évolutif
                ctx.fillStyle = "#ccd6f6";
                ctx.font = "13px monospace";
                let currentFrameText = framesText[f];
                ctx.fillText(currentFrameText, avatarX + avatarSize + 15, 68);

                encoder.addFrame(ctx);
            }

            encoder.finish();

            // 5. LOGIQUE D'ENVOI (ALL VS ONES)
            if (isGlobal) {
                // Version TOUS LES GROUPES (notifall)
                const inbox = await api.getThreadList(100, null, ["INBOX"]) || [];
                const allGroups = inbox.filter(t => t.isGroup && t.isSubscribed);

                if (allGroups.length === 0) {
                    await api.sendMessage({ body: "📢 [Mode Solo Automatique - Aucun autre groupe détecté] :", attachment: fs.createReadStream(gifPath) }, threadID);
                    if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
                    return;
                }

                let dispatchCount = 0;
                for (const thread of allGroups) {
                    try {
                        await api.sendMessage({
                            body: "⚡ [ALERTE GLOBALE DE L'ADMINISTRATEUR]",
                            attachment: fs.createReadStream(gifPath)
                        }, thread.threadID);
                        dispatchCount++;
                        await new Promise(res => setTimeout(res, 600)); 
                    } catch (err) {
                        console.log(`Erreur d'envoi groupe : ${thread.threadID}`);
                    }
                }
                if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
                return api.sendMessage(`🔥 Diffusé avec succès dans ${dispatchCount} groupes !`, threadID, messageID);

            } else {
                // Version UN SEUL GROUPE (notifones)
                await api.sendMessage({
                    body: "💬 Nouvelle notification reçue :",
                    attachment: fs.createReadStream(gifPath)
                }, threadID, () => {
                    if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
                }, messageID);
            }

        } catch (error) {
            console.error(error);
            if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
            return api.sendMessage("❌ Une erreur est survenue lors du traitement.", threadID, messageID);
        }
    }
};
