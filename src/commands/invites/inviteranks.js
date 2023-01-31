const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請獎勵身份組資訊",
  description: "顯示此群組的邀請獎勵身份組",
  category: "INVITE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args, data) {
    const response = await getInviteRanks(message, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await getInviteRanks(interaction, data.settings);
    await interaction.followUp(response);
  },
};

async function getInviteRanks({ guild }, settings) {
  if (settings.invite.ranks.length === 0) return "> <a:r2_rice:868583626227478591> 這個群組沒有邀請獎勵身份組。";
  let str = "";

  settings.invite.ranks.forEach((data) => {
    const roleName = guild.roles.cache.get(data._id)?.toString();
    if (roleName) {
      str += `- ${roleName} - 邀請連結被使用\` ${data.invites} \`次後即可獲取。\n`;
    }
  });

  const embed = new EmbedBuilder()
    .setAuthor({ name: "本群的邀請獎勵身份組", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setDescription(str);
  return { embeds: [embed] };
}
