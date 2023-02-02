const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理滿警告處分",
  description: "設置伺服器成員能接收的警告最大值與達到警告最大值後的處分",
  category: "管理類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "警告 <最大值>",
        description: "設置伺服器成員能接收的警告最大值",
      },
      {
        trigger: "處分 <禁言|踢出|封禁>",
        description: "設置伺服器成員達到警告最大值後的處分",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "警告最大值",
        description: "設置伺服器成員能接收的警告最大值（預設為 10）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "最大值",
            description: "設置伺服器成員能接收的警告最大值（預設為 10）",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "處分",
        description: "設置伺服器成員能接收的警告最大值（預設為 10）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "嚴重程度",
            description: "選擇伺服器成員達到警告最大值後的處分",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "禁言",
                value: "禁言",
              },
              {
                name: "踢出",
                value: "踢出",
              },
              {
                name: "封禁",
                value: "封禁",
              },
            ],
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["警告最大值", "最大值"].includes(input)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");

    let response;
    if (input === "警告最大值") {
      const max = parseInt(args[1]);
      if (isNaN(max) || max < 1) return message.safeReply("> <a:r2_rice:868583626227478591> 此數值必須大於0，並且必須為數字。");
      response = await setLimit(max, data.settings);
    }

    if (input === "最大值") {
      const action = args[1]?.toUpperCase();
      if (!action || !["禁言", "踢出", "封禁"].includes(action))
        return message.safeReply("> <a:r2_rice:868583626227478591> 無效的處分類型，處分類型必須為：` 禁言 `/ `踢出 `/` 封禁 `其一。");
      response = await setAction(message.guild, action, data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();

    let response;
    if (sub === "警告最大值") {
      response = await setLimit(interaction.options.getInteger("amount"), data.settings);
    }

    if (sub === "最大值") {
      response = await setAction(interaction.guild, interaction.options.getString("最大值"), data.settings);
    }

    await interaction.followUp(response);
  },
};

async function setLimit(limit, settings) {
  settings.max_warn.limit = limit;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，現在最高警告數為：\` ${strikes} \`。`;
}

async function setAction(settings, guild, action) {
  if (action === "禁言") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "> <a:r2_rice:868583626227478591> 你沒有權限禁言其他成員。";
    }
  }

  if (action === "踢出") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "> <a:r2_rice:868583626227478591> 你沒有權限踢出其他成員。";
    }
  }

  if (action === "封禁") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "> <a:r2_rice:868583626227478591> 你沒有權限封禁其他成員。";
    }
  }

  settings.max_warn.action = action;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，現在滿警告處分為：\` ${action} \`。`;
}
