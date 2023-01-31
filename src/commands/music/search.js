const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");
const prettyMs = require("pretty-ms");
const { EMBED_COLORS, MUSIC } = require("@root/config");

const search_prefix = {
  YT: "ytsearch",
  YTM: "ytmsearch",
  SC: "scsearch",
};

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "音樂搜尋",
  description: "在 youtube 上搜索匹配的歌曲",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<歌曲名>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "搜尋",
        description: "搜尋歌曲",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const query = args.join(" ");
    const response = await search(message, query);
    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("搜尋");
    const response = await search(interaction, query);
    if (response) await interaction.followUp(response);
    else interaction.deleteReply();
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function search({ member, guild, channel }, query) {
  if (!member.voice.channel) return "> <a:r2_rice:868583626227478591> 你需要進入語音頻道才能使用此功能。";

  let player = guild.client.musicManager.getPlayer(guild.id);
  if (player && !guild.members.me.voice.channel) {
    player.disconnect();
    await guild.client.musicManager.destroyPlayer(guild.id);
  }
  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "> <a:r2_rice:868583626227478591> 你必須和花瓶在同一個語音頻道才能使用此功能。";
  }

  let res;
  try {
    res = await guild.client.musicManager.rest.loadTracks(
      /^https?:\/\//.test(query) ? query : `${search_prefix[MUSIC.DEFAULT_SOURCE]}:${query}`
    );
  } catch (err) {
    return "> <a:r2_rice:868583626227478591> 搜索歌曲時花瓶碎了。";
  }

  let embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED);
  let tracks;

  switch (res.loadType) {
    case "LOAD_FAILED":
      guild.client.logger.error("Search Exception", res.exception);
      return "> <a:r2_rice:868583626227478591> 搜索歌曲時花瓶碎了。";

    case "NO_MATCHES":
      return `> <a:r2_rice:868583626227478591> 找不到與\` ${query} \`匹配的歌曲。`;

    case "TRACK_LOADED": {
      const [track] = res.tracks;
      tracks = [track];
      if (!player?.playing && !player?.paused && !player?.queue.tracks.length) {
        embed.setAuthor({ name: "已將歌曲添加到播放清單" });
        break;
      }

      const fields = [];
      embed
        .setAuthor({ name: "已將歌曲添加到播放清單", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
        .setDescription(`[${track.info.title}](${track.info.uri})`)
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${member.user.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg'  });

      fields.push({
        name: "歌曲時長",
        value: "`" + prettyMs(track.info.length, { colonNotation: true }) + "`",
        inline: true,
      });

      // if (typeof track.displayThumbnail === "function") embed.setThumbnail(track.displayThumbnail("hqdefault"));
      if (player?.queue?.tracks?.length > 0) {
        fields.push({
          name: "播放清單位置",
          value: (player.queue.tracks.length + 1).toString(),
          inline: true,
        });
      }
      embed.addFields(fields);
      break;
    }

    case "PLAYLIST_LOADED":
      tracks = res.tracks;
      embed
        .setAuthor({ name: "將播放列表添加到播放清單", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
        .setDescription(res.playlistInfo.name)
        .addFields(
          {
            name: "已加入播放清單",
            value: `${res.tracks.length} 歌曲`,
            inline: true,
          },
          {
            name: "播放清單時長",
            value:
              "`" +
              prettyMs(
                res.tracks.map((t) => t.info.length).reduce((a, b) => a + b, 0),
                { colonNotation: true }
              ) +
              "`",
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${member.user.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });
      break;

    case "SEARCH_RESULT": {
      let max = guild.client.config.MUSIC.MAX_SEARCH_RESULTS;
      if (res.tracks.length < max) max = res.tracks.length;

      const results = res.tracks.slice(0, max);
      const options = results.map((result, index) => ({
        label: result.info.title,
        value: index.toString(),
      }));

      const menuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("search-results")
          .setPlaceholder("選擇搜尋結果")
          .setMaxValues(max)
          .addOptions(options)
      );

      const tempEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setAuthor({ name: "搜尋結果", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
        .setDescription(`請選擇您要添加到隊列的歌曲`);

      const sentMsg = await channel.send({
        embeds: [tempEmbed],
        components: [menuRow],
      });

      try {
        const response = await channel.awaitMessageComponent({
          filter: (reactor) => reactor.message.id === sentMsg.id && reactor.user.id === member.id,
          idle: 30 * 1000,
          componentType: ComponentType.StringSelect,
        });

        await sentMsg.delete();
        if (!response) return "> <a:r2_rice:868583626227478591> 您選擇歌曲的時間太長。";

        if (response.customId !== "search-results") return;
        const toAdd = [];
        response.values.forEach((v) => toAdd.push(results[v]));

        // Only 1 song is selected
        if (toAdd.length === 1) {
          tracks = [toAdd[0]];
          embed.setAuthor({ name: "已將歌曲添加到播放清單。", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });
        } else {
          tracks = toAdd;
          embed
            .setDescription(`> <a:r3_rice:868583679465758820> 已新增\` ${toAdd.length} \`至播放清單中。`)
            .setTimestamp()
            .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${member.user.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });
        }
      } catch (err) {
        console.log(err);
        await sentMsg.delete();
        return "> <a:r2_rice:868583626227478591> 花瓶在註冊回覆時碎了。";
      }
    }
  }

  // create a player and/or join the member's vc
  if (!player?.connected) {
    player = guild.client.musicManager.createPlayer(guild.id);
    player.queue.data.channel = channel;
    player.connect(member.voice.channel.id, { deafened: true });
  }

  // do queue things
  const started = player.playing || player.paused;
  player.queue.add(tracks, { requester: member.user.tag, next: false });
  if (!started) {
    await player.queue.start();
  }

  return { embeds: [embed] };
}
