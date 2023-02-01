const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMemberStats } = require("@schemas/MemberStats");
const { EMBED_COLORS } = require("@root/config");
const { stripIndents } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "統計資訊",
  description: "查看使用者在本群的統計資訊",
  cooldown: 5,
  category: "STATS",
  command: {
    enabled: true,
    usage: "[@使用者|使用者代碼]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者",
        description: "選擇使用者",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await stats(target, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const member = interaction.options.getMember("使用者") || interaction.member;
    const response = await stats(member, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {object} settings
 */
async function stats(member, settings) {
  if (!settings.stats.enabled) return "> <a:r2_rice:868583626227478591> 這個群組未啟用統計數據功能。";
  const memberStats = await getMemberStats(member.guild.id, member.id);

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "使用者名稱",
        value: member.user.tag,
        inline: true,
      },
      {
        name: "使用者代碼",
        value: member.id,
        inline: true,
      },
      {
        name: "入本群時間",
        value: `<t:${parseInt(member.joinedAt / 1000)}:f>`,
        inline: false,
      },
      {
        name: "已發送訊息",
        value: stripIndents`
      ├ 傳送的訊息數：${memberStats.messages}
      ├ 用前綴指令數：${memberStats.commands.prefix}
      ├ 用斜線指令數：${memberStats.commands.slash}
      ├ 當前的經驗值：${memberStats.xp}
      └ 當前的等級數：${memberStats.level}
    `,
        inline: false,
      },
      {
        name: "語音統計數",
        value: stripIndents`
      ├ 連接的次數：${memberStats.voice.connections}
      └ 連結總時長：${Math.floor(memberStats.voice.time / 60)} 分
    `,
      }
    )

    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setTimestamp();

  return { embeds: [embed] };
}
