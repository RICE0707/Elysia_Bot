const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂播放清單隨機化",
  description: "隨機化播放清單順序",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = shuffle(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = shuffle(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function shuffle({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  player.queue.shuffle();
  return "> <a:r3_rice:868583679465758820> 播放清單已隨機化。";
}
