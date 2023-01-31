const { getMember } = require("@schemas/Member");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請紀錄同步",
  description: "將舊邀請紀錄同步到使用者上",
  category: "INVITE",
  botPermissions: ["ManageGuild"],
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "[使用者]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者",
        description: "輸入使用者",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0]);
    const response = await importInvites(message, target?.user);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("使用者");
    const response = await importInvites(interaction, user);
    await interaction.followUp(response);
  },
};

async function importInvites({ guild }, user) {
  if (user && user.bot) return "> <a:r2_rice:868583626227478591> 你無法導入花瓶的邀請次數。";

  const invites = await guild.invites.fetch({ cache: false });

  // temporary store for invites
  const tempMap = new Map();

  for (const invite of invites.values()) {
    const inviter = invite.inviter;
    if (!inviter || invite.uses === 0) continue;
    if (!tempMap.has(inviter.id)) tempMap.set(inviter.id, invite.uses);
    else {
      const uses = tempMap.get(inviter.id) + invite.uses;
      tempMap.set(inviter.id, uses);
    }
  }

  for (const [userId, uses] of tempMap.entries()) {
    const memberDb = await getMember(guild.id, userId);
    memberDb.invite_data.added += uses;
    await memberDb.save();
  }

  return `> <a:r3_rice:868583679465758820> 邀請次數已同步給\` ${user ? user.tag : "全部使用者"} \`。`;
}
