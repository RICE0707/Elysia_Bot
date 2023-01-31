const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

const levels = {
  none: 0.0,
  low: 0.1,
  medium: 0.15,
  high: 0.25,
};

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂低頻增強",
  description: "設置低頻增強級別",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<無|弱|中|高>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "級別",
        description: "設置低頻增強級別",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "無",
            value: "無",
          },
          {
            name: "弱",
            value: "弱",
          },
          {
            name: "中",
            value: "中",
          },
          {
            name: "高",
            value: "高",
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    let level = "無";
    if (args.length && args[0].toLowerCase() in levels) level = args[0].toLowerCase();
    const response = setBassBoost(message, level);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    let level = interaction.options.getString("級別");
    const response = setBassBoost(interaction, level);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} level
 */
function setBassBoost({ client, guildId }, level) {
  const player = client.musicManager.getPlayer(guildId);
  const bands = new Array(3).fill(null).map((_, i) => ({ band: i, gain: levels[level] }));
  player.setEqualizer(...bands);
  return `> <a:r3_rice:868583679465758820> 已設置低頻增強級別為\` ${level} \`。`;
}
