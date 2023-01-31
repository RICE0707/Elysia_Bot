const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getBuffer } = require("@helpers/HttpUtils");
const { getImageFromMessage } = require("@helpers/BotUtils");
const { EMBED_COLORS, IMAGE } = require("@root/config.js");

const availableOverlays = [
  "approved",
  "brazzers",
  "gay",
  "halloween",
  "rejected",
  "thuglife",
  "to-be-continued",
  "wasted",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "圖片一般特效",
  description: "將特效結合入圖片",
  cooldown: 5,
  category: "IMAGE",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    aliases: availableOverlays,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "特效",
        description: "特效類型",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: availableOverlays.map((overlay) => ({ name: overlay, value: overlay })),
      },
      {
        name: "使用者",
        description: "選擇使用者",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: "圖片連結",
        description: "輸入圖片連結",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const image = await getImageFromMessage(message, args);

    // use invoke as an endpoint
    const url = getOverlay(data.invoke.toLowerCase(), image);
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!response.success) return message.safeReply("> <a:r2_rice:868583626227478591> 花瓶無法生成圖片。");

    const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://attachment.png")
      .setTimestamp()
      .setFooter({ text: `來自花瓶星球的科技支援 v3.0  - 取自於 attachment`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

    await message.safeReply({ embeds: [embed], files: [attachment] });
  },

  async interactionRun(interaction) {
    const author = interaction.user;
    const user = interaction.options.getUser("使用者");
    const imageLink = interaction.options.getString("圖片連結");
    const filter = interaction.options.getString("特效");

    let image;
    if (user) image = user.displayAvatarURL({ size: 256, extension: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, extension: "png" });

    const url = getOverlay(filter, image);
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!response.success) return interaction.followUp("> <a:r2_rice:868583626227478591> 花瓶無法生成圖片。");

    const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://attachment.png")
      .setTimestamp()
      .setFooter({ text: `來自花瓶星球的科技支援 v3.0  - 取自於 attachment`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

    await interaction.followUp({ embeds: [embed], files: [attachment] });
  },
};

function getOverlay(filter, image) {
  const endpoint = new URL(`${IMAGE.BASE_API}/overlays/${filter}`);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}
