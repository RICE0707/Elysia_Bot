const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (user, coins) => {
  if (isNaN(coins) || coins <= 0) return "> <a:r2_rice:868583626227478591> 請輸入有效的數字才能提款喔（非現實貨幣）。";
  const userDb = await getUser(user);

  if (coins > userDb.bank) return `> <a:r2_rice:868583626227478591> 你的錢包裡只有\` ${userDb.bank}${ECONOMY.CURRENCY} \`呢（非現實貨幣）。`;

  userDb.bank -= coins;
  userDb.coins += coins;
  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "已成功提款，目前餘額為", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .addFields(
      {
        name: "錢包",
        value: `\` ${userDb.coins}${ECONOMY.CURRENCY} \``,
        inline: true,
      },
      {
        name: "銀行",
        value: `\` ${userDb.bank}${ECONOMY.CURRENCY} \``,
        inline: true,
      },
      {
        name: "總資產",
        value: `\` ${userDb.coins + userDb.bank}${ECONOMY.CURRENCY} \``,
        inline: true,
      }
    );
 
  return { embeds: [embed] };
};
