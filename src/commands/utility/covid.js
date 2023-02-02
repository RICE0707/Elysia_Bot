const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const timestampToDate = require("timestamp-to-date");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用新冠疫情",
  description: "取得一個國家的新冠統計數據",
  cooldown: 5,
  category: "其他實用類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<country>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "國家",
        description: "輸入要查詢的國家 (英文)",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const country = args.join(" ");
    const response = await getCovid(country);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const country = interaction.options.getString("國家");
    const response = await getCovid(country);
    await interaction.followUp(response);
  },
};

async function getCovid(country) {
  const response = await getJson(`https://disease.sh/v2/countries/${country}`);

  if (response.status === 404) return "```css\n這個國家不存在。```";
  if (!response.success) return MESSAGES.API_ERROR;
  const { data } = response;

  const mg = timestampToDate(data?.updated, "HH:mm");
  const embed = new EmbedBuilder()
    .setTitle(`新冠統計 - ${data?.country}`)
    .setThumbnail(data?.countryInfo.flag)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "累計確診",
        value: data?.cases.toString(),
        inline: true,
      },
      {
        name: "新增病例",
        value: data?.todayCases.toString(),
        inline: true,
      },
      {
        name: "累計死亡",
        value: data?.deaths.toString(),
        inline: true,
      },
      {
        name: "新增死亡",
        value: data?.todayDeaths.toString(),
        inline: true,
      },
      {
        name: "累計確診",
        value: data?.recovered.toString(),
        inline: true,
      },
      {
        name: "目前確診",
        value: data?.active.toString(),
        inline: true,
      },
      {
        name: "嚴重確診",
        value: data?.critical.toString(),
        inline: true,
      },
      {
        name: "每一百萬人中平均有多少人確診",
        value: data?.casesPerOneMillion.toString(),
        inline: true,
      },
      {
        name: "每一百萬人中平均有多少人死亡",
        value: data?.deathsPerOneMillion.toString(),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 disease.sh - 最後更新於 ${mg}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
