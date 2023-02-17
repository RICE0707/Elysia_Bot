const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@handlers/ticket");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "客服單設置",
  description: "管理客服單功能",
  category: "客服單",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "設置 <頻道>",
        description: "設置客服單功能頻道",
      },
      {
        trigger: "紀錄 <頻道>",
        description: "設置客服單紀錄頻道",
      },
      {
        trigger: "限制 <數量>",
        description: "限制能開啟的客服單數量",
      },
      {
        trigger: "關閉",
        description: "關閉指定的客服單",
      },
      {
        trigger: "關閉全部",
        description: "關閉全部的客服單",
      },
      {
        trigger: "新增 <使用者代號︱身份組代號>",
        description: "從客服單中新增指定使用者或身份組",
      },
      {
        trigger: "移除 <使用者代號︱身份組代號>",
        description: "從客服單中移除指定使用者或身份組",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "設置",
        description: "設置客服單紀錄頻道",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "紀錄",
        description: "設置客服單紀錄頻道",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "關閉",
        description: "關閉指定的客服單（只能使用在客服單頻道）",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "關閉全部",
        description: "關閉全部的客服單",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "新增",
        description: "從客服單中新增指定使用者（只能使用在客服單頻道）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者代號或身份組代號",
            description: "輸入使用者代號或身份組代號",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "移除",
        description: "從客服單中移除指定使用者（只能使用在客服單頻道）",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者代號或身份組代號",
            description: "輸入使用者代號或身份組代號",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "設置") {
      if (!message.guild.members.me.permissions.has("ManageChannels")) {
        return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶不能創建客服單，因為沒有` 管理頻道 `的權限。");
      }
      const targetChannel = message.guild.findMatchingChannels(args[1])[0];
      if (!targetChannel) {
        return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶找不到這個頻道。");
      }
      return ticketModalSetup(message, targetChannel, data.settings);
    }

    // log ticket
    else if (input === "紀錄") {
      if (args.length < 2) return message.safeReply("> <a:r2_rice:868583626227478591> 請提供紀錄頻道給花瓶。");
      const target = message.guild.findMatchingChannels(args[1]);
      if (target.length === 0) return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶找不到這個頻道。");
      response = await setupLogChannel(target[0], data.settings);
    }

    // Set limit
    else if (input === "限制") {
      if (args.length < 2) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入數字。");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入數字。");
      response = await setupLimit(limit, data.settings);
    }

    // Close ticket
    else if (input === "關閉") {
      response = await close(message, message.author);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "關閉全部") {
      let sent = await message.safeReply("<a:r3_rice:868583679465758820> 花瓶正在關閉中..");
      response = await closeAll(message, message.author);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "新增") {
      if (args.length < 2) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入使用者代號或身份組代號給花瓶。");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    // Remove user from ticket
    else if (input === "移除") {
      if (args.length < 2) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入使用者代號或身份組代號給花瓶。");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    // Invalid input
    else {
      return message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
    }

    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // setup
    if (sub === "設置") {
      const channel = interaction.options.getChannel("頻道");

      if (!interaction.guild.members.me.permissions.has("ManageChannels")) {
        return interaction.followUp("> <a:r2_rice:868583626227478591> 花瓶不能創建客服單，因為沒有` 管理頻道 `的權限。");
      }

      await interaction.deleteReply();
      return ticketModalSetup(interaction, channel, data.settings);
    }

    // Log channel
    else if (sub === "紀錄") {
      const channel = interaction.options.getChannel("頻道");
      response = await setupLogChannel(channel, data.settings);
    }

    // Limit
    else if (sub === "限制") {
      const limit = interaction.options.getInteger("數量");
      response = await setupLimit(limit, data.settings);
    }

    // Close
    else if (sub === "關閉") {
      response = await close(interaction, interaction.user);
    }

    // Close all
    else if (sub === "關閉全部") {
      response = await closeAll(interaction, interaction.user);
    }

    // Add to ticket
    else if (sub === "新增") {
      const inputId = interaction.options.getString("使用者代號或身份組代號");
      response = await addToTicket(interaction, inputId);
    }

    // Remove from ticket
    else if (sub === "移除") {
      const user = interaction.options.getUser("使用者代號或身份組代號");
      response = await removeFromTicket(interaction, user.id);
    }

    if (response) await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup({ guild, channel, member }, targetChannel, settings) {
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel("點擊此按鈕開始設置").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "> <a:r3_rice:868583679465758820> 點擊下方的按鈕以創建一個客服單。",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 沒有收到回覆，花瓶已取消設置客服單。", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "ticket-modalSetup",
      title: "客服單創建",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("客服單標題")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("客服單描述")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("客服單嵌入頁腳")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("staff")
            .setLabel("客服單管理")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 沒有收到回覆，花瓶已取消設置客服單。", components: [] });

  await modal.reply("> <a:r3_rice:868583679465758820> 花瓶正在創建客服單...");
  const title = modal.fields.getTextInputValue("title");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");
  const staffRoles = modal.fields
    .getTextInputValue("staff")
    .split(",")
    .filter((s) => guild.roles.cache.has(s.trim()));

  // send ticket message
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: title || "客服單支援", iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setDescription(description || "> <a:r3_rice:868583679465758820> 點擊下方的按鈕以開啟一個客服單。")
    .setFooter({ text: footer || "你一次只能創建一個客服單。", iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

  const tktBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("點擊此按鈕開啟客服單").setCustomId("TICKET_CREATE").setStyle(ButtonStyle.Success)
  );

  // save configuration
  settings.ticket.staff_roles = staffRoles;
  await settings.save();

  await targetChannel.send({ embeds: [embed], components: [tktBtnRow] });
  await modal.deleteReply();
  await sentMsg.edit({ content: "> <a:r3_rice:868583679465758820> 花瓶已創建客服單。", components: [] });
}

async function setupLogChannel(target, settings) {
  if (!target.canSendEmbeds()) return `> <a:r2_rice:868583626227478591> 花瓶在\` ${target} \`沒有\` 嵌入訊息 \`的權限。`;

  settings.ticket.log_channel = target.id;
  await settings.save();

  return `> <a:r3_rice:868583679465758820> 客服單紀錄將由花瓶傳送至 ${target.toString()} 中。`;
}

async function setupLimit(limit, settings) {
  if (Number.parseInt(limit, 10) < 1) return "> <a:r2_rice:868583626227478591> 客服單限制不能少於\` 1 \`。";

  settings.ticket.limit = limit;
  await settings.save();

  return `> <a:r3_rice:868583679465758820> 現在使用者一次可同時開啟\` ${limit} \`個客服單。`;
}

async function close({ channel }, author) {
  if (!isTicketChannel(channel)) return "> <a:r2_rice:868583626227478591> 這個指令只能在客服單頻道使用。";
  const status = await closeTicket(channel, author, "> <a:r3_rice:868583679465758820> 管理員已關閉此客服單。");
  if (status === "MISSING_PERMISSIONS") return "> <a:r2_rice:868583626227478591> 花瓶沒有刪除這個客服單的權限。";
  if (status === "ERROR") return "> <a:r2_rice:868583626227478591> 關閉客服單讓花瓶碎了";
  return null;
}

async function closeAll({ guild }, user) {
  const stats = await closeAllTickets(guild, user);
  return `> <a:r2_rice:868583626227478591> 成功：\` ${stats[0]} \`。\n> <a:r2_rice:868583626227478591> 失敗：\` ${stats[1]} \`。`;
}

async function addToTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "> <a:r2_rice:868583626227478591> 這個指令只能在客服單頻道使用。";
  if (!inputId || isNaN(inputId)) return "> <a:r2_rice:868583626227478591> 你需要輸入正確的使用者代號或身份組代號給花瓶。";

  try {
    await channel.permissionOverwrites.create(inputId, {
      ViewChannel: true,
      SendMessages: true,
    });

    return "> <a:r3_rice:868583679465758820> 花瓶已幫你已新增使用者或身分組。";
  } catch (ex) {
    return "> <a:r2_rice:868583626227478591> 你需要輸入正確的使用者代號或身份組代號給花瓶。";
  }
}

async function removeFromTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "> <a:r2_rice:868583626227478591> 這個指令只能在客服單頻道使用。";
  if (!inputId || isNaN(inputId)) return "> <a:r2_rice:868583626227478591> 你需要輸入正確的使用者代號或身份組代號給花瓶。";

  try {
    channel.permissionOverwrites.create(inputId, {
      ViewChannel: false,
      SendMessages: false,
    });
    return "> <a:r3_rice:868583679465758820> 花瓶已幫你已新增使用者或身分組。";
  } catch (ex) {
    return "> <a:r2_rice:868583626227478591> 你需要輸入正確的使用者代號或身份組代號給花瓶。";
  }
}
