const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "客服單類別",
  description: "管理客服單類別功能",
  category: "客服單",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "類別”",
        description: "",
      },
      {
        trigger: "新增 <類別>︱客服單管理員身份組>",
        description: "新增客服單類別",
      },
      {
        trigger: "移除 <類別>",
        description: "移除客服單類別",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "類別",
        description: "查看所有客服單類別",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "新增",
        description: "新增客服單類別",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "類別",
            description: "輸入類別",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "客服單管理員身份組",
            description: "選擇客服單管理員身份組",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "移除",
        description: "移除客服單類別",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "類別",
            description: "輸入類別",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();
    let response;

    // list
    if (sub === "類別") {
      response = listCategories(data);
    }

    // add
    else if (sub === "新增") {
      const split = args.slice(1).join(" ").split("|");
      const category = split[0].trim();
      const staff_roles = split[1]?.trim();
      response = await addCategory(message.guild, data, category, staff_roles);
    }

    // remove
    else if (sub === "移除") {
      const category = args.slice(1).join(" ").trim();
      response = await removeCategory(data, category);
    }

    // invalid subcommand
    else {
      response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // list
    if (sub === "類別") {
      response = listCategories(data);
    }

    // add
    else if (sub === "新增") {
      const category = interaction.options.getString("類別");
      const staff_roles = interaction.options.getString("客服單管理員身份組");
      response = await addCategory(interaction.guild, data, category, staff_roles);
    }

    // remove
    else if (sub === "移除") {
      const category = interaction.options.getString("類別");
      response = await removeCategory(data, category);
    }

    //
    else response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    await interaction.followUp(response);
  },
};

function listCategories(data) {
  const categories = data.settings.ticket.categories;
  if (categories?.length === 0) return "> <a:r2_rice:868583626227478591> 花瓶找不到這個類別，";

  const fields = [];
  for (const category of categories) {
    const roleNames = category.staff_roles.map((r) => `<@&${r}>`).join(", ");
    fields.push({ name: category.name, value: `**客服管理：**${roleNames || "無"}` });
  }
  const embed = new EmbedBuilder().setAuthor({ name: "客服單類別", iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg', url: 'https://discord.gg/c4tKJME4hE' }).addFields(fields);
  return { embeds: [embed] };
}

async function addCategory(guild, data, category, staff_roles) {
  if (!category) return "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";

  // check if category already exists
  if (data.settings.ticket.categories.find((c) => c.name === category)) {
    return `> <a:r2_rice:868583626227478591> \` ${category} \`已存在。`;
  }

  const staffRoles = (staff_roles?.split(",")?.map((r) => r.trim()) || []).filter((r) => guild.roles.cache.has(r));

  data.settings.ticket.categories.push({ name: category, staff_roles: staffRoles });
  await data.settings.save();

  return `<a:r3_rice:868583679465758820> 已創建\` ${category} \` 類別。`;
}

async function removeCategory(data, category) {
  const categories = data.settings.ticket.categories;
  // check if category exists
  if (!categories.find((c) => c.name === category)) {
    return `> <a:r2_rice:868583626227478591> \` ${category} \`不存在。`;
  }

  data.settings.ticket.categories = categories.filter((c) => c.name !== category);
  await data.settings.save();

  return `<a:r3_rice:868583679465758820> 已移除\` ${category} \` 類別。`;
}
