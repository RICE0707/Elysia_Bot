const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理自動處分",
  description: "管理群組的各種自動處分設置",
  category: "自動管理類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "狀態",
        description: "查看目前群組的自動管理設置",
      },
      {
        trigger: "警告 <最大值>",
        description: "設置使用者能接收的警告最大值",
      },
      {
        trigger: "處分 <禁言|踢出成員|封禁>",
        description: "設置使用者達到警告最大值後的處分",
      },
      {
        trigger: "調適 <開啟|關閉>",
        description: "是否讓管理員也會被自動管理偵測",
      },
      {
        trigger: "白名單列表",
        description: "查看哪些頻道不受自動管理偵測",
      },
      {
        trigger: "白名單新增 <頻道>",
        description: "將一個頻道加入白名單，使其不受自動處分偵測",
      },
      {
        trigger: "白名單移除 <頻道>",
        description: "將一個頻道從白名單中移除，使其受自動處分偵測",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "狀態",
        description: "查看目前群組的自動管理設置",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "警告",
        description: "設置使用者能接收的警告最大值",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "最大值",
            description: "設置使用者能接收的警告最大值（預設為 10）",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
      {
        name: "處分",
        description: "設置使用者達到警告最大值後處分",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "嚴重程度",
            description: "選擇使用者達到警告最大值後的處分",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "禁言",
                value: "禁言",
              },
              {
                name: "踢出成員",
                value: "踢出成員",
              },
              {
                name: "封禁",
                value: "封禁",
              },
            ],
          },
        ],
      },
      {
        name: "調適",
        description: "是否讓管理員也會被自動處分偵測",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "是否啟用",
            description: "是否啟用",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "是",
                value: "是",
              },
              {
                name: "否",
                value: "否",
              },
            ],
          },
        ],
      },
      {
        name: "白名單列表",
        description: "查看哪些頻道不受自動處分偵測",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "白名單新增",
        description: "將一個頻道加入白名單，使其不受自動處分偵測",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "將一個頻道加入白名單",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "白名單移除",
        description: "將一個頻道從白名單中移除，使其受自動處分偵測",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "將一個頻道從白名單中移除",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const settings = data.settings;

    let response;
    if (input === "狀態") {
      response = await getStatus(settings, message.guild);
    } else if (input === "警告") {
      const strikes = args[1];
      if (isNaN(strikes) || Number.parseInt(strikes) < 1) {
        return message.safeReply("> <a:r2_rice:868583626227478591> 此數值必須大於0，並且必須為數字。");
      }
      response = await setStrikes(settings, strikes);
    } else if (input === "嚴重程度") {
      const action = args[1].toUpperCase();
      if (!action || !["禁言", "踢出成員", "封禁"].includes(action))
        return message.safeReply("> <a:r2_rice:868583626227478591> 無效的處分類型，處分類型必須為：` 禁言 `/` 踢出成員 `/` 封禁 `其一。");
      response = await setAction(settings, message.guild, action);
    } else if (input === "調適") {
      const status = args[1].toLowerCase();
      if (!["是", "否"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：`是/否`。");
      response = await setDebug(settings, status);
    }

    // whitelist
    else if (input === "白名單列表") {
      response = getWhitelist(message.guild, settings);
    }

    // whitelist add
    else if (input === "白名單新增") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`> <a:r2_rice:868583626227478591> \` ${args[1]} \`頻道並不存在。`);
      response = await whiteListAdd(settings, match[0].id);
    }

    // whitelist remove
    else if (input === "白名單移除") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`> <a:r2_rice:868583626227478591> \` ${args[1]} \`頻道並不存在。`);
      response = await whiteListRemove(settings, match[0].id);
    }

    //
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;

    if (sub === "狀態") response = await getStatus(settings, interaction.guild);
    else if (sub === "警告") response = await setStrikes(settings, interaction.options.getInteger("最大值"));
    else if (sub === "處分")
      response = await setAction(settings, interaction.guild, interaction.options.getString("嚴重程度"));
    else if (sub === "調適") response = await setDebug(settings, interaction.options.getString("是否啟用"));
    else if (sub === "白名單列表") {
      response = getWhitelist(interaction.guild, settings);
    } else if (sub === "白名單新增") {
      const channelId = interaction.options.getChannel("頻道").id;
      response = await whiteListAdd(settings, channelId);
    } else if (sub === "白名單移除") {
      const channelId = interaction.options.getChannel("頻道").id;
      response = await whiteListRemove(settings, channelId);
    }

    await interaction.followUp(response);
  },
};

