module.exports = {
  config: {
    name: "pending",
    version: "1.0.0",
    permission: 2,
    credits: "Hedgehog",
    description: "Gérer les messages en attente",
    commandCategory: "Admin",
    usages: "pending [list/accept]",
    cooldowns: 5
  },
  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    if(args[0] == "list") {
      return api.sendMessage("Fonction pending activée ✅", threadID, messageID);
    }
    api.sendMessage("Usage: pending list", threadID, messageID);
  }
}