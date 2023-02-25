const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { randomUUID } = require("crypto");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味動漫繪圖",
  description: "奴役 AI 的第一步。",
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
	let response = await fetch("https://api-inference.huggingface.co/models/andite/anything-v4.0", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`
        },
        body: JSON.stringify({
          inputs: `${prompt} (${Math.floor(Math.random() * 1919810)}:0)`
      })
    });
	
	if (response.status == 200) {
	  const type = response.headers.get('x-compute-type') == 'cache' ? '快取' : 'GPU 運算';
	  
	  const attachment = new AttachmentBuilder(response.body, { name: 'result.png' });
	  
	  const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setTitle(`${user.username} 透過花瓶AI生成的圖片：`)
		.setImage(`attachment://${attachment.name}`)
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 Huggingface（${type}）`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

      return { embeds: [embed], files: [attachment] };
	} else if (response.status == 503) {
	  const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle("花瓶需要一點時間載入資料！（預計需要 20 秒）")
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 Huggingface`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

      return { embeds: [embed] };
	} else if (response.status == 429) {
	  const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle("花瓶需要休息一下！（請求太多，等一段時間後再試吧）")
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 Huggingface`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

      return { embeds: [embed] };
	} else {
	  const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle("花瓶遇到了一些未知的錯誤！")
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 Huggingface`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

      return { embeds: [embed] };
	}
}