const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const API_KEY = process.env.WEATHERSTACK_KEY;

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用天氣",
  description: "查看天氣資訊",
  cooldown: 5,
  category: "其他實用類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<地區>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "地區",
        description: "輸入國家或城市名稱 (建議輸入英文)",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const place = args.join(" ");
    const response = await weather(place);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const place = interaction.options.getString("地區");
    const response = await weather(place);
    await interaction.followUp(response);
  },
};

async function weather(place) {
  const response = await getJson(`http://api.weatherstack.com/current?access_key=${API_KEY}&query=${place}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  if (!json.request) return `> <a:r2_rice:868583626227478591> 花瓶的大腦裡沒有這個國家或城市名稱：\` ${place} \`。`;

  const embed = new EmbedBuilder()
    .setTitle("花瓶天氣播報")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.current?.weather_icons[0])
    .addFields(
      { name: "城市", value: json.location?.name || "無", inline: true },
      { name: "區域", value: json.location?.region || "無", inline: true },
      { name: "國家", value: json.location?.country || "無", inline: true },
      { name: "天氣", value: json.current?.weather_descriptions[0] || "無", inline: true },
      { name: "日期", value: json.location?.localtime.slice(0, 10) || "無", inline: true },
      { name: "時間", value: json.location?.localtime.slice(11, 16) || "無", inline: true },
      { name: "溫度", value: `${json.current?.temperature}°C`, inline: true },
      { name: "雲層密度", value: `${json.current?.cloudcover}%`, inline: true },
      { name: "風速", value: `${json.current?.wind_speed} km/h`, inline: true },
      { name: "風向", value: json.current?.wind_dir || "無", inline: true },
      { name: "氣壓", value: `${json.current?.pressure} mb`, inline: true },
      { name: "降雨量", value: `${json.current?.precip.toString()} mm`, inline: true },
      { name: "濕度", value: json.current?.humidity.toString() || "無", inline: true },
      { name: "能見度", value: `${json.current?.visibility} km`, inline: true },
      { name: "紫外線指數", value: json.current?.uv_index.toString() || "無", inline: true }
    )
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0 - 取自於 weatherstack', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
