const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = (member) => {
  let color = member.displayHexColor;
  if (color === "#d3d7da") color = EMBED_COLORS.BOT_EMBED;

  let rolesString = member.roles.cache.map((r) => r.name).join("︱");
  if (rolesString.length > 1024) rolesString = rolesString.substring(0, 1020) + "...等";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${member.displayName} 的使用者資訊`,
      iconURL: member.user.displayAvatarURL(),
    })
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .addFields(
      {
        name: "使用者名稱",
        value: member.user.tag,
        inline: true,
      },
      {
        name: "使用者代號",
        value: member.id,
        inline: true,
      },
      {
        name: "加入群組時間",
        value: `<t:${parseInt(member.joinedAt / 1000)}:f>`,
      },
      {
        name: "建立帳號時間",
        value: `<t:${parseInt(member.user.createdAt / 1000)}:f>`,
      },
      {
        name: `擁有的身份組︱共 ${member.roles.cache.size} 個`,
        value: rolesString,
      },
      {
        name: "使用者頭像網址",
        value: member.user.displayAvatarURL({ extension: "png" }),
      }
    )
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${member.user.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
