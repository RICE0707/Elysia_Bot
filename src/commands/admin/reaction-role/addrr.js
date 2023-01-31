const { addReactionRole, getReactionRoles } = require("@schemas/ReactionRoles");
const { parseEmoji, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理表符身份組",
  description: "設置指定訊息的自動身份組",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<頻道> <訊息代碼> <表情符號> <身份組>",
    minArgsCount: 4,
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
        description: "選擇要放入表情符號的訊息",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "表情符號",
        description: "選擇一個表情符號來讓使用者可點擊",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "身份組",
        description: "點擊表情符號後會獲取的身份組",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`> <a:r2_rice:868583626227478591> \` ${args[0]} \`頻道不存在。`);

    const targetMessage = args[1];

    const role = message.guild.findMatchingRoles(args[3])[0];
    if (!role) return message.safeReply(`> <a:r2_rice:868583626227478591> \` ${args[3]} \`身份組不存在。`);

    const reaction = args[2];

    const response = await addRR(message.guild, targetChannel[0], targetMessage, reaction, role);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("頻道");
    const messageId = interaction.options.getString("訊息代碼");
    const reaction = interaction.options.getString("表情符號");
    const role = interaction.options.getRole("身份組");

    const response = await addRR(interaction.guild, targetChannel, messageId, reaction, role);
    await interaction.followUp(response);
  },
};

async function addRR(guild, channel, messageId, reaction, role) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `> <a:r2_rice:868583626227478591> 你缺少以下權限：${channel.toString()}\n${parsePermissions(channelPerms)}。`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return "> <a:r2_rice:868583626227478591> 無法獲取訊息，你是否有正確輸入訊息代碼？";
  }

  if (role.managed) {
    return "> <a:r2_rice:868583626227478591> 此身份組無法被設置，它只能由Discord系統分配。";
  }

  if (guild.roles.everyone.id === role.id) {
    return "> <a:r2_rice:868583626227478591> 此身份組無法被設置，因為這是everyone身份組。";
  }

  if (guild.members.me.roles.highest.position < role.position) {
    return "> <a:r2_rice:868583626227478591> 此身份組無法被設置，因為此身份組的位置比花瓶高。";
  }

  const custom = parseEmoji(reaction);
  if (custom.id && !guild.emojis.cache.has(custom.id)) return "> <a:r2_rice:868583626227478591> 這個表情符號不屬於本伺服器。";
  const emoji = custom.id ? custom.id : custom.name;

  try {
    await targetMessage.react(emoji);
  } catch (ex) {
    return `> <a:r2_rice:868583626227478591> \` ${reaction} \`表情符號還存在嗎？`;
  }

  let reply = "";
  const previousRoles = getReactionRoles(guild.id, channel.id, targetMessage.id);
  if (previousRoles.length > 0) {
    const found = previousRoles.find((rr) => rr.emote === emoji);
    if (found) reply = "> <a:r3_rice:868583679465758820> 已為此表情符號設置身份組，並覆蓋了數據，\n。";
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id);
  return (reply += "> <a:r3_rice:868583679465758820> 你已成功設置，數據已保存。");
}
