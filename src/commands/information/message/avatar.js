const avatarInfo = require("../shared/avatar");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊使用者頭像",
  description: "取得使用者頭像",
  category: "資訊類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[使用者︱使用者代號]",
  },

  async messageRun(message, args) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = avatarInfo(target.user);
    await message.safeReply(response);
  },
};
