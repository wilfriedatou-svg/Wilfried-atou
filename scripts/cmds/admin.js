const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const axios = require('axios');

// ==========================================
// 🎨 ENGINE CANVAS - GESTION DES ACCÈS PRIVILEGES
// ==========================================
async function generateAdminCanvas(userId, title, subtitle, mainText, themeColor) {
	const canvas = createCanvas(900, 480);
	const ctx = canvas.getContext('2d');

	// Fond Studio Dark épuré
	ctx.fillStyle = '#0f172a';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Dégradé radial central discret pour la profondeur
	let radialGrad = ctx.createRadialGradient(450, 240, 50, 450, 240, 500);
	radialGrad.addColorStop(0, 'rgba(30, 41, 59, 0.5)');
	radialGrad.addColorStop(1, '#0f172a');
	ctx.fillStyle = radialGrad;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Bordures minimalistes
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
	ctx.lineWidth = 1;
	ctx.strokeRect(25, 25, 850, 430);

	// Ligne d'accent colorée (Indicateur visuel de statut)
	ctx.fillStyle = themeColor;
	ctx.fillRect(25, 25, 5, 430);

	// Récupération sécurisée et mise en cache de la photo de profil
	const avX = 80, avY = 130, avSize = 220;
	const avatarUrl = `https://graph.facebook.com/${userId}/picture?type=large&redirect=true&width=300&height=300`;
	
	try {
		const response = await axios.get(avatarUrl, {
			responseType: 'arraybuffer',
			headers: {
				'accept': 'image/avif,image/webp,image/apng,*/*;q=0.8',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			},
			timeout: 5000
		});

		const userAvatar = await loadImage(Buffer.from(response.data));
		ctx.save();
		ctx.beginPath();
		ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2, true);
		ctx.clip();
		ctx.drawImage(userAvatar, avX, avY, avSize, avSize);
		ctx.restore();

		// Contour discret de l'avatar
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2 + 1, 0, Math.PI * 2);
		ctx.stroke();
	} catch (e) {
		// Fallback si l'image ne peut pas être récupérée
		ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
		ctx.beginPath(); 
		ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2); 
		ctx.fill();
		
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 72px system-ui, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText("👤", avX + avSize / 2, avY + avSize / 2);
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
	}

	// Textes de l'interface
	ctx.fillStyle = '#ffffff';
	ctx.font = '600 30px system-ui, sans-serif';
	ctx.fillText(title, 360, 115);

	ctx.fillStyle = themeColor;
	ctx.font = '500 14px system-ui, sans-serif';
	ctx.fillText(subtitle.toUpperCase(), 360, 150);

	// Zone d'affichage des listes / logs d'identifiants
	ctx.fillStyle = '#94a3b8';
	ctx.font = '15px system-ui, sans-serif';
	
	const lines = mainText.split('\n');
	let y = 200;
	const lineHeight = 32;

	for (let i = 0; i < lines.length; i++) {
		if (y > 410) {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
			ctx.fillText("• D'autres enregistrements masqués...", 360, y);
			break;
		}
		ctx.fillText(lines[i], 360, y);
		y += lineHeight;
	}

	const tmpDir = path.join(__dirname, "..", "cache");
	await fs.ensureDir(tmpDir);
	const imagePath = path.join(tmpDir, `admin_panel_${Date.now()}_${userId}.png`);
	fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
	return imagePath;
}

module.exports = {
	config: {
		name: "admin",
		version: "4.0",
		author: "NTKhang + Celestin 👑 (Version Épurée 2026)",
		countDown: 5,
		role: 2,
		description: {
			en: "Manage system administration privileges with clean visual dashboard cards."
		},
		category: "system"
	},

	langs: {
		en: {
			added: "👑 Privilèges système accordés à %1 utilisateur(s) :\n%2",
			alreadyAdmin: "\nℹ️ Déjà enregistré(s) dans le registre d'administration :\n%2",
			missingIdAdd: "⚠️ Veuillez spécifier un UID ou mentionner un utilisateur.",
			removed: "🔒 Accès révoqué pour %1 utilisateur(s) :\n%2",
			notAdmin: "⚠️ Cet utilisateur ne dispose d'aucun privilège élevé :\n%2",
			missingIdRemove: "⚠️ Veuillez spécifier un UID ou mentionner un utilisateur pour la destitution.",
			listAdmin: "👔 Registre des Administrateurs Système :\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const senderID = event.senderID;

		switch (args[0]) {

			// ================= ADD =================
			case "add":
			case "-a": {
				if (!args[1]) return message.reply(getLang("missingIdAdd"));

				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));

				if (uids.length == 0) return message.reply(getLang("missingIdAdd"));

				const notAdminIds = [];
				const adminIds = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid)) adminIds.push(uid);
					else notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const getNames = await Promise.all(
					uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);

				const canvasText = getNames.map(i => `▪  ${i.name} (${i.uid})`).join("\n");
				const imagePath = await generateAdminCanvas(uids[0], "ATTRIBUTION DE PRIVILÈGES", `Statut : +${notAdminIds.length} Administrateur(s) ajouté(s)`, canvasText, "#60a5fa");

				let replyText = (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(i => `  • ${i.name} [${i.uid}]`).join("\n")) : "") +
					(adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `  • ${uid}`).join("\n")) : "");

				return message.reply({ body: replyText, attachment: fs.createReadStream(imagePath) }, () => {
					if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
				});
			}

			// ================= REMOVE =================
			case "remove":
			case "-r": {
				if (!args[1]) return message.reply(getLang("missingIdRemove"));

				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));

				if (uids.length == 0) return message.reply(getLang("missingIdRemove"));

				const notAdminIds = [];
				const adminIds = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid)) adminIds.push(uid);
					else notAdminIds.push(uid);
				}

				for (const uid of adminIds)
					config.adminBot.splice(config.adminBot.indexOf(uid), 1);

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const getNames = await Promise.all(
					adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);

				const canvasText = getNames.map(i => `▪  ${i.name} (${i.uid})`).join("\n");
				const imagePath = await generateAdminCanvas(uids[0], "RÉVOCATION DE PRIVILÈGES", `Statut : -${adminIds.length} Administrateur(s) retiré(s)`, canvasText, "#ef4444");

				let replyText = (adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(i => `  • ${i.name} [${i.uid}]`).join("\n")) : "") +
					(notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `  • ${uid}`).join("\n")) : "");

				return message.reply({ body: replyText, attachment: fs.createReadStream(imagePath) }, () => {
					if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
				});
			}

			// ================= LIST =================
			case "list":
			case "-l": {
				const getNames = await Promise.all(
					config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);

				const canvasText = getNames.map((i, index) => `${index + 1}. ${i.name}\n    [ID: ${i.uid}]`).join("\n");
				const imagePath = await generateAdminCanvas(senderID, "REGISTRE DE SÉCURITÉ", `Total : ${config.adminBot.length} Utilisateurs authentifiés`, canvasText, "#10b981");

				return message.reply({ body: getLang("listAdmin", getNames.map(i => `  ▪ ${i.name} [${i.uid}]`).join("\n")), attachment: fs.createReadStream(imagePath) }, () => {
					if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
				});
			}

			// ================= DEFAULT =================
			default:
				return message.reply("⚙️ Action requise non reconnue. Syntaxe : admin [add (-a) / remove (-r) / list (-l)]");
		}
	}
};
