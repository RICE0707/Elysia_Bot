const { EmbedBuilder, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { stripIndent } = require("common-tags");
const channelTypes = require("@helpers/channelTypes");

/**
 * @param {import('discord.js').GuildChannel} channel
 */
module.exports = (channel) => {
  const { id, name, parent, position, type } = channel;

  let desc = stripIndent`
      ├ 頻道代碼：\` ${id} \`
      ├ 頻道名稱： <#${id}>
      ├ 頻道類型：\` ${channelTypes(channel.type)} \`
      └ 頻道類別：${parent || "\` 無類別 \`"} \n
      `;

  if (type === ChannelType.GuildText) {
    const { rateLimitPerUser, nsfw } = channel;
    desc += stripIndent`
      <:n9_air:898205184746991677>
      ├ 頻道主題：\` ${channel.topic || "未設置"} \`
      ├ 頻道排序：\` 第 ${position} 位 \`
      ├ 慢速模式：\` ${rateLimitPerUser} 秒 \`
      └ 兒少不宜？\` ${nsfw ? "是" : "否"} \`\n
      `;
  }

  if (type === ChannelType.GuildPublicThread || type === ChannelType.GuildPrivateThread) {
    const { ownerId, archived, locked } = channel;
    desc += stripIndent`
      <:n9_air:898205184746991677>
      ├ 所有者： <@${ownerId}>
      ├ 已存檔？\` ${archived ? "是" : "否"} \`
      └ 已鎖定？\` ${locked ? "是" : "否"} \`\n
      `;
  }

  if (type === ChannelType.GuildNews || type === ChannelType.GuildNewsThread) {
    const { nsfw } = channel;
    desc += stripIndent`
      <:n9_air:898205184746991677> 
      └ 兒少不宜？\` ${nsfw ? "是" : "否"} \`\n
      `;
  }

  if (type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice) {
    const { bitrate, userLimit, full } = channel;
    desc += stripIndent`
      <:n9_air:898205184746991677>
      ├ 頻道位置：\` ${position} \`
      ├ 頻位元率：\` ${bitrate} \`
      ├ 用戶限制：\` ${userLimit} \`
      └ 是否已滿？\` ${full ? "是" : "否"} \`\n
      `;
  }

  const embed = new EmbedBuilder()
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setAuthor({ name: '你就是個偷窺狂吧！', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc);

  return { embeds: [embed] };
};
