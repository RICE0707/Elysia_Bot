/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 * @param {number} addDuration
 * @param {string} newPrize
 * @param {number} newWinnerCount
 */
module.exports = async (member, messageId, addDuration, newPrize, newWinnerCount) => {
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

  try {
    await member.client.giveawaysManager.edit(messageId, {
      addTime: addDuration || 0,
      newPrize: newPrize || giveaway.prize,
      newWinnerCount: newWinnerCount || giveaway.winnerCount,
    });

    return `> <a:r3_rice:868583679465758820> 花瓶更新了這個抽獎。`;
  } catch (error) {
    member.client.logger.error("Giveaway Edit", error);
    return `> <a:r2_rice:868583626227478591> 花瓶在編輯抽獎時碎掉了：${error.message}`;
  }
};
