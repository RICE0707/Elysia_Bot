const botinvite = require("../shared/botinvite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊邀請機器人",
  description: "給你機器人邀請連結",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = botinvite(message.client);
    try {
      await message.author.send(response);
      return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶把邀請連結放在你的私訊了！");
    } catch (ex) {
      return message.safeReply("> <a:r3_rice:868583679465758820> 花瓶無法私訊你，你是不是把權限關了？");
    }
  },
};
