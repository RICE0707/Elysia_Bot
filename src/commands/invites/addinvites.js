const { getEffectiveInvites, checkInviteRewards } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請次數增加",
  description: "增加成員的邀請次數",
  category: "邀請類",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<使用者︱使用者代號> <邀請次數>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者",
        description: "輸入使用者",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "邀請次數",
        description: "輸入數字",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    const amount = parseInt(args[1]);

    if (!target) return message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
    if (isNaN(amount)) return message.safeReply("> <a:r2_rice:868583626227478591> 邀請次數必須為數字。");

    const response = await addInvites(message, target.user, parseInt(amount));
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("使用者");
    const amount = interaction.options.getInteger("邀請次數數");
    const response = await addInvites(interaction, user, amount);
    await interaction.followUp(response);
  },
};

async function addInvites({ guild }, user, amount) {
  if (user.bot) return "> <a:r2_rice:868583626227478591> 你不能給花瓶邀請次數。";

  const memberDb = await getMember(guild.id, user.id);
  memberDb.invite_data.added += amount;
  await memberDb.save();

  const embed = new EmbedBuilder()
    .setAuthor({ name: `已給予 ${user.username} 邀請次數。`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setDescription(`\` ${user.tag} \`現在擁有\` ${getEffectiveInvites(memberDb.invite_data)} \`個邀請次數。`);

  checkInviteRewards(guild, memberDb, true);
  return { embeds: [embed] };
}
