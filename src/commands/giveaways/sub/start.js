const { ChannelType } = require("discord.js");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 * @param {string[]} [allowedRoles]
 */
module.exports = async (member, giveawayChannel, duration, prize, winners, host, allowedRoles = []) => {
  try {
    if (!host) host = member.user;
    if (!member.permissions.has("ManageMessages")) {
      return "> <a:r2_rice:868583626227478591> 你需要有\` 管理訊息的權限 \`才能舉辦抽獎。";
    }

    if (!giveawayChannel.type === ChannelType.GuildText) {
      return "> <a:r2_rice:868583626227478591> 你只能在文字頻道中舉辦抽獎。";
    }

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const options = {
      duration: duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: "https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg",
      messages: {
        giveaway: "> <a:m8_rice:985142595405623306> 抽獎開始啦！",
        giveawayEnded: "> <a:r2_rice:868583626227478591> 抽獎結束了。",
        inviteToParticipate: "> 點擊\` 🎁 \`以參與抽獎！",
        dropMessage: "點擊\` 🎁 \`成為第一位參與抽獎的酷割或帥姐。",
        hostedBy: `\n> 主辦者：${host.tag}`,
      },
    };

    if (allowedRoles.length > 0) {
      options.exemptMembers = (member) => !member.roles.cache.find((role) => allowedRoles.includes(role.id));
    }

    await member.client.giveawaysManager.start(giveawayChannel, options);
    return `> <a:m8_rice:985142595405623306> 抽獎已在 ${giveawayChannel} 開始！`;
  } catch (error) {
    member.client.logger.error("Giveaway Start", error);
    return `> <a:r2_rice:868583626227478591> 花瓶在舉辦抽獎時碎掉了：${error.message}`;
  }
};
