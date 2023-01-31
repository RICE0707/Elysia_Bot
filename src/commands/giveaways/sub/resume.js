/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "> <a:r2_rice:868583626227478591> 請輸入正確的訊息代號。";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "> <a:r2_rice:868583626227478591> 你沒有權限舉辦抽獎。";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `> <a:r2_rice:868583626227478591> 花瓶在\` ${messageId} \`中找不到任何抽獎。`;

  // Check if the giveaway is unpaused
  if (!giveaway.pauseOptions.isPaused) return "> <a:r2_rice:868583626227478591> 這個抽獎並未暫停。";

  try {
    await giveaway.unpause();
    return "> <a:r3_rice:868583679465758820> 主辦者恢復了這個抽獎。";
  } catch (error) {
    member.client.logger.error("Giveaway Resume", error);
    return `> <a:r2_rice:868583626227478591> 花瓶在恢復抽獎時碎掉了：${error.message}`;
  }
};
