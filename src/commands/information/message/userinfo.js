const userInfo = require("../shared/user");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊使用者",
  description: "查看使用者資訊",
  category: "資訊類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[使用者|使用者代碼]",
    aliases: ["uinfo", "memberinfo"],
  },

  async messageRun(message, args) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = userInfo(target);
    await message.safeReply(response);
  },
};
