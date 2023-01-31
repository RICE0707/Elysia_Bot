const disconnect = require("../shared/disconnect");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理斷開使用者語音連線",
  description: "斷開使用者語音連線",
  category: "MODERATION",
  userPermissions: ["MuteMembers"],
  command: {
    enabled: true,
    usage: "<使用者代號|使用者> [原因]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到：\` ${args[0]} \`。`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await disconnect(message, target, reason);
    await message.safeReply(response);
  },
};
