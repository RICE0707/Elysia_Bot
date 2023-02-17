const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");
const { MESSAGES, EMBED_COLORS } = require("@root/config");

const BASE_URL = "https://some-random-api.ml/lyrics";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "音樂歌詞",
    description: "尋找歌詞",
    category: "音樂類",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        minArgsCount: 1,
        usage: "<歌曲名稱 - 歌手>",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "查詢",
                type: ApplicationCommandOptionType.String,
                description: "尋找歌詞",
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        const choice = args.join(" ");
        if(!choice) {
            return message.safeReply("> <a:r2_rice:868583626227478591> 這個選擇是無效的。");
        }
        const response = await getLyric(message.author, choice);
        return message.safeReply(response);
    },

    async interactionRun(interaction) {
        const choice = interaction.options.getString("查詢");
        const response = await getLyric(interaction.user, choice);
        await interaction.followUp(response)
    },
};

async function getLyric(user, choice) {
    const lyric = await getJson(`${BASE_URL}?title=${choice}`);
    if(!lyric.success) return MESSAGES.API_ERROR;

    const thumbnail = lyric.data?.thumbnail.genius;
    const author = lyric.data?.author;
    const lyrics = lyric.data?.lyrics;
    const title = lyric.data?.title;

    const embed = new EmbedBuilder();
    embed
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(`${author} - ${title}`)
      .setThumbnail(thumbnail)
      .setDescription(lyrics)
      .setTimestamp()
      .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${author.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

    return { embeds: [embed] };
}
