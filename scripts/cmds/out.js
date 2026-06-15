const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

// ==========================================
// 🎨 ENGIN CANVAS POUR LE BADGE DE DÉPART
// ==========================================
async function generateOutCanvas(botId, botName, threadName, memberCount) {
	const canvas = createCanvas(900, 450);
	const ctx = canvas.getContext('2d');

	// Fond dégradé sombre et électrique (Ambiance Overdrive / Extinction)
	let gradient = ctx.createLinearGradient(0, 0, 900, 450);
	gradient.addColorStop(0, '#110414');
	gradient.addColorStop(0.5, '#1f0624');
	gradient.addColorStop(1, '#110414');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Cadres doubles gravés (Néon Violet / Blanc)
	ctx.strokeStyle = '#9d4edd';
	ctx.lineWidth = 4;
	ctx.strokeRect(25, 25, 850, 400);
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 1;
	ctx.strokeRect(32, 32, 836, 386);

	// Décorations graphiques gravées
	ctx.fillStyle = '#9d4edd';
	ctx.font = 'bold 16px "Sans-Serif"';
	ctx.fillText("✧ ▬▭▬ ▬▬ ✦ ▬▬ ▬▭▬ ✧", 400, 65);
	ctx.fillText("✧ ▬▭▬ ▬▬ ✦ ▬▬ ▬▭▬ ✧", 400, 395);

	// Récupération de l'avatar du Bot
	const avatarUrl = `https://graph.facebook.com/${botId}/picture?width=300&height=300&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
	try {
		const botAvatar = await loadImage(avatarUrl);
		ctx.save();
		ctx.beginPath();
		ctx.arc(190, 225, 110, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(botAvatar, 80, 115, 220, 220);
		ctx.restore();

		// Halo néon autour du profil du bot
		ctx.strokeStyle = '#9d4edd';
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.arc(190, 225, 112, 0, Math.PI * 2);
		ctx.stroke();
	} catch (e) {
		ctx.fillStyle = '#9d4edd';
		ctx.beginPath(); ctx.arc(190, 225, 110, 0, Math.PI * 2); ctx.fill();
	}

	// Écriture des données systèmes sur l'image
	ctx.fillStyle = '#9d4edd';
	ctx.font = 'bold 36px "Sans-Serif"';
	ctx.fillText("🔌 𝑫𝑬́𝑪𝑶𝑵𝑵𝑬𝑿𝑰𝑶𝑵 𝑫𝑼 𝑩𝑶𝑻", 400, 130);

	ctx.fillStyle = '#ffffff';
	ctx.font = 'bold 24px "Sans-Serif"';
	ctx.fillText(`🤖 𝑵𝒐𝒎 : ${botName}`, 400, 195);

	ctx.fillStyle = '#aaaaaa';
	ctx.font = '20px "Sans-Serif"';
	let cleanThread = threadName.length > 20 ? threadName.substring(0, 20) + "..." : threadName;
	ctx.fillText(`🏰 𝑮𝒓𝒐𝒖𝒑𝒆 𝒒𝒖𝒊𝒕𝒕𝒆́ : ${cleanThread}`, 400, 250);

	ctx.fillStyle = '#ffffff';
	ctx.font = 'italic 16px "Sans-Serif"';
	ctx.fillText(`👋 Au revoir aux ${memberCount} membres.`, 400, 310);

	ctx.fillStyle = '#9d4edd';
	ctx.font = 'bold 16px "Sans-Serif"';
	ctx.fillText("» SYSTEM SHUTDOWN COMPLETED «", 400, 355);

	const tmpDir = path.join(__dirname, "..", "cache");
	await fs.ensureDir(tmpDir);
	const imagePath = path.join(tmpDir, `out_${Date.now()}_${botId}.png`);
	fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
	return imagePath;
}

module.exports = {
	config: {
		name: "out",
		version: "2.0",
		author: "Célestin 🔥 (Canvas Edition)",
		countDown: 10,
		role: 1, // Limité aux admins/owners du bot
		category: "admin"
	},

	langs: {
		fr: {
			searching: "⚙️ Initialisation de la séquence de sortie...",
			leaving: "🔌 Extinction des modules et déconnexion imminente..."
		}
	},

	onStart: async function ({ message, event, api, threadsData, getLang }) {
		const { threadID } = event;
		
		if (!event.isGroup) {
			return message.reply("❌ Cette commande ne peut être exécutée que dans un groupe.");
		}

		// Étape 1 : Lancement de l'animation textuelle
		const animMsg = await message.reply(getLang("searching"));
		
		setTimeout(async () => {
			await message.edit(getLang("leaving"), animMsg.messageID);
			
			try {
				const botId = api.getCurrentUserID();
				const botName = global.GoatBot.config.botName || "GoatBot";
				
				const threadInfo = await api.getThreadInfo(threadID);
				const threadName = threadInfo.threadName || "Ce groupe";
				const memberCount = threadInfo.participantIDs.length;

				// Étape 2 : Génération de l'image Canvas Pro
				const imagePath = await generateOutCanvas(botId, botName, threadName, memberCount);

				const byeMessage = {
					body: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n🛑 𝑶𝑹𝑫𝑹𝑬 𝑫𝑬 𝑺𝑶𝑹𝑻𝑰𝑬 𝑬𝑿𝑬́𝑪𝑼𝑻𝑬́\n\nLe bot quitte définitivement ce salon.\nMerci pour votre accueil. 👋\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
					attachment: fs.createReadStream(imagePath)
				};

				// Étape 3 : Envoi de l'image de garde et déconnexion immédiate du groupe
				await api.sendMessage(byeMessage, threadID, async (err) => {
					if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
					if (err) return;
					
					// Le bot s'auto-éjecte du groupe
					await api.removeUserFromGroup(botId, threadID);
				});

			} catch (error) {
				console.error(error);
				message.reply("❌ Une erreur est survenue lors de la génération de la séquence de sortie.");
			}
		}, 3000); // 3 secondes d'attente pour laisser l'animation tourner
	}
};
