const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理審核日誌頻道",
  description: "設置審核日誌頻道",
  category: "管理類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<頻道|關閉>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "頻道",
        description: "選擇審核日誌頻道",
        required: false,
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
      targetChannel = message.mentions.channels.first();
    }

    const response = await setChannel(targetChannel, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setChannel(interaction.options.getChannel("頻道"), data.settings);
    return interaction.followUp(response);
  },
};

async function setChannel(targetChannel, settings) {
  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return "> <a:r2_rice:868583626227478591> 花瓶不能發送訊息，因為缺少了\` 發送訊息 \`或\` 嵌入訊息 \`的權限。";
  }

  settings.modlog_channel = targetChannel?.id;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 現在審核日誌已\` ${targetChannel ? "啟用" : "關閉"} \`。`;
}
