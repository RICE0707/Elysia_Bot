const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (user, coins) => {
  if (isNaN(coins) || coins <= 0) return "> <a:r2_rice:868583626227478591> 請輸入有效的數字才能存錢喔（非現實貨幣）。";
  const userDb = await getUser(user);

  if (coins > userDb.coins) return `> <a:r2_rice:868583626227478591> 你的錢包裡只有\` ${userDb.coins}${ECONOMY.CURRENCY} \`呢（非現實貨幣）。`;

  userDb.coins -= coins;
  userDb.bank += coins;
  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "已成功存款，目前餘額為", iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' })
    .addFields(
      {
        name: "錢包（非現實貨幣）",
        value: `\` ${userDb.coins}${ECONOMY.CURRENCY} \``,
        inline: true,
      },
      {
        name: "銀行（非現實貨幣）",
        value: `\` ${userDb.bank}${ECONOMY.CURRENCY} \``,
        inline: true,
      },
      {
        name: "總資產（非現實貨幣）",
        value: `\` ${userDb.coins + userDb.bank}${ECONOMY.CURRENCY} \``,
        inline: true,
      }
    );
 
  return { embeds: [embed] };
};
