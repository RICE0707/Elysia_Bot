const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用寶可夢",
  description: "查看寶可夢資訊",
  category: "其他實用類",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<寶可夢>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "寶可夢",
        description: "輸入寶可夢名稱（英文）",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const pokemon = args.join(" ");
    const response = await pokedex(pokemon);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const pokemon = interaction.options.getString("寶可夢");
    const response = await pokedex(pokemon);
    await interaction.followUp(response);
  },
};

async function pokedex(pokemon) {
  const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
  if (response.status === 404) return "```花瓶找不到這隻寶可夢```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data[0];

  const embed = new EmbedBuilder()
    .setTitle(`來自國外網站的寶可夢資訊 - ${json.name}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.sprite)
    .setDescription(
      stripIndent`
            ♢ **代號**：${json.number}
            ♢ **名稱**：${json.name}
            ♢ **物種**：${json.species}
            ♢ **類型**：${json.types}
            ♢ **顯性能力**：${json.abilities.normal}
            ♢ **隱性能力**：${json.abilities.hidden}
            ♢ **Egg group(s)**：${json.eggGroups}
            ♢ **性別**：${json.gender}
            ♢ **身高**：${json.height} 英尺
            ♢ **體重**：${json.weight}
            ♢ **目前進化階段**：${json.family.evolutionStage}
            ♢ **全部的菁樺階段**：${json.family.evolutionLine}
            ♢ **是新手寶可夢？**：${json.starter}
            ♢ **是傳說寶可夢？**：${json.legendary}
            ♢ **是神話寶可夢？**：${json.mythical}
            ♢ **是一代寶可夢？**：${json.gen}
            `
    )
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0 - 取自於 pokeapi.glitch.me', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
