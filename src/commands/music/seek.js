const { musicValidations } = require("@helpers/BotUtils");
const prettyMs = require("pretty-ms");
const { durationToMillis } = require("@helpers/Utils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂播放條",
  description: "將播放條的位置跳轉至指定位置",
  category: "音樂類",
  validations: musicValidations,
  command: {
    enabled: true,
    usage: "<時間>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "時間",
        description: "輸入時間",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const time = args.join(" ");
    const response = seekTo(message, time);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const time = interaction.options.getString("時間");
    const response = seekTo(interaction, time);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} time
 */
function seekTo({ client, guildId }, time) {
  const player = client.musicManager?.getPlayer(guildId);
  const seekTo = durationToMillis(time);

  if (seekTo > player.queue.current.length) {
    return "> <a:r2_rice:868583626227478591> 你提供的時長超過當前曲目的時長。";
  }

  player.seek(seekTo);
  return `> <a:r3_rice:868583679465758820> 花瓶已將歌曲時間跳轉至\` ${prettyMs(seekTo, { colonNotation: true, secondsDecimalDigits: 0 })} \`。`;
}
