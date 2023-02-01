const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, VOTEA_SERVER, VOTEB_SERVER, DASHBOARD } = require("@root/config");

module.exports = (client) => {
  const embed = new EmbedBuilder()
    .setTitle({ name: "機器人邀請資訊" })
    .setAuthor({ name: '你就是個偷窺狂吧！', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setDescription("> 本機器人由\` RiceChen_#0707 \`維護，\n> 使用\` GNU Affero General Public License v3.0 \`，\n> 目前擁有\` 15 \`大類功能，\n> 包含\` 86 \`條斜線指令，與近\` 300 \`項的細節選項，\n> 不過目前主機設備沒有很好，花瓶可能會過勞死= =");

  // Buttons
  let components = [];
  components.push(new ButtonBuilder().setLabel("邀請連結").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel("支援群組").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }
  
  if (VOTEA_SERVER) {
    components.push(new ButtonBuilder().setLabel("給機器人投票").setURL(VOTEA_SERVER).setStyle(ButtonStyle.Link));
  }
  
  if (VOTEB_SERVER) {
    components.push(new ButtonBuilder().setLabel("給群組投票").setURL(VOTEB_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel("面板連結").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
};
