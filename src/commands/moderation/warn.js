const { warnTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理警告處分",
  description: "警告指定使用者",
  category: "實用類",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    usage: "<使用者代號|使用者> [原因]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者",
        description: "選擇使用者",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "原因",
        description: "輸入原因",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到：\` ${args[0]} \`。`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await warn(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("使用者");
    const reason = interaction.options.getString("原因");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await warn(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function warn(issuer, target, reason) {
  const response = await warnTarget(issuer, target, reason);
  if (typeof response === "boolean") return `> <a:r3_rice:868583679465758820> \` ${target.user.tag} 已被警告 \`。`;
  if (response === "BOT_PERM") return `> <a:r2_rice:868583626227478591> 花瓶沒有權限警告\` ${target.user.tag} \`。`;
  else if (response === "MEMBER_PERM") return `> <a:r2_rice:868583626227478591> 你沒有權限警告\` ${target.user.tag} \`。`;
  else return `> <a:r2_rice:868583626227478591> 花瓶無法警告\` ${target.user.tag} \`。`;
}
