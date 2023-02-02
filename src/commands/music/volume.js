const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂聲量",
  description: "設置聲量",
  category: "音樂類",
  validations: musicValidations,
  command: {
    enabled: true,
    usage: "<1-100>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "聲量",
        description: "輸入數字 [0 ~ 100]",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const amount = args[0];
    const response = await volume(message, amount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getInteger("聲量");
    const response = await volume(interaction, amount);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function volume({ client, guildId }, volume) {
  const player = client.musicManager.getPlayer(guildId);

  if (!volume) return `> <a:r3_rice:868583679465758820> 已設置聲量為\` ${player.volume} \`。`;
  if (volume < 1 || volume > 100) return "> <a:r2_rice:868583626227478591> 你需要輸入 1 ~ 100 之間的數值。";

  await player.setVolume(volume);
  return `> <a:r3_rice:868583679465758820> 已設置聲量為\` ${volume} \`。`;
}
