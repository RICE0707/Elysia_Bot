const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "統計是否啟用",
  description: "是否啟用統計資訊",
  category: "STATS",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    aliases: ["statssystem", "statstracking"],
    usage: "<是|否>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "是否統計",
        description: "是否統計",
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

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["是", "否"].includes(input)) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的選擇，請在這兩個選項中選擇其一：`是/否`。");
    const response = await setStatus(input, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setStatus(interaction.options.getString("是否統計"), data.settings);
    await interaction.followUp(response);
  },
};

async function setStatus(input, settings) {
  const status = input.toLowerCase() === "是" ? true : false;

  settings.stats.enabled = status;
  await settings.save();

  return `> <a:r3_rice:868583679465758820> 已保存設置，現在將${status ? "會" : "不再"}進行統計。`;
}
