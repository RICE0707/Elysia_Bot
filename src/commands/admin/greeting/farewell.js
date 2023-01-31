const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理離群訊息",
  description: "設置成員退群訊息",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "狀態 <開啟|關閉>",
        description: "是否發送成員退群訊息",
      },
      {
        trigger: "頻道 <頻道>",
        description: "設置發送成員退群訊息的頻道",
      },
      {
        trigger: "預覽",
        description: "預覽已設置的成員退群訊息",
      },
      {
        trigger: "描述 <描述>",
        description: "設置成員退群訊息",
      },
      {
        trigger: "縮略圖 <開啟|關閉>",
        description: "是否在成員退群訊息放上縮略圖",
      },
      {
        trigger: "顏色 <二進制色碼>",
        description: "設置成員退群訊息的顏色",
      },
      {
        trigger: "頁腳 <文字>",
        description: "設置成員退群訊息頁腳的文字",
      },
      {
        trigger: "圖片 <圖片網址>",
        description: "設置成員退群訊息的圖片",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "狀態",
        description: "是否發送成員退群訊息",
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
        name: "預覽",
        description: "預覽已設置的成員退群訊息",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "頻道",
        description: "設置發送成員退群訊息的頻道",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "設置頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "描述",
        description: "設置成員退群訊息",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "描述",
            description: "設置描述",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "縮略圖",
        description: "是否在成員退群訊息放上縮略圖",
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
        name: "顏色",
        description: "設置成員退群訊息的顏色",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "二進制色碼",
            description: "輸入二進制色碼 (例如：d3d7da)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "頁腳",
        description: "設置成員退群訊息頁腳的文字",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "文字",
            description: "輸入文字",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "圖片",
        description: "設置成員退群訊息的圖片",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "網址",
            description: "輸入網址",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    // preview
    if (type === "預覽") {
      response = await sendPreview(settings, message.member);
    }

    // status
    else if (type === "狀態") {
      const status = args[1]?.toUpperCase();
      if (!status || !["是", "否"].includes(status))
        return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "頻道") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "描述") {
      if (args.length < 2) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入文字。");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    else if (type === "縮略圖") {
      const status = args[1]?.toUpperCase();
      if (!status || !["是", "否"].includes(status))
        return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");
      response = await setThumbnail(settings, status);
    }

    // color
    else if (type === "顏色") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的顏色，請輸入二進制色碼（例如：#d3d7da）。");
      response = await setColor(settings, color);
    }

    // footer
    else if (type === "頁腳") {
      if (args.length < 2) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入文字。");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    // image
    else if (type === "圖片") {
      const url = args[1];
      if (!url) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入正確的圖片網址。");
      response = await setImage(settings, url);
    }

    //
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "預覽":
        response = await sendPreview(settings, interaction.member);
        break;

      case "狀態":
        response = await setStatus(settings, interaction.options.getString("是否啟用"));
        break;

      case "頻道":
        response = await setChannel(settings, interaction.options.getChannel("頻道"));
        break;

      case "描述":
        response = await setDescription(settings, interaction.options.getString("描述"));
        break;

      case "縮略圖":
        response = await setThumbnail(settings, interaction.options.getString("是否啟用"));
        break;

      case "顏色":
        response = await setColor(settings, interaction.options.getString("二進制色碼"));
        break;

      case "頁腳":
        response = await setFooter(settings, interaction.options.getString("文字"));
        break;

      case "圖片":
        response = await setImage(settings, interaction.options.getString("網址"));
        break;

      default:
        response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    }

    return interaction.followUp(response);
  },
};

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled) return "> <a:r2_rice:868583626227478591> 這個伺服器未啟用離開訊息。";

  const targetChannel = member.guild.channels.cache.get(settings.farewell.channel);
  if (!targetChannel) return "> <a:r2_rice:868583626227478591> 未設置發送離開訊息的頻道。";

  const response = await buildGreeting(member, "FAREWELL", settings.farewell);
  await targetChannel.safeSend(response);

  return `> <a:r3_rice:868583679465758820> 已發送離開訊息預覽至 ${targetChannel.toString()} 頻道。`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "是" ? true : false;
  settings.farewell.enabled = enabled;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，離開訊息功能已\` ${enabled ? "開啟" : "關閉"} \`。`;
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      "> <a:r2_rice:868583626227478591> 花瓶不能發送訊息，因為它缺少了發送訊息或嵌入訊息的權限。" +
      channel.toString()
    );
  }
  settings.farewell.channel = channel.id;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存設置，離開訊息將發送至  ${channel ? channel.toString() : "此頻道不存在"} 頻道。`;
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc;
  await settings.save();
  return "> <a:r3_rice:868583679465758820> 已保存設置，離開訊息已更新。";
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail = status.toUpperCase() === "是" ? true : false;
  await settings.save();
  return "> <a:r3_rice:868583679465758820> 已保存設置，離開訊息已更新。";
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color;
  await settings.save();
  return "> <a:r3_rice:868583679465758820> 已保存設置，離開訊息已更新。";
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content;
  await settings.save();
  return "> <a:r3_rice:868583679465758820> 已保存設置，離開訊息已更新。";
}

async function setImage(settings, url) {
  settings.farewell.embed.image = url;
  await settings.save();
  return "> <a:r3_rice:868583679465758820> 已保存設置，離開訊息已更新。";
}
