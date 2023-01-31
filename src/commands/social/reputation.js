const { getUser } = require("@schemas/User");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { diffHours, getRemainingTime } = require("@helpers/Utils");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "社交愛心",
  description: "贈與或查看使用者愛心❤️",
  category: "SOCIAL",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["reputation"],
    subcommands: [
      {
        trigger: "查看 [使用者]",
        description: "查看使用者的愛心❤️",
      },
      {
        trigger: "贈與 [使用者]",
        description: "贈與使用者愛心❤️",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "查看",
        description: "查看使用者的愛心❤️",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "贈與",
        description: "贈與使用者愛心❤️",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0];
    let response;

    // status
    if (sub === "查看") {
      let target = message.author;
      if (args.length > 1) {
        const resolved = (await message.guild.resolveMember(args[1])) || message.member;
        if (resolved) target = resolved.user;
      }
      response = await viewReputation(target);
    }

    // give
    else if (sub === "贈與") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("> <a:r2_rice:868583626227478591> 請輸入正確的使用者名稱");
      response = await giveReputation(message.author, target.user);
    }

    //
    else {
      response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub === "查看") {
      const target = interaction.options.getUser("使用者") || interaction.user;
      response = await viewReputation(target);
    }

    // give
    if (sub === "贈與") {
      const target = interaction.options.getUser("使用者");
      response = await giveReputation(interaction.user, target);
    }

    await interaction.followUp(response);
  },
};

async function viewReputation(target) {
  const userData = await getUser(target);
  if (!userData) return `> <a:r2_rice:868583626227478591> ${target.tag} 沒有愛心❤️。`;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `${target.username} 的愛心❤️`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      {
        name: "已贈與",
        value: userData.reputation?.given.toString(),
        inline: true,
      },
      {
        name: "已收到",
        value: userData.reputation?.received.toString(),
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function giveReputation(user, target) {
  if (target.bot) return "> <a:r2_rice:868583626227478591> 你不能將愛心❤️贈與給機器人。";
  if (target.id === user.id) return "> <a:r2_rice:868583626227478591> 你不能將愛心❤️贈與給自己。";

  const userData = await getUser(user);
  if (userData && userData.reputation.timestamp) {
    const lastRep = new Date(userData.reputation.timestamp);
    const diff = diffHours(new Date(), lastRep);
    if (diff < 24) {
      const nextUsage = lastRep.setHours(lastRep.getHours() + 24);
      return `> <a:r2_rice:868583626227478591> 你可以在\` ${getRemainingTime(nextUsage)} \`後再次使用此指令。`;
    }
  }

  const targetData = await getUser(target);

  userData.reputation.given += 1;
  userData.reputation.timestamp = new Date();
  targetData.reputation.received += 1;

  await userData.save();
  await targetData.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`你贈與了 ${target.toString()} 一顆愛心❤️`)
    .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - ${user.tag}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
}
