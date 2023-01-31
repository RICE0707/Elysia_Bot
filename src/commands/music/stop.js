const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂停止",
  description: "停止播放音樂",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["leave"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await stop(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await stop(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function stop({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  player.disconnect();
  await client.musicManager.destroyPlayer(guildId);
  return "> <a:r3_rice:868583679465758820> 已停止撥放，播放清單也已清除。";
}
