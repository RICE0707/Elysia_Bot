const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "統計設置等級系統",
  description: "設置等級系統",
  category: "STATS",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "訊息 <新訊息>",
        description: "設置升級訊息",
      },
      {
        trigger: "頻道 <#頻道|關閉>",
        description: "設置發布升級訊息的頻道",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "訊息",
        description: "設置升級訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "編寫訊息",
            description: "編寫升級訊息",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "頻道",
        description: "設置發布升級訊息的頻道",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "選擇頻道",
            description: "選擇發布升級訊息的頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    const subcommandArgs = args.slice(1);
    let response;

    // message
    if (sub === "訊息") {
      const message = subcommandArgs.join(" ");
      response = await setMessage(message, data.settings);
    }

    // channel
    else if (sub === "頻道") {
      const input = subcommandArgs[0];
      let channel;

      if (input === "否") channel = "否";
      else {
        const match = message.guild.findMatchingChannels(input);
        if (match.length === 0) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的頻道，請提供正確的頻道。");
        channel = match[0];
      }
      response = await setChannel(channel, data.settings);
    }

    // invalid
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "訊息") response = await setMessage(interaction.options.getString("編寫訊息"), data.settings);
    else if (sub === "頻道") response = await setChannel(interaction.options.getChannel("選擇頻道"), data.settings);
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";

    await interaction.followUp(response);
  },
};

async function setMessage(message, settings) {
  if (!message) return "> <a:r2_rice:868583626227478591> 無效的訊息，請提供正確的訊息。";
  settings.stats.xp.message = message;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已更新升級訊息。`;
}

async function setChannel(channel, settings) {
  if (!channel) return "> <a:r2_rice:868583626227478591> 無效的頻道，請提供正確的頻道。";

  if (channel === "否") settings.stats.xp.channel = null;
  else settings.stats.xp.channel = channel.id;

  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，現在升級訊息將發送至指定頻道。`;
}
