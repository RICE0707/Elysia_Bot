const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { postToBin } = require("@helpers/HttpUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用貼上",
  description: "在 sourceb.in 中貼上文字內容。",
  cooldown: 5,
  category: "其他實用類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 2,
    usage: "<標題> <文字內容>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "標題",
        description: "輸入標題",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "文字內容",
        description: "輸入文字內容",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const title = args.shift();
    const content = args.join(" ");
    const response = await paste(content, title);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const title = interaction.options.getString("標題");
    const content = interaction.options.getString("文字內容");
    const response = await paste(content, title);
    await interaction.followUp(response);
  },
};

async function paste(content, title) {
  const response = await postToBin(content, title);
  if (!response) return "> <a:r2_rice:868583626227478591> 花瓶碎了....";

  const embed = new EmbedBuilder()
    .setAuthor({ name: "你已成功貼上文字內容至外部網站" })
    .setDescription(`🔸 原始網址：${response.url}\n🔹 純文字網址：${response.raw}`)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0 - 取自於 sourceb.in', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
