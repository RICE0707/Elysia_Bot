const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (self, target, coins) => {
  if (isNaN(coins) || coins <= 0) return "> <a:r2_rice:868583626227478591> 請輸入有效的數字才能轉帳喔（非現實貨幣）。";
  if (target.bot) return "> <a:r2_rice:868583626227478591> 你不能將錢轉給花瓶（非現實貨幣）。";
  if (target.id === self.id) return "> <a:r2_rice:868583626227478591> 你不能將錢轉給自己（非現實貨幣）。";

  const userDb = await getUser(self);

  if (userDb.bank < coins) {
    return `> <a:r2_rice:868583626227478591> 你的銀行餘額不足，你只有\` ${userDb.bank}${ECONOMY.CURRENCY} \`（非現實貨幣）。${
      userDb.coins > 0 && "\n> <a:r2_rice:868583626227478591> 你必須先把錢存入銀行後才能轉帳（非現實貨幣）。"
    } `;
  }

  const targetDb = await getUser(target);

  userDb.bank -= coins;
  targetDb.bank += coins;

  await userDb.save();
  await targetDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "已成功轉帳，目前餘額", iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setDescription(`> <a:r3_rice:868583679465758820> 你已成功將\` ${coins}${ECONOMY.CURRENCY} \`轉帳給\` ${target.tag} \`（非現實貨幣）。`)
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' })
    .setTimestamp(Date.now());
    

  return { embeds: [embed] };
};
