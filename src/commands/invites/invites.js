const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請次數",
  description: "顯示本群組的邀請次數",
  category: "INVITE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[使用者|使用者代號]",
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

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInvites(message, target.user, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("使用者") || interaction.user;
    const response = await getInvites(interaction, user, data.settings);
    await interaction.followUp(response);
  },
};

async function getInvites({ guild }, user, settings) {
  if (!settings.invite.tracking) return `> <a:r2_rice:868583626227478591> 這個群組沒有開啟邀請統計。`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `${user.username} 的邀請統計`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot'  })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setDescription(`${user.toString()} 的邀請連結已使用\` ${getEffectiveInvites(inviteData)} \`次`)
    .addFields(
      {
        name: "總邀請次數",
        value: `**${inviteData?.tracked + inviteData?.added || 0}**`,
        inline: true,
      },
      {
        name: "假邀請次數",
        value: `**${inviteData?.fake || 0}**`,
        inline: true,
      },
    );

  return { embeds: [embed] };
}
