const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請連結查看",
  description: "查看本群的邀請連結",
  category: "INVITE",
  botPermissions: ["EmbedLinks", "ManageGuild"],
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

  async messageRun(message, args) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInviteCodes(message, target.user);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("使用者") || interaction.user;
    const response = await getInviteCodes(interaction, user);
    await interaction.followUp(response);
  },
};

async function getInviteCodes({ guild }, user) {
  const invites = await guild.invites.fetch({ cache: false });
  const reqInvites = invites.filter((inv) => inv.inviter.id === user.id);
  if (reqInvites.size === 0) return `> <a:r2_rice:868583626227478591> \` ${user.tag} \`在本群沒有創建邀請連結。`;

  let str = "";
  reqInvites.forEach((inv) => {
    str += `- [${inv.code}](${inv.url}) - 已被使用\` ${inv.uses} \`次\n`;
  });

  const embed = new EmbedBuilder()
    .setAuthor({ name: `${user.username} 的邀請連結`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot'  })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' }) 
    .setDescription(str);

  return { embeds: [embed] };
}
