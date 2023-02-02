const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊機器人狀態",
  description: "查看機器人狀態",
  category: "資訊類",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["botstat", "botinfo"],
  },

  async messageRun(message, args) {
    const response = botstats(message.client);
    await message.safeReply(response);
  },
};
