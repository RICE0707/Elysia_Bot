const { ChannelType } = require("discord.js");
const move = require("../shared/move");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理移動語音使用者",
  description: "移動語音使用者",
  category: "實用類",
  userPermissions: ["DeafenMembers"],
  botPermissions: ["DeafenMembers"],
  command: {
    enabled: true,
    usage: "<使用者代號︱使用者> <頻道> [原因]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到：\` ${args[0]} \`。`);

    const channels = message.guild.findMatchingChannels(args[1]);
    if (!channels.length) return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶找不到語音頻道。");
    const targetChannel = channels.pop();
    if (!targetChannel.type === ChannelType.GuildVoice && !targetChannel.type === ChannelType.GuildStageVoice) {
      return message.safeReply("> <a:r2_rice:868583626227478591> 這個頻道不是語音頻道。");
    }

    const reason = args.slice(2).join(" ");
    const response = await move(message, target, reason, targetChannel);
    await message.safeReply(response);
  },
};
