/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊延遲",
  description: "查看機器人延遲",
  category: "資訊類",
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },

  async messageRun(message, args) {
    await message.safeReply(`> <a:r3_rice:868583679465758820> 目前花瓶的延遲為：\` ${Math.floor(message.client.ws.ping)} ms\`。`);
  },

  async interactionRun(interaction) {
    await interaction.followUp(`> <a:r3_rice:868583679465758820> 目前花瓶的延遲為：\` ${Math.floor(interaction.client.ws.ping)} ms \`。`);
  },
};
