const emojiInfo = require("../shared/emoji");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊表情符號",
  description: "查看表情符號資訊",
  category: "資訊類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<表情符號>",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const emoji = args[0];
    const response = emojiInfo(emoji);
    await message.safeReply(response);
  },
};
