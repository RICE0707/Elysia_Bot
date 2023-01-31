const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");
const { timeformat } = require("@helpers/Utils");
const os = require("os");
const { stripIndent } = require("common-tags");

/**
 * @param {import('@structures/BotClient')} client
 */
module.exports = (client) => {
  // STATS
  const guilds = client.guilds.cache.size;
  const channels = client.channels.cache.size;
  const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);

  // CPU
  const platform = process.platform.replace(/win32/g, "Windows");
  const architecture = os.arch();
  const cores = os.cpus().length;
  const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`;

  // RAM
  const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
  const botAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const botUsage = `${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1)}%`;

  const overallUsed = `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallUsage = `${Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%`;

  let desc = "";
  desc += `❒ 群組總數：${guilds}\n`;
  desc += `❒ 使用者總數：${users}\n`;
  desc += `❒ 頻道總數：${channels}\n`;
  desc += `❒ 機器人延遲：${client.ws.ping} ms\n`;
  desc += "\n";

  const embed = new EmbedBuilder()
    .setAuthor({ name: '機器人資訊', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(desc)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .addFields(
      {
        name: "處理器",
        value: stripIndent`
        ├ **作業系統**：${platform} [${architecture}]
        ├ **核心數**：${cores}
        └ **使用量**：${cpuUsage}
        `,
        inline: true,
      },
      {
        name: "記憶體 (Bot)",
        value: stripIndent`
        ├ **已使用**：${botUsed}
        ├ **可使用**：${botAvailable}
        └ **使用量**：${botUsage}
        `,
        inline: true,
      },
      {
        name: "記憶體 (總共)",
        value: stripIndent`
        ├ **已使用**：${overallUsed}
        ├ **可使用**：${overallAvailable}
        └ **使用量**：${overallUsage}
        `,
        inline: true,
      },
      {
        name: "Node.Js 版本",
        value: process.versions.node,
        inline: false,
      },
      {
        name: "機器人正常運行時間",
        value: "```" + timeformat(process.uptime()) + "```",
        inline: false,
      }
    );

  // Buttons
  let components = [];
  components.push(new ButtonBuilder().setLabel("邀請連結").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel("支援群組").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel("面板連結").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);

  return { embeds: [embed], components: [buttonsRow] };
};
