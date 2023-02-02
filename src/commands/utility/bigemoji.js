const { parseEmoji, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { parse } = require("twemoji-parser");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用表情符號",
  description: "只有圖片，沒有其他資訊的表情符號",
  category: "其他實用類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<表情符號>",
    aliases: ["enlarge"],
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "表情符號",
        description: "輸入表情符號",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const emoji = args[0];
    const response = getEmoji(message.author, emoji);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const emoji = interaction.options.getString("表情符號");
    const response = getEmoji(interaction.user, emoji);
    await interaction.followUp(response);
  },
};

function getEmoji(user, emoji) {
  const custom = parseEmoji(emoji);

  const embed = new EmbedBuilder()
    .setAuthor({ name: "你就是個偷窺狂吧！", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${user.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  if (custom.id) {
    embed.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`);
    return { embeds: [embed] };
  }
  const parsed = parse(emoji, { assetType: "png" });
  if (!parsed[0]) return "> <a:r2_rice:868583626227478591> 這不是表情符號。";

  embed.setImage(parsed[0].url);
  return { embeds: [embed] };
}
