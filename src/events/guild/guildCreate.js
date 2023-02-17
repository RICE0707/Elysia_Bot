const { EmbedBuilder } = require("discord.js");
const { getSettings: registerGuild } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.available) return;
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true }).catch(() => {});
  client.logger.log(`花瓶進入了：${guild.name}，增加了：${guild.memberCount}位使用者。`);
  await registerGuild(guild);

  if (!client.joinLeaveWebhook) return;

  const embed = new EmbedBuilder()
    .setTitle("花瓶入侵新群組啦！")
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.SUCCESS)
    .addFields(
      {
        name: "群名稱",
        value: `\` ${guild.name} \``,
        inline: false,
      },
      {
        name: "群代號",
        value: `\` ${guild.id} \``,
        inline: false,
      },
      {
        name: "擁有者",
        value: `\` ${client.users.cache.get(guild.ownerId).tag} \`（\` ${guild.ownerId} \`）`,
        inline: false,
      },
      {
        name: "成員數",
        value: `\`\`\`yaml\n${guild.memberCount}人\`\`\``,
        inline: false,
      }
    )
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 第 ${client.guilds.cache.size} 個群組`, iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' });

  client.joinLeaveWebhook.send({
    username: "加入紀錄",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};