async function getStatus(settings, guild) {
  const { automod } = settings;

  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
    : "無設置。";

  // String Builder
  let desc = stripIndent`
    **限制最大行數**：${automod.max_lines || "無設置。"}
    **防一次性標註多人**：${automod.anti_massmention > 0 ? "已啟用" : "未啟用"}
    **限制檔案**：${automod.anti_attachment ? "已啟用" : "未啟用"}
    **限制連結**：${automod.anti_links ? "已啟用" : "未啟用"}
    **限制邀請**：${automod.anti_invites ? "已啟用" : "未啟用"}
    **防刷頻**：${automod.anti_spam ? "已啟用" : "未啟用"}
    **防幽靈標註**: ${automod.anti_ghostping ? "已啟用" : "未啟用"}
  `;

  const embed = new EmbedBuilder()
    .setAuthor({ name: "花瓶的自動管理系統", iconURL: guild.iconURL() })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .setTimestamp()
    .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .addFields(
      {
        name: "紀錄頻道",
        value: logChannel,
        inline: true,
      },
      {
        name: "最高警告數",
        value: automod.strikes.toString(),
        inline: true,
      },
      {
        name: "滿警告處分",
        value: automod.action,
        inline: true,
      },
      {
        name: "調適模式",
        value: automod.debug ? "已啟用" : "未啟用",
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function setStrikes(settings, strikes) {
  settings.automod.strikes = strikes;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，現在最高警告數為：\` ${strikes} \`。`;
}

async function setAction(settings, guild, action) {
  if (action === "禁言") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "> <a:r2_rice:868583626227478591> 你沒有權限禁言其他成員。";
    }
  }

  if (action === "踢出成員") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "> <a:r2_rice:868583626227478591> 你沒有權限踢出其他成員。";
    }
  }

  if (action === "封禁") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "> <a:r2_rice:868583626227478591> 你沒有權限封禁其他成員。";
    }
  }

  settings.automod.action = action;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 滿警告處分為：\` ${action} \`。`;
}

async function setDebug(settings, input) {
  const status = input.toLowerCase() === "是" ? true : false;
  settings.automod.debug = status;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 調適模式已\` ${status ? "開啟" : "關閉"} \`。`;
}

function getWhitelist(guild, settings) {
  const whitelist = settings.automod.wh_channels;
  if (!whitelist || !whitelist.length) return "> <a:r2_rice:868583626227478591> 沒有任何頻道在白名單中。";

  const channels = [];
  for (const channelId of whitelist) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    if (channel) channels.push(channel.toString());
  }

  return `白名單頻道：${channels.join("， ")}。`;
}

async function whiteListAdd(settings, channelId) {
  if (settings.automod.wh_channels.includes(channelId)) return "> <a:r3_rice:868583679465758820> 此頻道已被列入白名單。";
  settings.automod.wh_channels.push(channelId);
  await settings.save();
  return `此頻道已被列入白名單。`;
}

async function whiteListRemove(settings, channelId) {
  if (!settings.automod.wh_channels.includes(channelId)) return "> <a:r2_rice:868583626227478591> 此頻道不在白名單中。";
  settings.automod.wh_channels.splice(settings.automod.wh_channels.indexOf(channelId), 1);
  await settings.save();
  return `此頻道已從白名單中移除。`;
}
