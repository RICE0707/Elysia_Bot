const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂跳過",
  description: "跳過歌曲",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["next"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = skip(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = skip(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function skip({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);

  // check if current song is playing
  if (!player.queue.current) return "> <a:r2_rice:868583626227478591> 當前沒有正在撥放的歌曲。";

  const { title } = player.queue.current;
  return player.queue.next() ? `> <a:r3_rice:868583679465758820> 已跳過\` ${title} \`。` : "> <a:r2_rice:868583626227478591> 沒有歌曲可以被跳過了。";
}
