const { EmbedBuilder } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.available) return;
  client.logger.log(`花瓶離開了：${guild.name}，減少了：${guild.memberCount}位使用者。`);

  const settings = await getSettings(guild);
  settings.data.leftAt = new Date();
  await settings.save();

  if (!client.joinLeaveWebhook) return;

  let ownerTag;
  const ownerId = guild.ownerId || settings.data.owner;
  try {
    const owner = await client.users.fetch(ownerId);
    ownerTag = owner.tag;
  } catch (err) {
    ownerTag = "已刪除的使用者";
  }

  const embed = new EmbedBuilder()
    .setTitle("嗚嗚嗚嗚，花瓶被踢掉了啦")
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.ERROR)
    .addFields(
      {
        name: "群名稱",
        value: `\` ${guild.name} \`` || "無",
        inline: false,
      },
      {
        name: "群代號",
        value: `\` ${guild.id} \``,
        inline: false,
      },
      {
        name: "所有者",
        value: `\` ${ownerTag} \`（\` ${ownerId} \`）`,
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
    username: "離開紀錄",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};
