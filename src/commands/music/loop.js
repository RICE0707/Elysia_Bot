const { musicValidations } = require("@helpers/BotUtils");
const { LoopType } = require("@lavaclient/queue");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂循環",
  description: "循環播放歌曲或播放清單",
  category: "音樂類",
  validations: musicValidations,
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<播放清單循環︱單曲循環>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "類型",
        type: ApplicationCommandOptionType.String,
        description: "選擇類型",
        required: false,
        choices: [
          {
            name: "播放清單循環",
            value: "播放清單循環",
          },
          {
            name: "單曲循環",
            value: "單曲循環",
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const input = args[0].toLowerCase();
    const type = input === "播放清單循環" ? "播放清單循環" : "單曲循環";
    const response = toggleLoop(message, type);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString("類型") || "單曲循環";
    const response = toggleLoop(interaction, type);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {"queue"|"track"} type
 */
function toggleLoop({ client, guildId }, type) {
  const player = client.musicManager.getPlayer(guildId);

  // track
  if (type === "單曲循環") {
    player.queue.setLoop(LoopType.Song);
    return "> <a:r3_rice:868583679465758820> 花瓶已切換為` 單曲循環 `模式。";
  }

  // queue
  else if (type === "播放清單循環") {
    player.queue.setLoop(1);
    return "> <a:r3_rice:868583679465758820> 花瓶已切換為` 播放清單循環 `模式。";
  }
}
