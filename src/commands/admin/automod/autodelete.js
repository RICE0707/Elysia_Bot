const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理自動刪除",
  description: "管理伺服器的各種自動刪除設置",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "限制檔案 <開啟|關閉>",
        description: "是否允許成員發送檔案",
      },
      {
        trigger: "限制邀請 <開啟|關閉>",
        description: "是否允許成員發送邀請",
      },
      {
        trigger: "限制連結 <開啟|關閉>",
        description: "是否允許成員發送連結",
      },
      {
        trigger: "限制行數 <最大值>",
        description: "是否允許成員發送過多的行數 [0 = 關閉此功能]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "限制檔案",
        description: "是否限制成員發送檔案",
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
        name: "限制邀請",
        description: "是否限制成員發送邀請",
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
        name: "限制連結",
        description: "是否限制成員發送連結",
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
        name: "限制行數",
        description: "是否限制成員發送過多的行數",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "最大值",
            description: "設置一則訊息最多能發布多少行 [0 = 關閉此功能]",
            required: true,
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

    if (sub == "限制檔案") {
      const status = args[1].toLowerCase();
      if (!["是", "否"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。`");
      response = await antiAttachments(settings, status);
    }

    //
    else if (sub === "限制邀請") {
      const status = args[1].toLowerCase();
      if (!["是", "否"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
      response = await antiInvites(settings, status);
    }

    //
    else if (sub == "限制連結") {
      const status = args[1].toLowerCase();
      if (!["是", "否"].includes(status)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
      response = await antilinks(settings, status);
    }

    //
    else if (sub === "限制行數") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply("> <a:r2_rice:868583626227478591> 此數值必須大於\` 0 \`。");
      }
      response = await maxLines(settings, max);
    }

    //
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;
    let response;

    if (sub == "限制檔案") {
      response = await antiAttachments(settings, interaction.options.getString("是否啟用"));
    } else if (sub === "限制邀請") response = await antiInvites(settings, interaction.options.getString("是否啟用"));
    else if (sub == "限制連結") response = await antilinks(settings, interaction.options.getString("是否啟用"));
    else if (sub === "限制行數") response = await maxLines(settings, interaction.options.getInteger("最大值"));
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";

    await interaction.followUp(response);
  },
};

async function antiAttachments(settings, input) {
  const status = input.toUpperCase() === "是" ? true : false;
  settings.automod.anti_attachments = status;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，${
    status ? "現在將會移除帶有檔案的訊息。" : "現在不再會移除帶有檔案的訊息。"
  }`;
}

async function antiInvites(settings, input) {
  const status = input.toUpperCase() === "是" ? true : false;
  settings.automod.anti_invites = status;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，${
    status ? "現在將會移除帶有邀請的訊息。" : "現在不再會移除帶有邀請的訊息。"
  }`;
}

async function antilinks(settings, input) {
  const status = input.toUpperCase() === "是" ? true : false;
  settings.automod.anti_links = status;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，${status ? "現在將會移除帶有連結的訊息。" : "現在不再會移除帶有連結的訊息。"}`;
}

async function maxLines(settings, input) {
  const lines = Number.parseInt(input);
  if (isNaN(lines)) return "> <a:r2_rice:868583626227478591> 請輸入有效的數字。";

  settings.automod.max_lines = lines;
  await settings.save();
  return `${
    input === 0
      ? "> <a:r3_rice:868583679465758820> 已關閉行數限制，現在可以暢所欲言了。"
      : `> <a:r3_rice:868583679465758820> 現在超過\` ${input} \`行的訊息將會被花瓶移除。`
  }`;
}
