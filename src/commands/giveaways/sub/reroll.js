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

  // Check if the giveaway is ended
  if (!giveaway.ended) return "> <a:r2_rice:868583626227478591> 這個抽獎並未結束。";

  try {
    await giveaway.reroll();
    return "> <a:r3_rice:868583679465758820> 花瓶重啟了這個抽獎。";
  } catch (error) {
    member.client.logger.error("Giveaway Reroll", error);
    return `> <a:r2_rice:868583626227478591> 花瓶在重啟抽獎時碎掉了：${error.message}`;
  }
};
