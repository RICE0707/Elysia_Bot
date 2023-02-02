const { timeformat } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊正常運行",
  description: "查看機器人正常運行時間",
  category: "資訊類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply(`> <a:r3_rice:868583679465758820> 已運行：\` ${timeformat(process.uptime())} \`。`);
  },
};
