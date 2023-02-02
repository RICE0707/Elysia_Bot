/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "擁有者離開群組",
  description: "讓機器人離開指定群組",
  category: "擁有者",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["離開"],
    usage: "<群組代號>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args, data) {
    const input = args[0];
    const guild = message.client.guilds.cache.get(input);
    if (!guild) {
      return message.safeReply(
        `> <a:r2_rice:868583626227478591> 找不到此群組，請提供正確的群組代碼。\n> <a:r2_rice:868583626227478591> 你可以使用\` ${data.prefix}findserver \`或\` ${data.prefix} \`來查找正確的群組代碼。`
      );
    }

    const name = guild.name;
    try {
      await guild.leave();
      return message.safeReply(`> <a:r3_rice:868583679465758820> 花瓶離開了：\` ${name} \`。`);
    } catch (err) {
      message.client.logger.error("GuildLeave", err);
      return message.safeReply(`> <a:r2_rice:868583626227478591> 花瓶離不開：\` ${name} \`。`);
    }
  },
};
