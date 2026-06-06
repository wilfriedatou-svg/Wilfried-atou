const axios = require("axios");

module.exports = {
  config: {
    name: "anime",
    version: "1.2",
    author: "Celestin",
    role: 0,
    description: "Affiche un anime recherché avec vraie description en français",
    category: "anime"
  },

  onStart: async function ({ message, args }) {
    try {

      const query = args.join(" ");

      if (!query) {
        return message.reply("❌ Donne un nom d'anime.\nEx: anime Naruto");
      }

      await message.reply("⏳ Recherche de l'anime...");

      // 🎌 API Jikan (MyAnimeList - vraie base anime)
      const res = await axios.get("https://api.jikan.moe/v4/anime", {
        params: {
          q: query,
          limit: 1
        }
      });

      const anime = res.data?.data?.[0];

      if (!anime) {
        return message.reply("❌ Aucun anime trouvé.");
      }

      const title = anime.title || "Inconnu";
      const episodes = anime.episodes || "N/A";
      const score = anime.score || "N/A";
      const year = anime.year || "N/A";
      const img = anime.images?.jpg?.image_url;

      const synopsisRaw = anime.synopsis || "Pas de description disponible.";

      // 🌐 Traduction FR
      async function translate(text) {
        try {
          const t = await axios.get(
            "https://translate.googleapis.com/translate_a/single",
            {
              params: {
                client: "gtx",
                sl: "auto",
                tl: "fr",
                dt: "t",
                q: text
              }
            }
          );

          return t.data[0].map(x => x[0]).join("");
        } catch {
          return text;
        }
      }

      const descriptionFR = await translate(synopsisRaw);

      const frame = `
❁ ≖≖✿❁ ≖≖✿❁ ≖≖✿❁ ≖≖ ❁

🎌 𝗔𝗡𝗜𝗠𝗘 𝗜𝗡𝗙𝗢𝗦

📺 Titre : ${title}
📅 Année : ${year}
🎞️ Épisodes : ${episodes}
⭐ Score : ${score}

📖 Description :
${descriptionFR}

❁ ≖≖✿❁ ≖≖✿❁ ≖≖✿❁ ≖≖ ❁
`;

      return message.reply({
        body: frame,
        attachment: img ? await global.utils.getStreamFromURL(img) : null
      });

    } catch (err) {
      return message.reply(`
❁ ≖≖✿❁ ≖≖✿❁ ≖≖✿❁ ≖≖ ❁

❌ API indisponible ou erreur

❁ ≖≖✿❁ ≖≖✿❁ ≖≖✿❁ ≖≖ ❁
`);
    }
  }
};
