const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { getRandomInt } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "經濟賭博",
  description: "青少年勿陷網路賭博陷阱花瓶提醒家長慎防",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<金額>",
    minArgsCount: 1,
    aliases: ["slot"],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "金額",
        description: "輸入數字（非現實貨幣）",
        required: true,
        type: ApplicationCommandOptionType.Integer,
      },
    ],
  },

  async messageRun(message, args) {
    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount)) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入有效的數字才能下賭喔。（非現實貨幣）");
    const response = await gamble(message.author, betAmount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const betAmount = interaction.options.getInteger("金額");
    const response = await gamble(interaction.user, betAmount);
    await interaction.followUp(response);
  },
};

function getEmoji() {
  const ran = getRandomInt(9);
  switch (ran) {
    case 1:
      return "\uD83C\uDF52";
    case 2:
      return "\uD83C\uDF4C";
    case 3:
      return "\uD83C\uDF51";
    case 4:
      return "\uD83C\uDF45";
    case 5:
      return "\uD83C\uDF49";
    case 6:
      return "\uD83C\uDF47";
    case 7:
      return "\uD83C\uDF53";
    case 8:
      return "\uD83C\uDF50";
    case 9:
      return "\uD83C\uDF4D";
    default:
      return "\uD83C\uDF52";
  }
}

function calculateReward(amount, var1, var2, var3) {
  if (var1 === var2 && var2.equals === var3) return 3 * amount;
  if (var1 === var2 || var2 === var3 || var1 === var3) return 2 * amount;
  return 0;
}

async function gamble(user, betAmount) {
  if (isNaN(betAmount)) return "> <a:r2_rice:868583626227478591> 請輸入有效的數字才能下賭喔（非現實貨幣）。";
  if (betAmount < 0) return "> <a:r2_rice:868583626227478591> 請輸入大於0的數字才能下賭喔（非現實貨幣）。";
  if (betAmount < 10) return "> <a:r2_rice:868583626227478591> 請輸入大於10的數字才能下賭喔（非現實貨幣），";

  const userDb = await getUser(user);
  if (userDb.coins < betAmount)
    return `> <a:r2_rice:868583626227478591> 你沒有足夠的餘額（非現實貨幣）來下賭呢...\n> **目前餘額：** ${userDb.coins || 0}${ECONOMY.CURRENCY}（非現實貨幣）`;

  const slot1 = getEmoji();
  const slot2 = getEmoji();
  const slot3 = getEmoji();

  const str = `
    **賭博金額（非現實貨幣）：** ${betAmount}${ECONOMY.CURRENCY}
    **賭博倍率：** 雙倍
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ‎‎‎‎║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ║
    ╚══════════╝
    `;

  const reward = calculateReward(betAmount, slot1, slot2, slot3);
  const result = (reward > 0 ? `你贏了：${reward}（非現實貨幣）` : `你輸了：${betAmount}（非現實貨幣）`) + ECONOMY.CURRENCY;
  const balance = reward - betAmount;

  userDb.coins += balance;
  await userDb.save();

  const embed = new EmbedBuilder()
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setThumbnail("https://i.pinimg.com/originals/9a/f1/4e/9af14e0ae92487516894faa9ea2c35dd.gif")
    .setDescription(str)
    .setFooter({ text: `${result}\n來自花瓶星球的科技支援 v3.0 - 你目前擁有：${userDb?.coins}${ECONOMY.CURRENCY}（非現實貨幣）`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg'  });

  return { embeds: [embed] };
}
