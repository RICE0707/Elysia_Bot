const {
  ChannelType,
  ButtonBuilder,
  ActionRowBuilder,
  ComponentType,
  TextInputStyle,
  TextInputBuilder,
  ModalBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");
const ems = require("enhanced-ms");

// Sub Commands
const start = require("./sub/start");
const pause = require("./sub/pause");
const resume = require("./sub/resume");
const end = require("./sub/end");
const reroll = require("./sub/reroll");
const list = require("./sub/list");
const edit = require("./sub/edit");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "抽獎",
  description: "抽獎功能設置",
  category: "GIVEAWAY",
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "設置 <頻道>",
        description: "設置抽獎頻道",
      },
      {
        trigger: "暫停 <訊息代號>",
        description: "暫停抽獎",
      },
      {
        trigger: "恢復 <訊息代號>",
        description: "恢復抽獎",
      },
      {
        trigger: "結束 <訊息代號>",
        description: "結束抽獎",
      },
      {
        trigger: "重啟 <訊息代號>",
        description: "重新抽獎",
      },
      {
        trigger: "列表",
        description: "抽獎列表",
      },
      {
        trigger: "編輯 <訊息代號>",
        description: "編輯抽獎",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "設置",
        description: "設置抽獎",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道",
            description: "輸入頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "暫停",
        description: "暫停抽獎",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "訊息代號",
            description: "輸入訊息代號",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "恢復",
        description: "恢復抽獎",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "訊息代號",
            description: "輸入訊息代號",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "結束",
        description: "結束抽獎",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "訊息代號",
            description: "輸入訊息代號",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "重啟",
        description: "重啟抽獎",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "訊息代號",
            description: "輸入訊息代號",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "列表",
        description: "抽獎列表",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response;

    //
    if (sub === "設置") {
      if (!args[1]) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入頻道名。");
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到\` ${args[1]} \`。`);
      return await runModalSetup(message, match[0]);
    }

    //
    else if (sub === "暫停") {
      const messageId = args[1];
      response = await pause(message.member, messageId);
    }

    //
    else if (sub === "恢復") {
      const messageId = args[1];
      response = await resume(message.member, messageId);
    }

    //
    else if (sub === "結束") {
      const messageId = args[1];
      response = await end(message.member, messageId);
    }

    //
    else if (sub === "重啟") {
      const messageId = args[1];
      response = await reroll(message.member, messageId);
    }

    //
    else if (sub === "列表") {
      response = await list(message.member);
    }

    //
    else if (sub === "編輯") {
      const messageId = args[1];
      if (!messageId) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入訊息代號。");
      return await runModalEdit(message, messageId);
    }

    //
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    //
    if (sub === "設置") {
      const channel = interaction.options.getChannel("頻道");
      return await runModalSetup(interaction, channel);
    }

    //
    else if (sub === "暫停") {
      const messageId = interaction.options.getString("訊息代號");
      response = await pause(interaction.member, messageId);
    }

    //
    else if (sub === "恢復") {
      const messageId = interaction.options.getString("訊息代號");
      response = await resume(interaction.member, messageId);
    }

    //
    else if (sub === "結束") {
      const messageId = interaction.options.getString("訊息代號");
      response = await end(interaction.member, messageId);
    }

    //
    else if (sub === "重啟") {
      const messageId = interaction.options.getString("訊息代號");
      response = await reroll(interaction.member, messageId);
    }

    //
    else if (sub === "列表") {
      response = await list(interaction.member);
    }

    //
    else if (sub === "編輯") {
      const messageId = interaction.options.getString("訊息代號");
      const addDurationMs = ems(interaction.options.getInteger("新增時間"));
      if (!addDurationMs) {
        return interaction.followUp("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
      }
      const newPrize = interaction.options.getString("新增獎品");
      const newWinnerCount = interaction.options.getInteger("新增獲獎人數");
      response = await edit(interaction.member, messageId, addDurationMs, newPrize, newWinnerCount);
    }

    //
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";

    await interaction.followUp(response);
  },
};

// Modal Giveaway setup
/**
 * @param {import('discord.js').Message|import('discord.js').CommandInteraction} args0
 * @param {import('discord.js').GuildTextBasedChannel} targetCh
 */
