const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getWarningLogs, clearWarningLogs } = require("@schemas/ModLog");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理警告",
  description: "撤銷警告指定使用者與查看警告列表",
  category: "實用類",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "列表 [使用者]",
        description: "查看指定使用者的警告列表",
      },
      {
        trigger: "撤銷 <使用者>",
        description: "撤銷指定使用者的警告",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "列表",
        description: "查看指定使用者的警告列表",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: "撤銷",
        description: "撤銷指定使用者的警告",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response = "";

    if (sub === "列表") {
      const target = (await message.guild.resolveMember(args[1], true)) || message.member;
      if (!target) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到：\` ${args[1]} \`。`);
      response = await listWarnings(target, message);
    }

    //
    else if (sub === "撤銷") {
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶找不到：\` ${args[1]} \`。`);
      response = await clearWarnings(target, message);
    }

    // else
    else {
      response = `> <a:r2_rice:868583626227478591> 無效的指令用法（\` ${sub} \`），你真的會用指令嗎？`;
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response = "";

    if (sub === "列表") {
      const user = interaction.options.getUser("使用者");
      const target = (await interaction.guild.members.fetch(user.id)) || interaction.member;
      response = await listWarnings(target, interaction);
    }

    //
    else if (sub === "撤銷") {
      const user = interaction.options.getUser("使用者");
      const target = await interaction.guild.members.fetch(user.id);
      response = await clearWarnings(target, interaction);
    }

    // else
    else {
      response = `> <a:r2_rice:868583626227478591> 無效的指令用法（\` ${sub} \`），你真的會用指令嗎？`;
    }

    await interaction.followUp(response);
  },
};

async function listWarnings(target, { guildId }) {
  if (!target) return "> <a:r2_rice:868583626227478591> 未提供給花瓶使用者。";
  if (target.user.bot) return "> <a:r2_rice:868583626227478591> 花瓶不會有警告。";

  const warnings = await getWarningLogs(guildId, target.id);
  if (!warnings.length) return `> <a:r3_rice:868583679465758820> \` ${target.user.tag} \`沒有被警告。`;

  const acc = warnings.map((warning, i) => `#${i + 1} 原因：${warning.reason} [來自 ${warning.admin.tag}]`).join("\n");
  const embed = new EmbedBuilder({
    author: { name: `${target.user.tag} 的警告`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://discord.gg/c4tKJME4hE' },
    description: acc,
  });

  return { embeds: [embed] };
}

async function clearWarnings(target, { guildId }) {
  if (!target) return "> <a:r2_rice:868583626227478591> 未提供給花瓶使用者。";
  if (target.user.bot) return "> <a:r2_rice:868583626227478591> 花瓶不會有警告。";

  const memberDb = await getMember(guildId, target.id);
  memberDb.warnings = 0;
  await memberDb.save();

  await clearWarningLogs(guildId, target.id);
  return `> <a:r3_rice:868583679465758820> \` ${target.user.tag} \`的警告已被撤銷。`;
}
