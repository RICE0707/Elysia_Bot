const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理暱稱",
  description: "管理暱稱",
  category: "實用類",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "設置 <使用者> <暱稱>",
        description: "設置使用者的暱稱",
      },
      {
        trigger: "重置 <使用者>",
        description: "重置使用者的暱稱",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "設置",
        description: "設置使用者的暱稱",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "暱稱",
            description: "輸入暱稱",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "重置",
        description: "重置使用者的暱稱",
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
    const sub = args[0].toLowerCase();

    if (sub === "設置") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("> <a:r2_rice:868583626227478591> 請選擇正確的使用者。");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入暱稱。");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    //
    else if (sub === "重置") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("> <a:r2_rice:868583626227478591> 請選擇正確的使用者。");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("暱稱");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("使用者"));

    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `> <a:r2_rice:868583626227478591> 你沒有權限更改\` ${target.user.tag} \`的暱稱。`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `> <a:r2_rice:868583626227478591> 花瓶沒有權限更改\` ${target.user.tag} \`的暱稱。`;
  }

  try {
    await target.setNickname(name);
    return `> <a:r3_rice:868583679465758820> 花瓶已\` ${name ? "更改" : "重置"} \` \` ${target.user.tag} \`的暱稱。`;
  } catch (ex) {
    return `> <a:r3_rice:868583679465758820> 花瓶無法\` ${name ? "更改" : "重置"} \` \` ${target.displayName} \`的暱稱，你確定你輸入的暱稱正常？`;
  }
}