async function runModalSetup({ member, channel, guild }, targetCh) {
  const SETUP_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks"];

  // validate channel perms
  if (!targetCh) return channel.safeSend("> <a:r2_rice:868583626227478591> 花瓶已取消抽獎設置，因為你沒有提供給花瓶頻道。");
  if (!targetCh.type === ChannelType.GuildText && !targetCh.permissionsFor(guild.members.me).has(SETUP_PERMS)) {
    return channel.safeSend(
      `> <a:r2_rice:868583626227478591> 花瓶在\` ${targetCh} \`沒有\` ${parsePermissions(SETUP_PERMS)} \`權限。`
    );
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("giveaway_btnSetup").setLabel("點擊按鈕以創建抽獎").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "> <a:r3_rice:868583679465758820> 請點擊下方的按鈕以創建抽獎。",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 花瓶已取消抽獎設置，因為沒人理會花瓶。", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "giveaway-modalSetup",
      title: "抽獎設置",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("抽獎時長")
            .setPlaceholder("1s / 1m / 1h / 1d / 1w")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("prize")
            .setLabel("抽獎獎勵")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("中獎人數")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("roles")
            .setLabel("可參與的人員須包含的身份組")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("host")
            .setLabel("主辦者的使用者代號")
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
      filter: (m) => m.customId === "giveaway-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 花瓶已取消抽獎設置，因為沒人理會花瓶。", components: [] });

  sentMsg.delete().catch(() => {});
  await modal.reply("<a:r3_rice:868583679465758820> 花瓶正在創建抽獎");

  // duration
  const duration = ems(modal.fields.getTextInputValue("duration"));
  if (isNaN(duration)) return modal.editReply("> <a:r2_rice:868583626227478591> 花瓶已取消抽獎設置，因為你沒有輸入時間。");

  // prize
  const prize = modal.fields.getTextInputValue("prize");

  // winner count
  const winners = parseInt(modal.fields.getTextInputValue("winners"));
  if (isNaN(winners)) return modal.editReply("> <a:r2_rice:868583626227478591> 花瓶已取消抽獎設置，因為你沒有輸入中獎人數。");

  // roles
  const allowedRoles =
    modal.fields
      .getTextInputValue("roles")
      ?.split("︱")
      ?.filter((roleId) => guild.roles.cache.get(roleId.trim())) || [];

  // host
  const hostId = modal.fields.getTextInputValue("host");
  let host = null;
  if (hostId) {
    try {
      host = await guild.client.users.fetch(hostId);
    } catch (ex) {
      return modal.editReply("> <a:r2_rice:868583626227478591> 花瓶已取消抽獎設置，因為你沒有輸入主辦者的使用者代號。");
    }
  }

  const response = await start(member, targetCh, duration, prize, winners, host, allowedRoles);
  await modal.editReply(response);
}

// Interactive Giveaway Update
/**
 * @param {import('discord.js').Message} message
 * @param {string} messageId
 */
async function runModalEdit(message, messageId) {
  const { member, channel } = message;

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("giveaway_btnEdit").setLabel("點擊按鈕以編輯抽獎").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.send({
    content: "> <a:r3_rice:868583679465758820> 請點擊下方按鈕以編輯抽獎。",
    components: [buttonRow],
  });

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnEdit" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 花瓶已取消抽獎編輯，因為沒人理會花瓶。", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "giveaway-modalEdit",
      title: "抽獎更新",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("增加時長")
            .setPlaceholder("1s / 1m / 1h / 1d / 1w")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("prize")
            .setLabel("增加獎勵")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("增加獲獎人數")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "giveaway-modalEdit" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "> <a:r2_rice:868583626227478591> 花瓶已取消抽獎編輯，因為沒人理會花瓶。", components: [] });

  sentMsg.delete().catch(() => {});
  await modal.reply("> <a:r3_rice:868583679465758820> 抽獎編輯中");

  // duration
  const addDuration = ems(modal.fields.getTextInputValue("duration"));
  if (isNaN(addDuration)) return modal.editReply("> <a:r2_rice:868583626227478591> 花瓶已取消抽獎編輯，因為你沒有輸入時間。");

  // prize
  const newPrize = modal.fields.getTextInputValue("prize");

  // winner count
  const newWinnerCount = parseInt(modal.fields.getTextInputValue("winners"));
  if (isNaN(newWinnerCount)) {
    return modal.editReply("> <a:r2_rice:868583626227478591> 花瓶已取消抽獎編輯，因為你沒有輸入獲獎人數。");
  }

  const response = await edit(message.member, messageId, addDuration, newPrize, newWinnerCount);
  await modal.editReply(response);
}
