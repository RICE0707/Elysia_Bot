const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂播放清單",
  description: "顯示當前音樂播放清單",
  category: "音樂類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[頁數]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "頁數",
        description: "輸入數字",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const page = args.length && Number(args[0]) ? Number(args[0]) : 1;
    const response = getQueue(message, page);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const page = interaction.options.getInteger("頁數");
    const response = getQueue(interaction, page);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} pgNo
 */
function getQueue({ client, guild }, pgNo) {
  const player = client.musicManager.getPlayer(guild.id);
  if (!player) return "> <a:r2_rice:868583626227478591> 這個群組目前沒有撥放音樂。";

  const queue = player.queue;
  const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setAuthor({ name: `${guild.name} 的播放清單。` });

  // change for the amount of tracks per page
  const multiple = 10;
  const page = pgNo || 1;

  const end = page * multiple;
  const start = end - multiple;

  const tracks = queue.tracks.slice(start, end);

  if (queue.current) embed.addFields({ name: "當前撥放中...", value: `[${queue.current.title}](${queue.current.uri})` });
  if (!tracks.length) embed.setDescription(`沒有曲目 ${page > 1 ? `頁數 ${page}` : "於隊列中"}.`);
  else embed.setDescription(tracks.map((track, i) => `${start + ++i} - [${track.title}](${track.uri})`).join("\n"));

  const maxPages = Math.ceil(queue.tracks.length / multiple);

  embed.setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 頁數 ${page > maxPages ? maxPages : page} / ${maxPages}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
