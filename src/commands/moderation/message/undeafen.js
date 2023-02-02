const undeafen = require("../shared/undeafen");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理解除指定使用者拒聽",
  description: "解除指定使用者拒聽",
  category: "實用類",
  userPermissions: ["DeafenMembers"],
  botPermissions: ["DeafenMembers"],
  command: {
    enabled: true,
    usage: "<使用者代號|使用者> [原因]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到：\` ${args[0]} \`。`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await undeafen(message, target, reason);
    await message.safeReply(response);
  },
};
