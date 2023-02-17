const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味拋出與翻轉",
  description: "拋出神奇貨幣跟翻轉神奇文字",
  category: "趣味類",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "神奇花瓶",
        description: "拋出神奇花瓶",
      },
      {
        trigger: "神奇文字 <內容>",
        description: "翻轉神奇文字",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "神奇花瓶",
        description: "拋出神奇花瓶",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "神奇文字",
        description: "翻轉神奇文字",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "內容",
            description: "輸入要翻轉的內容",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "神奇花瓶") {
      const items = ["正面", "反面"];
      const toss = items[Math.floor(Math.random() * items.length)];

      message.channel.send({ embeds: [firstEmbed(message.author)] }).then((coin) => {
        // 2nd embed
        setTimeout(() => {
          coin.edit({ embeds: [secondEmbed()] }).catch(() => {});
          // 3rd embed
          setTimeout(() => {
            coin.edit({ embeds: [resultEmbed(toss)] }).catch(() => {});
          }, 2000);
        }, 2000);
      });
    }

    //
    else if (sub === "神奇文字") {
      if (args.length < 2) return message.channel.send("> <a:r2_rice:868583626227478591> 請輸入要翻轉的文字。");
      const input = args.join(" ");
      const response = await flipText(input);
      await message.safeReply(response);
    }

    // else
    else await message.safeReply("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand("type");

    if (sub === "神奇花瓶") {
      const items = ["正面", "反面"];
      const toss = items[Math.floor(Math.random() * items.length)];
      await interaction.followUp({ embeds: [firstEmbed(interaction.user)] });

      setTimeout(() => {
        interaction.editReply({ embeds: [secondEmbed()] }).catch(() => {});
        setTimeout(() => {
          interaction.editReply({ embeds: [resultEmbed(toss)] }).catch(() => {});
        }, 2000);
      }, 2000);
    }

    //
    else if (sub === "神奇文字") {
      const input = interaction.options.getString("內容");
      const response = await flipText(input);
      await interaction.followUp(response);
    }
  },
};

const firstEmbed = (user) =>
  new EmbedBuilder().setColor(EMBED_COLORS.TRANSPARENT).setDescription(`${user.username}拋出了神奇花瓶。`);

const secondEmbed = () => new EmbedBuilder().setDescription("神奇花瓶現在在空中。");

const resultEmbed = (toss) =>
  new EmbedBuilder()
    .setDescription(`拋出了：${toss}`)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1069112418095071296/1076136176622260335/White_background_white_vase_a_little_pink_4k_8a8ff072-975a-413f-9e36-fb679b97b2c9_auto_x2_auto_x2.jpg' })
    .setImage(toss === "正面" ?  "https://cdn.discordapp.com/attachments/1069112418095071296/1069548120146460692/AddText_01-30-05.21.42.png" : "https://cdn.discordapp.com/attachments/1069112418095071296/1069548120461017139/AddText_01-30-05.22.12.png");

async function flipText(text) {
  let builder = "";
  for (let i = 0; i < text.length; i += 1) {
    const letter = text.charAt(i);
    const a = NORMAL.indexOf(letter);
    builder += a !== -1 ? FLIPPED.charAt(a) : letter;
  }
  return builder;
}
