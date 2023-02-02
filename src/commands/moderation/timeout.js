const { timeoutTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");
const ems = require("enhanced-ms");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理禁言",
  description: "禁言指定使用者",
  category: "實用類",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["mute"],
    usage: "<使用者代號︱使用者> <時長> [原因]",
    minArgsCount: 2,
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
        name: "時長",
        description: "輸入時間",
        type: ApplicationCommandOptionType.String,
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

    // parse time
    const ms = ems(args[1]);
    if (!ms) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入正確的時間，例如；\` 1d/1h/1m/1s \`。");

    const reason = args.slice(2).join(" ").trim();
    const response = await timeout(message.member, target, ms, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("使用者");

    // parse time
    const duration = interaction.options.getString("時長");
    const ms = ems(duration);
    if (!ms) return interaction.followUp("> <a:r2_rice:868583626227478591> 請輸入正確的時間，例如；\` 1d/1h/1m/1s \`。");

    const reason = interaction.options.getString("原因");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await timeout(interaction.member, target, ms, reason);
    await interaction.followUp(response);
  },
};

async function timeout(issuer, target, ms, reason) {
  if (isNaN(ms)) return "> <a:r2_rice:868583626227478591> 請輸入正確的時間，例如；\` 1d/1h/1m/1s \`。";
  const response = await timeoutTarget(issuer, target, ms, reason);
  if (typeof response === "boolean") return `> <a:r3_rice:868583679465758820> \` ${target.user.tag} 已被禁言 \`。`;
  if (response === "BOT_PERM") return `> <a:r2_rice:868583626227478591> 花瓶沒有權限禁言\` ${target.user.tag} \`。`;
  else if (response === "MEMBER_PERM") return `> <a:r2_rice:868583626227478591> 你沒有權限禁言\` ${target.user.tag} \`。`;
  else if (response === "ALREADY_TIMEOUT") return `> <a:r3_rice:868583679465758820> \` ${target.user.tag} 已被禁言 \`。`;
  else return `> <a:r2_rice:868583626227478591> 花瓶無法禁言\` ${target.user.tag} \`。`;
}
