const guildInfo = require("../shared/guild");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊群組資訊",
  description: "查看群組資訊",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["serverinfo"],
  },

  async messageRun(message, args) {
    const response = await guildInfo(message.guild);
    await message.safeReply(response);
  },
};
