const { removeReactionRole } = require("@schemas/ReactionRoles");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理刪除表符身份組",
  description: "刪除指定訊息的表符身份組",
  category: "管理類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<頻道> <訊息代碼>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "頻道",
        description: "選擇頻道來讓花瓶知道訊息在哪",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "訊息代碼",
        description: "選擇要移除的訊息",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`> <a:r2_rice:868583626227478591> \` ${args[0]} \`頻道不存在。`);

    const targetMessage = args[1];
    const response = await removeRR(message.guild, targetChannel[0], targetMessage);

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("頻道");
    const messageId = interaction.options.getString("訊息代碼");

    const response = await removeRR(interaction.guild, targetChannel, messageId);
    await interaction.followUp(response);
  },
};

async function removeRR(guild, channel, messageId) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `> <a:r2_rice:868583626227478591> 你缺少以下權限：\` ${channel.toString()} \`\n\` ${parsePermissions(channelPerms)} \`。`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return "> <a:r2_rice:868583626227478591> 無法獲取訊息，你是否有正確輸入訊息代碼？";
  }

  try {
    await removeReactionRole(guild.id, channel.id, targetMessage.id);
    await targetMessage.reactions?.removeAll();
  } catch (ex) {
    return "> <a:r2_rice:868583626227478591> 喔不，發生了讓花瓶碎掉的問題，請重新設置。";
  }

  return "> <a:r3_rice:868583679465758820> 設置已保存。";
}
