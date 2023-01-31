const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理國家旗幟表符翻譯",
  description: "開啟後，當一個訊息的有國家旗幟表符時，將自動翻譯成對應語言",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    aliases: ["flagtr"],
    minArgsCount: 1,
    usage: "<開啟|關閉>",
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
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

  async messageRun(message, args, data) {
    const status = args[0].toLowerCase();
    if (!["是", "否"].includes(status)) return message.safeReply("無效的選擇，請在這兩個選項中選擇其一：` 是/否 `。");

    const response = await setFlagTranslation(status, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setFlagTranslation(interaction.options.getString("是否啟用"), data.settings);
    await interaction.followUp(response);
  },
};

async function setFlagTranslation(input, settings) {
  const status = input.toLowerCase() === "是" ? true : false;

  settings.flag_translation.enabled = status;
  await settings.save();

  return `> <a:r3_rice:868583679465758820> 你已成功設置，國家旗幟表符翻譯已\` ${status ? "啟用" : "關閉"}\`。`;
}
