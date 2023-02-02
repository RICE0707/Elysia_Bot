const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

const choices = ["hug", "kiss", "cuddle", "feed", "pat", "poke", "slap", "smug", "tickle", "wink"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "宅宅的專屬指令",
  description: "宅宅的專屬指令",
  enabled: true,
  category: "阿宅類",
  cooldown: 5,
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "[reaction]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "類別",
        description: "選擇類別",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: choices.map((ch) => ({ name: ch, value: ch })),
      },
    ],
  },

  async messageRun(message, args) {
    const category = args[0].toLowerCase();
    if (!choices.includes(category)) {
      return message.safeReply(`> <a:r2_rice:868583626227478591> 無效的類別：\` ${category} \`.\n> <a:r2_rice:868583626227478591> 可選類別為：\` ${choices.join(" | ")} \`。`);
    }

    const embed = await genReaction(category, message.author);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("類別");
    const embed = await genReaction(choice, interaction.user);
    await interaction.followUp({ embeds: [embed] });
  },
};

const genReaction = async (category, user) => {
  try {
    let imageUrl;

    // some-random api
    if (category === "wink") {
      const response = await getJson("https://some-random-api.ml/animu/wink");
      if (!response.success) throw new Error("API error");
      imageUrl = response.data.link;
    }

    // neko api
    else {
      imageUrl = (await neko[category]()).url;
    }

    return new EmbedBuilder()
      .setImage(imageUrl)
      .setColor("Random")
      .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 some-random-api` });
  } catch (ex) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("花瓶無法獲取圖片。請再嘗試一次！")
      .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 some-random-api` });
  }
};
