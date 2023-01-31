const { cacheGuildInvites, resetInviteCache } = require("@handlers/invite");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請統計設置",
  description: "是否開啟本群的邀請統計",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    aliases: ["invitetracking"],
    usage: "<ON|OFF>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "是否啟用",
        description: "是否啟用",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "是",
            value: "是",
          },
          {
            name: "否",
            value: "否",
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const status = args[0].toLowerCase();
    if (!["是", "否"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
    const response = await setStatus(message, status, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const status = interaction.options.getString("是否啟用");
    const response = await setStatus(interaction, status, data.settings);
    await interaction.followUp(response);
  },
};

async function setStatus({ guild }, input, settings) {
  const status = input.toUpperCase() === "是" ? true : false;

  if (status) {
    if (!guild.members.me.permissions.has(["ManageGuild", "ManageChannels"])) {
      return "> <a:r2_rice:868583626227478591> 花瓶缺少了` 管理頻道 `與` 管理伺服器 `的權限。";
    }

    const channelMissing = guild.channels.cache
      .filter((ch) => ch.type === ChannelType.GuildText && !ch.permissionsFor(guild.members.me).has("ManageChannels"))
      .map((ch) => ch.name);

    if (channelMissing.length > 1) {
      return `> <a:r2_rice:868583626227478591> 花瓶在已下頻道缺少了\` 管理頻道 \`的權限。\`\`\`${channelMissing.join(
        "︱"
      )}\`\`\``;
    }

    await cacheGuildInvites(guild);
  } else {
    resetInviteCache(guild.id);
  }

  settings.invite.tracking = status;
  await settings.save();

  return `> <a:r3_rice:868583679465758820> 邀請統計功能已\` ${status ? "開啟" : "關閉"} \`。`;
}
