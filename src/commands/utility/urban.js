const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const moment = require("moment");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用字典",
  description: "你看不懂的詞，花瓶能看懂uwu",
  cooldown: 5,
  category: "其他實用類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<詞彙>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "詞彙",
        description: "輸入詞彙",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const word = args.join(" ");
    const response = await urban(word);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const word = interaction.options.getString("詞彙");
    const response = await urban(word);
    await interaction.followUp(response);
  },
};

async function urban(word) {
  const response = await getJson(`http://api.urbandictionary.com/v0/define?term=${word}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  if (!json.list[0]) return `> <a:r2_rice:868583626227478591> 花瓶的大腦裡沒有這個詞彙：\` ${word} \`。`;

  const data = json.list[0];
  const embed = new EmbedBuilder()
    .setTitle(data.word)
    .setURL(data.permalink)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`**詞彙定義：**\`\`\`css\n${data.definition}\`\`\``)
    .addFields(
      {
        name: "作者",
        value: data.author,
        inline: true,
      },
      {
        name: "代碼",
        value: data.defid.toString(),
        inline: true,
      },
      {
        name: "讚踩數",
        value: `👍 ${data.thumbs_up} | 👎 ${data.thumbs_down}`,
        inline: true,
      },
      {
        name: "應用",
        value: data.example,
        inline: false,
      }
    )
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 urbandictionary`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
