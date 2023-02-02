const { approveSuggestion, rejectSuggestion } = require("@handlers/suggestion");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const CHANNEL_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks", "ManageMessages", "ReadMessageHistory"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "建議設置",
  description: "管理建議系統",
  category: "建議類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "狀態 <開啟︱關閉>",
        description: "是否啟用建議系統",
      },
      {
        trigger: "頻道 <頻道︱關閉>",
        description: "設置建議頻道",
      },
      {
        trigger: "批准設置 <頻道︱關閉>",
        description: "設置批准建議頻道",
      },
      {
        trigger: "否決設置 <頻道︱關閉>",
        description: "設置否決建議頻道",
      },
      {
        trigger: "批准 <頻道> <訊息代號> [原因]",
        description: "批准建議",
      },
      {
        trigger: "否決 <頻道> <訊息代號> [原因]",
        description: "否決建議",
      },
      {
        trigger: "新增 <身份組代號>",
        description: "新增建議管理員",
      },
      {
        trigger: "移除 <身份組代號>",
        description: "移除建議管理員",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "狀態",
        description: "是否啟用建議系統",
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
        name: "頻道",
        description: "設置建議頻道",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道名稱",
            description: "輸入頻道名稱",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "批准設置",
        description: "設置批准建議頻道",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道名稱",
            description: "輸入頻道名稱",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "否決設置",
        description: "設置否決建議頻道",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道名稱",
            description: "輸入頻道名稱",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "批准",
        description: "批准建議",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道名稱",
            description: "輸入頻道名稱",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "訊息代號",
            description: "輸入訊息代號",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "否決",
        description: "否決建議",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "頻道名稱",
            description: "輸入頻道名稱",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "訊息代號",
            description: "輸入訊息代號",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "新增",
        description: "新增建議管理員",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "身份組代號",
            description: "輸入身份組代號",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: "移除",
        description: "移除建議管理員",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "身份組代號",
            description: "輸入身份組代號",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    let response;

    // status
    if (sub == "狀態") {
      const status = args[1]?.toUpperCase();
      if (!status || !["是", "否"].includes(status))
        return message.safeReply("> <a:r2_rice:868583626227478591> 請在這兩個選項中選擇其一：` 是︱否 `。");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "頻道") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `> <a:r2_rice:868583626227478591> 花瓶找不到\` ${input} \`。`;
      else if (matched.length > 1) response = `> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${input} \`，請提供頻道代碼。`;
      else response = await setChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "批准設置") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `> <a:r2_rice:868583626227478591> 花瓶找不到\` ${input} \`。`;
      else if (matched.length > 1) response = `> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${input} \`，請提供頻道代碼。`;
      else response = await setApprovedChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "否決設置") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `> <a:r2_rice:868583626227478591> 花瓶找不到\` ${input} \`。`;
      else if (matched.length > 1) response = `> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${input} \`，請提供頻道代碼。`;
      else response = await setRejectedChannel(data.settings, matched[0]);
    }

    // approve
    else if (sub == "批准") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `> <a:r2_rice:868583626227478591> 花瓶找不到\` ${input} \`。`;
      else if (matched.length > 1) response = `> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${input} \`，請提供頻道代碼。`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await approveSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // reject
    else if (sub == "否決") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `> <a:r2_rice:868583626227478591> 花瓶找不到\` ${input} \`。`;
      else if (matched.length > 1) response = `> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${input} \`，請提供頻道代碼。`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await rejectSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // staffadd
    else if (sub == "新增") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `> <a:r2_rice:868583626227478591> 花瓶找不到\` ${input} \`。`;
      else if (matched.length > 1) response = `> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${input} \`，請提供身份組代碼。`;
      else response = await addStaffRole(data.settings, matched[0]);
    }

    // staffremove
    else if (sub == "移除") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `> <a:r2_rice:868583626227478591> 花瓶找不到\` ${input} \`。`;
      else if (matched.length > 1) response = `> <a:r2_rice:868583626227478591> 花瓶找到多個\` ${input} \`，請提供身份組代碼。`;
      else response = await removeStaffRole(data.settings, matched[0]);
    }

    // else
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub == "狀態") {
      const status = interaction.options.getString("是否啟用");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "頻道") {
      const channel = interaction.options.getChannel("頻道名稱");
      response = await setChannel(data.settings, channel);
    }

    // app_channel
    else if (sub == "批准設置") {
      const channel = interaction.options.getChannel("頻道名稱");
      response = await setApprovedChannel(data.settings, channel);
    }

    // rej_channel
    else if (sub == "否決設置") {
      const channel = interaction.options.getChannel("頻道名稱");
      response = await setRejectedChannel(data.settings, channel);
    }

    // approve
    else if (sub == "批准") {
      const channel = interaction.options.getChannel("頻道名稱");
      const messageId = interaction.options.getString("訊息代號");
      response = await approveSuggestion(interaction.member, channel, messageId);
    }

    // reject
    else if (sub == "否決") {
      const channel = interaction.options.getChannel("頻道名稱");
      const messageId = interaction.options.getString("訊息代號");
      response = await rejectSuggestion(interaction.member, channel, messageId);
    }

    // staffadd
    else if (sub == "新增") {
      const role = interaction.options.getRole("身份組代號");
      response = await addStaffRole(data.settings, role);
    }

    // staffremove
    else if (sub == "移除") {
      const role = interaction.options.getRole("身份組代號");
      response = await removeStaffRole(data.settings, role);
    }

    // else
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    await interaction.followUp(response);
  },
};

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "是" ? true : false;
  settings.suggestions.enabled = enabled;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 花瓶已\` ${enabled ? "啟用" : "關閉"} \`建議功能。`;
}

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null;
    await settings.save();
    return "> <a:r3_rice:868583679465758820> 花瓶已關閉建議功能。";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `> <a:r2_rice:868583626227478591> 花瓶需要在 ${channel} 中擁有\` ${parsePermissions(CHANNEL_PERMS)} \`權限。`;
  }

  settings.suggestions.channel_id = channel.id;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 現在建議將被花瓶發送至 ${channel}。`;
}

async function setApprovedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.approved_channel = null;
    await settings.save();
    return "> <a:r3_rice:868583679465758820> 花瓶已關閉建議批准功能。";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `> <a:r2_rice:868583626227478591> 花瓶需要在 ${channel} 中擁有\` ${parsePermissions(CHANNEL_PERMS)} \`權限`;
  }

  settings.suggestions.approved_channel = channel.id;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 現在批准建議將被花瓶發送至 ${channel}。`;
}

async function setRejectedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.rejected_channel = null;
    await settings.save();
    return "> <a:r3_rice:868583679465758820> 花瓶已關閉建議否決功能。";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `> <a:r2_rice:868583626227478591> 花瓶需要在 ${channel} 中擁有\` ${parsePermissions(CHANNEL_PERMS)} \`權限`;
  }

  settings.suggestions.rejected_channel = channel.id;
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 現在否決將被發送至 ${channel}。`;
}

async function addStaffRole(settings, role) {
  if (settings.suggestions.staff_roles.includes(role.id)) {
    return `> <a:r3_rice:868583679465758820> \` ${role.name} \`已經是建議管理員。`;
  }
  settings.suggestions.staff_roles.push(role.id);
  await settings.save();
  return `\`> <a:r2_rice:868583626227478591> 現在\` ${role.name} \`是建議管理員了。`;
} 

async function removeStaffRole(settings, role) {
  if (!settings.suggestions.staff_roles.includes(role.id)) {
    return `> <a:r2_rice:868583626227478591> \` ${role} \`不是建議管理員。`;
  }
  settings.suggestions.staff_roles.splice(settings.suggestions.staff_roles.indexOf(role.id), 1);
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 現在\` ${role.name} \`已不是建議管理員。`;
}
