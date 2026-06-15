const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

// Fonction utilitaire locale pour générer les badges Canvas Pro
async function generateCallAdminCanvas(userId, userName, title, subTitle, messageContent, themeColor) {
	const canvas = createCanvas(900, 450);
	const ctx = canvas.getContext('2d');

	// Fond dégradé sombre et moderne
	let gradient = ctx.createLinearGradient(0, 0, 900, 450);
	gradient.addColorStop(0, '#0d0d1a');
	gradient.addColorStop(0.5, '#141426');
	gradient.addColorStop(1, '#0d0d1a');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Cadres doubles gravés
	ctx.strokeStyle = themeColor;
	ctx.lineWidth = 4;
	ctx.strokeRect(25, 25, 850, 400);
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 1;
	ctx.strokeRect(32, 32, 836, 386);

	// Séparateurs de style gravés (✧ ▬▭▬)
	ctx.fillStyle = themeColor;
	ctx.font = 'bold 16px "Sans-Serif"';
	ctx.fillText("✧ ▬▭▬ ▬▬ ✦ ▬▬ ▬▭▬ ✧", 400, 65);
	ctx.fillText("✧ ▬▭▬ ▬▬ ✦ ▬▬ ▬▭▬ ✧", 400, 395);

	// Récupération de l'avatar Facebook
	const avatarUrl = `https://graph.facebook.com/${userId}/picture?width=300&height=300&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
	try {
		const userAvatar = await loadImage(avatarUrl);
		ctx.save();
		ctx.beginPath();
		ctx.arc(190, 225, 110, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(userAvatar, 80, 115, 220, 220);
		ctx.restore();

		// Cercle néon de couleur autour de la photo
		ctx.strokeStyle = themeColor;
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.arc(190, 225, 112, 0, Math.PI * 2);
		ctx.stroke();
	} catch (e) {
		ctx.fillStyle = themeColor;
		ctx.beginPath(); ctx.arc(190, 225, 110, 0, Math.PI * 2); ctx.fill();
	}

	// Écriture des Titres
	ctx.fillStyle = themeColor;
	ctx.font = 'bold 36px "Sans-Serif"';
	ctx.fillText(title, 400, 120);

	ctx.fillStyle = '#ffffff';
	ctx.font = 'bold 24px "Sans-Serif"';
	let cleanName = userName.length > 25 ? userName.substring(0, 25) + "..." : userName;
	ctx.fillText(`👤 𝑵𝒐𝒎 : ${cleanName}`, 400, 175);

	ctx.fillStyle = '#aaaaaa';
	ctx.font = '18px "Sans-Serif"';
	ctx.fillText(subTitle, 400, 220);

	// Zone de texte pour le message (Retour à la ligne automatique)
	ctx.fillStyle = '#ffffff';
	ctx.font = 'italic 20px "Sans-Serif"';
	
	const words = messageContent.split(' ');
	let line = '💬 ';
	let y = 270;
	const maxWidth = 450;
	const lineHeight = 28;

	for (let n = 0; n < words.length; n++) {
		let testLine = line + words[n] + ' ';
		let metrics = ctx.measureText(testLine);
		if (metrics.width > maxWidth && n > 0) {
			if (y > 360) { // Si le texte dépasse le cadre bas, on arrête
				ctx.fillText(line.trim() + "...", 400, y);
				line = '';
				break;
			}
			ctx.fillText(line, 400, y);
			line = words[n] + ' ';
			y += lineHeight;
		} else {
			line = testLine;
		}
	}
	if (line) ctx.fillText(line, 400, y);

	const tmpDir = path.join(__dirname, "..", "cache");
	await fs.ensureDir(tmpDir);
	const imagePath = path.join(tmpDir, `callad_${Date.now()}_${userId}.png`);
	fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
	return imagePath;
}

module.exports = {
	config: {
		name: "callad",
		version: "2.0",
		author: "NTKhang x Célestin 🔥 (Canvas Edition)",
		countDown: 5,
		role: 0,
		category: "contacts admin"
	},

	langs: {
		en: {
			missingMessage: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n⚜️ 𝑴𝑬𝑺𝑺𝑨𝑮𝑬 𝑴𝑨𝑵𝑸𝑼𝑨𝑵𝑻\n\n💬 𝑬́𝒄𝒓𝒊𝒔 𝒖𝒏 𝒎𝒆𝒔𝒔𝒂𝒈𝒆 𝒑𝒐𝒖𝒓 𝒍𝒆 𝑹𝑶𝑰 👑\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
			sendByGroup: `\n城堡 𝑮𝒓𝒐𝒖𝒑𝒆 : %1\n🆔 𝑰𝑫 : %2`,
			sendByUser: `\n👤 𝑴𝒆𝒔𝒔𝒂𝒈𝒆 𝒑𝒓𝒊𝒗𝒆́`,
			content: `\n\n📜 𝑪𝑶𝑵𝑻𝑬𝑵𝑼\n═══════════════════\n%1\n═══════════════════\n💬 𝑹𝒆́𝒑𝒐𝒏𝒅𝒔 𝒊𝒄𝒊`,
			success: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n✅ 𝑻𝑹𝑨𝑵𝑺𝑴𝑰𝑺𝑺𝑰𝑶𝑵 𝑹𝑬́𝑼𝑺𝑺𝑰𝑬\n\n📡 𝑬𝒏𝒗𝒐𝒚𝒆́ 𝒂̀ %1 𝒂𝒅𝒎𝒊𝒏(𝒔)\n%2\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
			failed: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n⚠️ 𝑬́𝑪𝑯𝑬𝑪 𝑷𝑨𝑹𝑻𝑰𝑬𝑳\n\n❌ %1 𝒆́𝒄𝒉𝒆𝒄(𝒔)\n%2\n📌 𝑪𝒐𝒏𝒔𝒐𝒍𝒆\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
			reply: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n📩 𝑹𝑬́𝑷𝑶𝑵𝑺𝑬 𝑫𝑼 𝑹𝑶𝑰 👑 %1\n═══════════════════\n%2\n═══════════════════\n💬 𝑪𝒐𝒏𝒕𝒊𝒏𝒖𝒆\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
			replySuccess: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n✅ 𝑬module 𝑬𝑵𝑽𝑶𝒀𝑬́ 𝑨𝑼 𝑹𝑶𝑰 👑\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
			feedback: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n📝 𝑴𝑬𝑺𝑺𝑨𝑮𝑬 𝑼𝑻𝑰𝑳𝑰𝑺𝑨𝑻𝑬𝑼𝑹\n\n👤 %1\n🆔 %2%3\n\n═══════════════════\n%4\n═══════════════════\n💬 𝑹𝒆́𝒑𝒐𝒏𝒅𝒔\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
			replyUserSuccess: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n✅ 𝑹𝑬́𝑷𝑶𝑵𝑺𝑬 𝑬𝑵𝑽𝑶𝒀𝑬́𝑬\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`,
			noAdmin: `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n🚫 𝑨𝑼𝑪𝑼𝑵 𝑹𝑶𝑰\n\n⚠️ 𝑨𝒅𝒎𝒊𝒏 𝒊𝒏𝒅𝒆́𝒇𝒊𝒏𝒊\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧`
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;

		if (!args[0]) return message.reply(getLang("missingMessage"));
		if (config.adminBot.length == 0) return message.reply(getLang("noAdmin"));

		const { senderID, threadID, isGroup } = event;
		const senderName = await usersData.getName(senderID);

		const groupInfo = isGroup ? await threadsData.get(threadID) : null;
		const threadName = groupInfo ? groupInfo.threadName : "Message Privé";

		// Génération de l'image Canvas pour l'administrateur
		const textContent = args.join(" ");
		const subTitleText = isGroup ? `🏰 𝑮𝒓𝒐𝒖𝒑𝒆 : ${threadName}` : `👤 Via Message Privé`;
		const imagePath = await generateCallAdminCanvas(senderID, senderName, "📨 𝑨𝑷𝑷𝑬𝑳 𝑨𝑼 𝑹𝑶𝑰 👑", subTitleText, textContent, "#ffb703");

		const msgText = `✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n📨 𝑨𝑷𝑷𝑬𝑳 𝑨𝑼 𝑹𝑶𝑰 👑\n✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧\n\n👤 ${senderName}\n🆔 ${senderID}` + 
			(isGroup ? getLang("sendByGroup", threadName, threadID) : getLang("sendByUser")) + getLang("content", textContent);

		const formMessage = {
			body: msgText,
			mentions: [{ id: senderID, tag: senderName }],
			attachment: [
				fs.createReadStream(imagePath),
				...(await getStreamsFromAttachment(
					[...event.attachments, ...(event.messageReply?.attachments || [])]
						.filter(item => mediaTypes.includes(item.type))
				))
			]
		};

		const successIDs = [];
		const failedIDs = [];

		const adminNames = await Promise.all(config.adminBot.map(async item => ({
			id: item,
			name: await usersData.getName(item)
		})));

		for (const uid of config.adminBot) {
			try {
				const messageSend = await api.sendMessage(formMessage, uid);
				successIDs.push(uid);

				global.GoatBot.onReply.set(messageSend.messageID, {
					commandName,
					messageID: messageSend.messageID,
					threadID,
					messageIDSender: event.messageID,
					type: "userCallAdmin"
				});
			} catch (err) {
				failedIDs.push({ adminID: uid, error: err });
			}
		}

		// Nettoyage de l'image de cache après l'envoi aux admins
		if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

		let msg2 = "";
		if (successIDs.length > 0) msg2 += getLang("success", successIDs.length, adminNames.filter(item => successIDs.includes(item.id)).map(item => ` <@${item.id}> (${item.name})`).join("\n"));
		if (failedIDs.length > 0) {
			msg2 += getLang("failed", failedIDs.length, failedIDs.map(item => ` <@${item.adminID}> (${adminNames.find(a => a.id == item.adminID)?.name || item.adminID})`).join("\n"));
			log.err("CALL ADMIN", failedIDs);
		}

		return message.reply({
			body: msg2,
			mentions: adminNames.map(item => ({ id: item.id, tag: item.name }))
		});
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;
		const textReply = args.join(" ");

		switch (type) {
			case "userCallAdmin": {
				// Réponse de l'admin vers l'utilisateur (Thème Royal Cyan / Bleu Pro)
				const imagePath = await generateCallAdminCanvas(event.senderID, senderName, "📩 𝑹𝑬́𝑷𝑶𝑵𝑺𝑬 𝑫𝑼 𝑹𝑶𝑰 👑", "👑 Administrateur Global", textReply, "#00b4d8");

				const formMessage = {
					body: getLang("reply", senderName, textReply),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: [
						fs.createReadStream(imagePath),
						...(await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type))))
					]
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
					if (err) return message.err(err);

					message.reply(getLang("replyUserSuccess"));

					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "adminReply"
					});
				}, messageIDSender);
				break;
			}

			case "adminReply": {
				// Retour de l'utilisateur vers l'admin (Thème Vert/Neon Feedback)
				let sendByGroup = "";
				let subTitleText = "👤 Via Message Privé";

				if (isGroup) {
					const { threadName } = await api.getThreadInfo(event.threadID);
					sendByGroup = getLang("sendByGroup", threadName, event.threadID);
					subTitleText = `🏰 𝑮𝒓𝒐𝒖𝒑𝒆 : ${threadName}`;
				}

				const imagePath = await generateCallAdminCanvas(event.senderID, senderName, "📝 𝑴𝑬𝑺𝑺𝑨𝑮𝑬 𝑼𝑻𝑰𝑳𝑰𝑺𝑨𝑻𝑬𝑼𝑹", subTitleText, textReply, "#2ec4b6");

				const formMessage = {
					body: getLang("feedback", senderName, event.senderID, sendByGroup, textReply),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: [
						fs.createReadStream(imagePath),
						...(await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type))))
					]
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
					if (err) return message.err(err);

					message.reply(getLang("replySuccess"));

					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}
		}
	}
};
