const { purgeMessages } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "清除訊息",
  description: "清除訊息",
  category: "實用類",
  userPermissions: ["ManageMessages"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "全部的",
        description: "清除全部訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "數量",
            description: "輸入數字（最多 99）",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "僅檔案",
        description: "清除包含檔案的訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "數量",
            description: "輸入數字（最多 99）",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "僅機器人",
        description: "清除機器人訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "數量",
            description: "輸入數字（最多 99）",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "僅連結",
        description: "清除包含連結的訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "數量",
            description: "輸入數字（最多 99）",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "僅金鑰",
        description: "清除包含指定金鑰的訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "金鑰",
            description: "輸入金鑰",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "數量",
            description: "輸入數字（最多 99）",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "僅使用者",
        description: "清除使用者訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "數量",
            description: "輸入數字（最多 99）",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const { options, member } = interaction;

    const sub = options.getSubcommand();
    const channel = options.getChannel("頻道");
    const amount = options.getInteger("數量") || 99;

    if (amount > 100) return interaction.followUp("> <a:r2_rice:868583626227478591> 花瓶最多只能刪除` 99 `則訊息。");

    let response;
    switch (sub) {
      case "全部的":
        response = await purgeMessages(member, channel, "全部", amount);
        break;

      case "僅檔案":
        response = await purgeMessages(member, channel, "檔案", amount);
        break;

      case "僅機器人":
        response = await purgeMessages(member, channel, "機器人", amount);
        break;

      case "僅連結":
        response = await purgeMessages(member, channel, "連結", amount);
        break;

      case "僅金鑰": {
        const token = interaction.options.getString("金鑰");
        response = await purgeMessages(member, channel, "金鑰", amount, token);
        break;
      }

      case "僅使用者": {
        const user = interaction.options.getUser("使用者");
        response = await purgeMessages(member, channel, "使用者", amount, user);
        break;
      }

      default:
        return interaction.followUp("> <a:r2_rice:868583626227478591> 這不是一個有效的選項。");
    }

    // Success
    if (typeof response === "number") {
      return interaction.followUp(`> <a:r3_rice:868583679465758820> 已刪除 ${channel} 中的\` ${response} \`則訊息。`);
    }

    // Member missing permissions
    else if (response === "MEMBER_PERM") {
      return interaction.followUp(
        `> <a:r2_rice:868583626227478591> 你在 ${channel} 中沒有\` 讀取訊息歷史 \`與\` 管理訊息 \`的權限。`
      );
    }

    // Bot missing permissions
    else if (response === "BOT_PERM") {
      return interaction.followUp(`> <a:r2_rice:868583626227478591> 花瓶在 ${channel} 中沒有\` 讀取訊息歷史 \`與\` 管理訊息 \`的權限。`);
    }

    // No messages
    else if (response === "NO_MESSAGES") {
      return interaction.followUp("> <a:r2_rice:868583626227478591> 沒有訊息可以被清除。");
    }

    // Remaining
    else {
      return interaction.followUp("> <a:r2_rice:868583626227478591> 刪除訊息讓花瓶碎了。");
    }
  },
};
