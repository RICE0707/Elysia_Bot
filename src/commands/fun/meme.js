const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { getRandomInt } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味迷因",
  description: "每個人都應該用一次這個指令，加入我大meme世界！！！",
  category: "趣味類",
  botPermissions: ["EmbedLinks"],
  cooldown: 20,
  command: {
    enabled: true,
    usage: "[類型]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "類型",
        description: "迷因類型",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args[0];

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("regenMemeBtn").setStyle(ButtonStyle.Secondary).setEmoji("🔁")
    );
    const embed = await getRandomEmbed(choice);

    const sentMsg = await message.safeReply({
      embeds: [embed],
      components: [buttonRow],
    });

    const collector = message.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === message.author.id,
      time: this.cooldown * 1000,
      max: 3,
      dispose: true,
    });

    collector.on("collect", async (response) => {
      if (response.customId !== "regenMemeBtn") return;
      await response.deferUpdate();

      const embed = await getRandomEmbed(choice);
      await sentMsg.edit({
        embeds: [embed],
        components: [buttonRow],
      });
    });

    collector.on("end", () => {
      buttonRow.components.forEach((button) => button.setDisabled(true));
      return sentMsg.edit({
        components: [buttonRow],
      });
    });
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("類型");

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("regenMemeBtn").setStyle(ButtonStyle.Secondary).setEmoji("🔁")
    );
    const embed = await getRandomEmbed(choice);

    await interaction.followUp({
      embeds: [embed],
      components: [buttonRow],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === interaction.user.id,
      time: this.cooldown * 1000,
      max: 3,
      dispose: true,
    });

    collector.on("collect", async (response) => {
      if (response.customId !== "regenMemeBtn") return;
      await response.deferUpdate();

      const embed = await getRandomEmbed(choice);
      await interaction.editReply({
        embeds: [embed],
        components: [buttonRow],
      });
    });

    collector.on("end", () => {
      buttonRow.components.forEach((button) => button.setDisabled(true));
      return interaction.editReply({
        components: [buttonRow],
      });
    });
  },
};

async function getRandomEmbed(choice) {
  const subReddits = ["meme", "Memes_Of_The_Dank", "memes", "dankmemes"];
  let rand = choice ? choice : subReddits[getRandomInt(subReddits.length)];

  const response = await getJson(`https://www.reddit.com/r/${rand}/random/.json`);
  if (!response.success) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("> <a:r2_rice:868583626227478591> 花瓶的瓶子裏沒有這個迷因，請稍後再嘗試。");
  }

  const json = response.data;
  if (!Array.isArray(json) || json.length === 0) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription(`> <a:r2_rice:868583626227478591> 找不到迷因：\` ${choice} \`。`);
  }

  try {
    let permalink = json[0].data.children[0].data.permalink;
    let memeUrl = `https://reddit.com${permalink}`;
    let memeImage = json[0].data.children[0].data.url;
    let memeTitle = json[0].data.children[0].data.title;
    let memeUpvotes = json[0].data.children[0].data.ups;
    let memeNumComments = json[0].data.children[0].data.num_comments;

    return new EmbedBuilder()
      .setAuthor({ name: memeTitle, url: memeUrl })
      .setImage(memeImage)
      .setColor("Random")
      .setTimestamp()
      .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 取自於reddit - 👍 ${memeUpvotes} | 💬 ${memeNumComments}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });
  } catch (error) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("> <a:r2_rice:868583626227478591> 花瓶的瓶子裏沒有這個迷因，請稍後再嘗試。");
  }
}
