const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理機器人前綴",
  description: "設置機器人前綴",
  category: "管理類",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<前綴>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "前綴",
        description: "輸入前綴",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const newPrefix = args[0];
    const response = await setNewPrefix(newPrefix, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setNewPrefix(interaction.options.getString("前綴"), data.settings);
    await interaction.followUp(response);
  },
};

async function setNewPrefix(newPrefix, settings) {
  if (newPrefix.length > 2) return "> <a:r2_rice:868583626227478591> 機器人花瓶的不可超過` 2 `個字符。";
  settings.prefix = newPrefix;
  await settings.save();

  return `> <a:r3_rice:868583679465758820> 已將花瓶的前綴設置為：\` ${newPrefix} \`。`;
}
