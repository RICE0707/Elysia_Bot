const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂恢復",
  description: "恢復音樂播放",
  category: "音樂類",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = resumePlayer(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = resumePlayer(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function resumePlayer({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  if (!player.paused) return "> <a:r3_rice:868583679465758820> 音樂已開始撥放，";
  player.resume();
  return "> <a:r3_rice:868583679465758820> 音樂已開始撥放。";
}
