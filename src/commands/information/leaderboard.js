const { EmbedBuilder, escapeInlineCode, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getInvitesLb } = require("@schemas/Member");
const { getXpLb } = require("@schemas/MemberStats");
const { getReputationLb } = require("@schemas/User");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊排行榜",
  description: "顯示排行榜",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["lb"],
    minArgsCount: 1,
    usage: "<經驗值|邀請|愛心❤️>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "類型",
        description: "選擇類型",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "經驗值",
            value: "經驗值",
          },
          {
            name: "邀請",
            value: "邀請",
          },
          {
            name: "愛心❤️",
            value: "愛心❤️",
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    let response;

    if (type === "經驗值") response = await getXpLeaderboard(message, message.author, data.settings);
    else if (type === "邀請") response = await getInviteLeaderboard(message, message.author, data.settings);
    else if (type === "愛心❤️") response = await getRepLeaderboard(message.author);
    else response = "> <a:r2_rice:868583626227478591> 未知的類型，請使用：` 經驗值 `、` 邀請 `。";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const type = interaction.options.getString("類型");
    let response;

    if (type === "經驗值") response = await getXpLeaderboard(interaction, interaction.user, data.settings);
    else if (type === "邀請") response = await getInviteLeaderboard(interaction, interaction.user, data.settings);
    else if (type === "愛心❤️") response = await getRepLeaderboard(interaction.user);
    else response = "> <a:r2_rice:868583626227478591> 未知的類型，請使用：` 經驗值 `、` 邀請 `。";

    await interaction.followUp(response);
  },
};

async function getXpLeaderboard({ guild }, author, settings) {
  if (!settings.stats.enabled) return "> <a:r2_rice:868583626227478591> 這個群組沒有啟用經驗值統計。";

  const lb = await getXpLb(guild.id, 10);
  if (lb.length === 0) return "> <a:r2_rice:868583626227478591> 排行榜上沒有使用者。";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**第${(i + 1).toString()}名** - \` ${escapeInlineCode(user.tag)} \`\n`;
    } catch (ex) {
      // Ignore
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "經驗值排行榜", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${author.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}

async function getInviteLeaderboard({ guild }, author, settings) {
  if (!settings.invite.tracking) return "> <a:r2_rice:868583626227478591> 這個群組沒有啟用邀請統計。";

  const lb = await getInvitesLb(guild.id, 10);
  if (lb.length === 0) return "> <a:r2_rice:868583626227478591> 排行榜上沒有使用者。";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const memberId = lb[i].member_id;
      if (memberId === "VANITY") collector += `**第${(i + 1).toString()}名** - 自定義網址 [共${lb[i].invites}次]\n`;
      else {
        const user = await author.client.users.fetch(lb[i].member_id);
        collector += `**第${(i + 1).toString()}名** - ${escapeInlineCode(user.tag)} [共${lb[i].invites}次]\n`;
      }
    } catch (ex) {
      collector += `**第${(i + 1).toString()}名** - 已刪除使用者 [${lb[i].invites}]\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "邀請排行榜", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${author.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}

async function getRepLeaderboard(author) {
  const lb = await getReputationLb(10);
  if (lb.length === 0) return "> <a:r2_rice:868583626227478591> 排行榜上沒有使用者。";

  const collector = lb
    .map((user, i) => `**第${(i + 1).toString()}名** - \` ${escapeInlineCode(user.tag)} \`（共${user.reputation?.received}個）`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setAuthor({ name: "愛心❤️排行榜", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${author.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
