const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理自動防止",
  description: "管理群組的各種自動防止設置",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "防幽靈標註 <開啟|關閉>",
        description: "防那種標了但秒刪的低能",
      },
      {
        trigger: "防刷頻 <開啟|關閉>",
        description: "防刷頻寒暑假特產",
      },
      {
        trigger: "防多標註 <開啟|關閉> [最高值]",
        description: "防那種一次標一堆人的破腦（預設最高值為3）",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "防幽靈標註",
        description: "防止使用者標註後快速收回",
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
        name: "防刷頻",
        description: "防止使用者刷頻",
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
        name: "防多標註",
        description: "防止使用者一次標一堆人",
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
          {
            name: "最高值",
            description: "設置一次最多能標註多少人（預設最高值為3）",
            required: false,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();

    let response;
    if (sub == "防幽靈標註") {
      const status = args[1].toLowerCase();
      if (!["是", "否"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
      response = await antiGhostPing(settings, status);
    }

    //
    else if (sub == "防刷頻") {
      const status = args[1].toLowerCase();
      if (!["是", "否f"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
      response = await antiSpam(settings, status);
    }

    //
    else if (sub === "防多標註") {
      const status = args[1].toLowerCase();
      const threshold = args[2] || 3;
      if (!["是", "否"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
      response = await antiMassMention(settings, status, threshold);
    }

    //
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    if (sub == "防幽靈標註") response = await antiGhostPing(settings, interaction.options.getString("是否啟用"));
    else if (sub == "防刷頻") response = await antiSpam(settings, interaction.options.getString("是否啟用"));
    else if (sub === "防多標註") {
      response = await antiMassMention(
        settings,
        interaction.options.getString("是否啟用"),
        interaction.options.getInteger("最高值")
      );
    } else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";

    await interaction.followUp(response);
  },
};

async function antiGhostPing(settings, input) {
  const status = input.toUpperCase() === "是" ? true : false;
  settings.automod.anti_ghostping = status;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 防幽靈標註功能已\` ${status ? "啟用" : "停用"} \`。`;
}

async function antiSpam(settings, input) {
  const status = input.toUpperCase() === "是" ? true : false;
  settings.automod.anti_spam = status;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 防刷頻功能已\` ${status ? "啟用" : "停用"} \`。`;
}

async function antiMassMention(settings, input, threshold) {
  const status = input.toUpperCase() === "是" ? true : false;
  if (!status) {
    settings.automod.anti_massmention = 0;
  } else {
    settings.automod.anti_massmention = threshold;
  }
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 防多標註功能已\` ${status ? "啟用" : "停用"} \`。`;
}
