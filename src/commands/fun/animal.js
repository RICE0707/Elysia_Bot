const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];
const BASE_URL = "https://some-random-api.ml/animal";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味動物圖片",
  description: "生成動物圖片",
  cooldown: 5,
  category: "趣味類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<種類>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "種類",
        description: "選擇種類",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: animals.map((animal) => ({ name: animal, value: animal })),
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args[0];
    if (!animals.includes(choice)) {
      return message.safeReply(`> <a:r2_rice:868583626227478591> 無效的動物種類，目前只支援這些種類：\n\` ${animals.join("︱")} \`。`);
    }
    const response = await getAnimal(message.author, choice);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("種類");
    const response = await getAnimal(interaction.user, choice);
    await interaction.followUp(response);
  },
};

async function getAnimal(user, choice) {
  const response = await getJson(`${BASE_URL}/${choice}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const imageUrl = response.data?.image;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setImage(imageUrl)
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 some-random-api`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
