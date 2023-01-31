const { parseEmoji, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (emoji) => {
  let custom = parseEmoji(emoji);
  if (!custom.id) return "This is not a valid guild emoji";

  let url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif?v=1" : "png"}`;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "表情符號資訊" })
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setDescription(
      `**代號：**${custom.id}\n` + `**名稱：**${custom.name}\n` + `**動態？**${custom.animated ? "是" : "否"}`
    )
    .setImage(url);

  return { embeds: [embed] };
};