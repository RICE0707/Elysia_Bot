const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { timeformat } = require("@helpers/Utils");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config.js");
const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊機器人資訊",
  description: "查看機器人資訊",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "邀請",
        description: "查看機器人邀請連結",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "狀態",
        description: "查看機器人狀態",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "運作",
        description: "查看機器人正常運作時間",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");

    // Invite
    if (sub === "邀請") {
      const response = botInvite(interaction.client);
      try {
        await interaction.user.send(response);
        return interaction.followUp("> <a:r2_rice:868583626227478591> 花瓶把邀請連結放在你的私訊了！");
      } catch (ex) {
        return interaction.followUp("> <a:r3_rice:868583679465758820> 花瓶無法私訊你，你是不是把權限關了？");
      }
    }

    // Stats
    else if (sub === "狀態") {
      const response = botstats(interaction.client);
      return interaction.followUp(response);
    }

    // Uptime
    else if (sub === "運作") {
      await interaction.followUp(`> <a:r3_rice:868583679465758820> 已運行：\` ${timeformat(process.uptime())} \`。`);
    }
  },
};

function botInvite(client) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "機器人邀請資訊", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("> 本機器人由 RiceChen_#0707 開發，\n> 使用 GNU General Public License v3.0，\n> 目前擁有 15 大類功能，\n> 包含 86 條斜線指令，與近 300 項的細節選項，\n>不過目前主機設備沒有很好，花瓶可能會過勞死= =");

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
}
