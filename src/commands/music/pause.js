const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂暫停",
  description: "暫停音樂播放",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = pause(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = pause(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function pause({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  if (player.paused) return "> <a:r2_rice:868583626227478591> 音樂已暫停撥放。";

  player.pause(true);
  return "> <a:r2_rice:868583626227478591> 暫停已音樂播放。";
}
