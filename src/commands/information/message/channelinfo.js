const channelInfo = require("../shared/channel");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊頻道",
  description: "查看頻道資訊",
  category: "資訊類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[#頻道|代碼]",
    aliases: ["chinfo"],
  },

  async messageRun(message, args) {
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    }

    // find channel by name/ID
    else if (args.length > 0) {
      const search = args.join(" ");
      const tcByName = message.guild.findMatchingChannels(search);
      if (tcByName.length === 0) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到\` ${search} \`頻道！`);
      if (tcByName.length > 1) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${search} \`頻道！`);
      [targetChannel] = tcByName;
    } else {
      targetChannel = message.channel;
    }

    const response = channelInfo(targetChannel);
    await message.safeReply(response);
  },
};
