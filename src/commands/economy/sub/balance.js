const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (user) => {
  const economy = await getUser(user);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `${user.username} 的餘額為`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' })
    .addFields(
      {
        name: "錢包（非現實貨幣）",
        value: `\` ${economy?.coins || 0}${ECONOMY.CURRENCY} \``,
        inline: true,
      },
      {
        name: "銀行（非現實貨幣）",
        value: `\` ${economy?.bank || 0}${ECONOMY.CURRENCY} \``,
        inline: true,
      },
      {
        name: "總資產（非現實貨幣）",
        value: `\` ${(economy?.coins || 0) + (economy?.bank || 0)}${ECONOMY.CURRENCY} \``,
        inline: true,
      }
    );
 
  return { embeds: [embed] };
};
