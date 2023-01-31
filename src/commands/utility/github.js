const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "實用github",
  description: "查看使用者的GitHub統計資訊",
  cooldown: 10,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["git"],
    usage: "<使用者>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者名稱",
        description: "GitHub 使用者名稱",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const username = args.join(" ");
    const response = await getGithubUser(username, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const username = interaction.options.getString("使用者名稱");
    const response = await getGithubUser(username, interaction.user);
    await interaction.followUp(response);
  },
};

const websiteProvided = (text) => (text.startsWith("http://") ? true : text.startsWith("https://"));

async function getGithubUser(target, author) {
  const response = await getJson(`https://api.github.com/users/${target}`);
  if (response.status === 404) return "```找不到使用該名稱的使用者。```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const {
    login: username,
    name,
    id: githubId,
    avatar_url: avatarUrl,
    html_url: userPageLink,
    followers,
    following,
    bio,
    location,
    blog,
  } = json;

  let website = websiteProvided(blog) ? `[點我前往](${blog})` : "未提供";
  if (website == null) website = "未提供";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `GitHub 名稱：${username}`,
      url: userPageLink,
      iconURL: avatarUrl,
    })
    .addFields(
      {
        name: "使用者資訊",
        value: stripIndent`
        **真實姓名**：${name || "未提供"}
        **所在位置**：${location}
        **GitHub 代號**：${githubId}
        **使用者網站**：${website}\n`,
        inline: true,
      },
      {
        name: "使用者統計",
        value: `**被關注**：*${followers}*\n**追蹤中**：${following}`,
        inline: true,
      }
    )
    .setDescription(`**狀態/簡介**：\n${bio || "未提供"}`)
    .setImage(avatarUrl)
    .setColor(0x6e5494)
    .setTimestamp()
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於 GitHub`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

  return { embeds: [embed] };
}
