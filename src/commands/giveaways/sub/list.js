const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (member) => {
  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "> <a:r2_rice:868583626227478591> 你沒有權限舉辦抽獎。";
  }

  // Search with all giveaways
  const giveaways = member.client.giveawaysManager.giveaways.filter(
    (g) => g.guildId === member.guild.id && g.ended === false
  );

  // No giveaways
  if (giveaways.length === 0) {
    return "> <a:r2_rice:868583626227478591> 這個群組沒有任何抽獎。";
  }

  const description = giveaways.map((g, i) => `${i + 1}. ${g.prize} 在 <#${g.channelId}>`).join("\n");

  try {
    return { embeds: [{ description, color: EMBED_COLORS.GIVEAWAYS }] };
  } catch (error) {
    member.client.logger.error("Giveaway List", error);
    return `> <a:r2_rice:868583626227478591> 花瓶在查找抽獎時碎掉了：${error.message}`;
  }
};
