const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請獎勵身份組設置",
  description: "設置邀請獎勵身份組",
  category: "邀請類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<身份組> <邀請點數>",
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "新增 <身份組> <邀請點數>",
        description: "邀請點數達到一定數量後的獎勵身份組",
      },
      {
        trigger: "移除身份組",
        description: "移除邀請獎勵身份組",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "新增",
        description: "邀請點數達到一定數量後的獎勵身份組",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "身份組",
            description: "輸入身份組",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "邀請次數",
            description: "輸入數字",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "移除",
        description: "移除邀請獎勵身份組",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "身份組",
            description: "輸入身份組",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();

    if (sub === "新增") {
      const query = args[1];
      const invites = args[2];

      if (isNaN(invites)) return message.safeReply(`> <a:r2_rice:868583626227478591 \` ${invites} \` 不是一個數字。`);
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`> <a:r2_rice:868583626227478591 花瓶找不到\` ${query} \`。`);

      const response = await addInviteRank(message, role, invites, data.settings);
      await message.safeReply(response);
    }

    //
    else if (sub === "移除") {
      const query = args[1];
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`> <a:r2_rice:868583626227478591 花瓶找不到\` ${query} \`。`);
      const response = await removeInviteRank(message, role, data.settings);
      await message.safeReply(response);
    }

    //
    else {
      await message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
    }
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    //
    if (sub === "新增") {
      const role = interaction.options.getRole("身份組");
      const invites = interaction.options.getInteger("邀請次數");

      const response = await addInviteRank(interaction, role, invites, data.settings);
      await interaction.followUp(response);
    }

    //
    else if (sub === "移除") {
      const role = interaction.options.getRole("身份組");
      const response = await removeInviteRank(interaction, role, data.settings);
      await interaction.followUp(response);
    }
  },
};

async function addInviteRank({ guild }, role, invites, settings) {
  if (!settings.invite.tracking) return `> <a:r2_rice:868583626227478591> 這個群組沒有開啟邀請統計。`;

  if (role.managed) {
    return "> <a:r2_rice:868583626227478591> 你不能讓機器人分配這個身份組。";
  }

  if (guild.roles.everyone.id === role.id) {
    return "> <a:r2_rice:868583626227478591> 你不能讓機器人分配這個身份組。";
  }

  if (!role.editable) {
    return "> <a:r2_rice:868583626227478591> 機器人不能分配這個身份組，因為這個身份組的位置比機器人高。";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

  let msg = "";
  if (exists) {
    exists.invites = invites;
    msg += "> <a:r3_rice:868583679465758820> 已找到之前設置的獎勵數據，已覆蓋。\n";
  }

  settings.invite.ranks.push({ _id: role.id, invites });
  await settings.save();
  return `> <a:r3_rice:868583679465758820> 已保存配置。`;
}

async function removeInviteRank({ guild }, role, settings) {
  if (!settings.invite.tracking) return `> <a:r2_rice:868583626227478591> 這個群組沒有開啟邀請統計。`;

  if (role.managed) {
    return "> <a:r2_rice:868583626227478591> 你不能讓機器人分配這個身份組。";
  }

  if (guild.roles.everyone.id === role.id) {
    return "> <a:r2_rice:868583626227478591> 你不能讓機器人分配這個身份組。";
  }

  if (!role.editable) {
    return "> <a:r2_rice:868583626227478591> 機器人不能分配這個身份組，因為這個身份組的位置比機器人高。";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
  if (!exists) return "> <a:r2_rice:868583626227478591> 未找到之前設置的獎勵數據，無法覆蓋。";

  // delete element from array
  const i = settings.invite.ranks.findIndex((obj) => obj._id === role.id);
  if (i > -1) settings.invite.ranks.splice(i, 1);

  await settings.save();
  return "> <a:r3_rice:868583679465758820> 已保存配置。";
}
