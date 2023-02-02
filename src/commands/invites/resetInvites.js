const { getMember } = require("@schemas/Member");
const { ApplicationCommandOptionType } = require("discord.js");
const { checkInviteRewards } = require("@handlers/invite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請次數清除",
  description: "清除向使用者的邀請次數",
  category: "邀請類",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<使用者>",
    aliases: ["clearinvites"],
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者",
        description: "輸入使用者",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
    const response = await clearInvites(message, target.user);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("使用者");
    const response = await clearInvites(interaction, user);
    await interaction.followUp(response);
  },
};

async function clearInvites({ guild }, user) {
  const memberDb = await getMember(guild.id, user.id);
  memberDb.invite_data.added = 0;
  await memberDb.save();
  checkInviteRewards(guild, memberDb, false);
  return `> <a:r3_rice:868583679465758820> 已清除\` ${user.tag} \`的邀請次數。`;
}
