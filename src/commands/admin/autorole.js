const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理入群身份組",
  description: "設置新成員加入時會自動給予的身份組",
  category: "管理類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<身份組|關閉>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "新增",
        description: "設置自動身份組",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "身份組",
            description: "輸入身份組代",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "身份組代碼",
            description: "輸入身份組代碼",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "停用",
        description: "停用入群身份組功能",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args.join(" ");
    let response;

    if (input.toLowerCase() === "off") {
      response = await setAutoRole(message, null, data.settings);
    } else {
      const roles = message.guild.findMatchingRoles(input);
      if (roles.length === 0) response = "> <a:r2_rice:868583626227478591> 身份組不存在。";
      else response = await setAutoRole(message, roles[0], data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // add
    if (sub === "新增") {
      let role = interaction.options.getRole("身份組");
      if (!role) {
        const role_id = interaction.options.getString("身份組代碼");
        if (!role_id) return interaction.followUp("> <a:r2_rice:868583626227478591> 請提供身份組或身份組代碼。");

        const roles = interaction.guild.findMatchingRoles(role_id);
        if (roles.length === 0) return interaction.followUp("> <a:r2_rice:868583626227478591> 身份組不存在。");
        role = roles[0];
      }

      response = await setAutoRole(interaction, role, data.settings);
    }

    // remove
    else if (sub === "停用") {
      response = await setAutoRole(interaction, null, data.settings);
    }

    // default
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";

    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").Message | import("discord.js").CommandInteraction} message
 * @param {import("discord.js").Role} role
 * @param {import("@models/Guild")} settings
 */
async function setAutoRole({ guild }, role, settings) {
  if (role) {
    if (role.id === guild.roles.everyone.id) return "> <a:r2_rice:868583626227478591> 此身份組無法被設置，因為這是everyone身份組。";
    if (!guild.members.me.permissions.has("ManageRoles")) return "> <a:r2_rice:868583626227478591> 花瓶缺少了 ` 管理身份組 ` 的權限。";
    if (guild.members.me.roles.highest.position < role.position)
      return "> <a:r2_rice:868583626227478591> 此身份組無法被分配，因為花瓶沒有權限。";
    if (role.managed) return "> <a:r2_rice:868583626227478591> 此身份組無法被分配，它只能由Discord系統分配。";
  }

  if (!role) settings.autorole = null;
  else settings.autorole = role.id;

  await settings.save();
  return `> <a:r3_rice:868583679465758820> 你已成功設置，自動身份組功能目前已\` ${!role ? "關閉" : "開啟"} \`。`;
}
