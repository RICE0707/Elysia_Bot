const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { randomUUID } = require("crypto");

let api;

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味繪圖",
  description: "你用什麼軟體畫圖？Discord！",
  cooldown: 10,
  category: "趣味類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<提示詞>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "提示詞",
        description: "輸入要 AI 繪製的提示詞",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const content = args[0];
    if (!content.length) {
      return message.safeReply(`> <a:r2_rice:868583626227478591> 請輸入提示詞。`);
    }
    const response = await getContent(content, message.author);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const content = interaction.options.getString("提示詞");
    const response = await getContent(content, interaction.user);
    await interaction.followUp(response);
  },
};

async function getContent(prompt, user) {
	const { default: midjourney } = await import('midjourney-client')
	
	let response = await midjourney(`mdjrny-v4 style ${prompt}`);
	
	if (response.length > 0) {
	  const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setTitle(`${user.username} 透過花瓶AI生成的圖片：`)
		.setImage(response[0])
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 Replicate`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

      return { embeds: [embed] };
	} else {
	  const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle("無法完成繪圖，請重新嘗試！")
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 Replicate`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

      return { embeds: [embed] };
	}
}