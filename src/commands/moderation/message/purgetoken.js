const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "清除指定金鑰訊息",
  description: "清除指定金鑰訊息",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<金鑰> [數量]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const token = args[0];
    const amount = (args.length > 1 && args[1]) || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入數字。");
      if (parseInt(amount) > 99) return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶最多只能刪除` 99 `則訊息。");
    }

    const { channel } = message;
    const response = await purgeMessages(message.member, message.channel, "TOKEN", amount, token);

    if (typeof response === "number") {
      return channel.safeSend(`> <a:r3_rice:868583679465758820> 已刪除\` ${response} \`則訊息。`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶沒有` 讀取訊息歷史 `與` 管理訊息 `的權限。", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("> <a:r2_rice:868583626227478591> 你沒有` 讀取訊息歷史 `與` 管理訊息 `的權限。", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("> <a:r2_rice:868583626227478591> 沒有訊息可以被清除。", 5);
    } else {
      return message.safeReply(`> <a:r2_rice:868583626227478591> 刪除訊息讓花瓶碎了。`);
    }
  },
};
