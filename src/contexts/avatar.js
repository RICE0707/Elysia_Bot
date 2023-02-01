const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import('@structures/BaseContext')}
 */
module.exports = {
  name: "使用者頭像",
  description: "取得使用者頭像",
  type: ApplicationCommandType.User,
  enabled: true,
  ephemeral: true,

  async run(interaction) {
    const user = await interaction.client.users.fetch(interaction.targetId);
    const response = getAvatar(user);
    await interaction.followUp(response);
  },
};

function getAvatar(user) {
  const x64 = user.displayAvatarURL({ extension: "png", size: 64 });
  const x128 = user.displayAvatarURL({ extension: "png", size: 128 });
  const x256 = user.displayAvatarURL({ extension: "png", size: 256 });
  const x512 = user.displayAvatarURL({ extension: "png", size: 512 });
  const x1024 = user.displayAvatarURL({ extension: "png", size: 1024 });
  const x2048 = user.displayAvatarURL({ extension: "png", size: 2048 });

  const embed = new EmbedBuilder()
    .setTitle(`${user.username} 的頭像`)
    .setAuthor({ name: '你就是個偷窺狂吧！', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(x2048)
    .setDescription(
      `└ 可選大小連結 ︱[x64](${x64})` +
        ` ︱[x128](${x128})` +
        ` ︱[x256](${x256})` +
        ` ︱[x512](${x512})` +
        ` ︱[x1024](${x1024})` +
        ` ︱[x2048](${x2048})`
    );

  return {
    embeds: [embed],
  };
}
