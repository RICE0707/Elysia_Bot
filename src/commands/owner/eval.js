const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

// This dummy token will be replaced by the actual token
const DUMMY_TOKEN = "MY_TOKEN_IS_SECRET";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "擁有者評估",
  description: "評估某事",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<腳本>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
    options: [
      {
        name: "表達",
        description: "評估內容",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const input = args.join(" ");

    if (!input) return message.safeReply("> <a:r2_rice:868583626227478591> 請提供代碼以進行評估。");

    let response;
    try {
      const output = eval(input);
      response = buildSuccessResponse(output, message.client);
    } catch (ex) {
      response = buildErrorResponse(ex);
    }
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const input = interaction.options.getString("expression");

    let response;
    try {
      const output = eval(input);
      response = buildSuccessResponse(output, interaction.client);
    } catch (ex) {
      response = buildErrorResponse(ex);
    }
    await interaction.followUp(response);
  },
};

const buildSuccessResponse = (output, client) => {
  // Token protection
  output = require("util").inspect(output, { depth: 0 }).replaceAll(client.token, DUMMY_TOKEN);

  const embed = new EmbedBuilder()
    .setAuthor({ name: "📤 輸出", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
    .setColor("Random")
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};

const buildErrorResponse = (err) => {
  const embed = new EmbedBuilder();
  embed
    .setAuthor({ name: "📤 錯誤", iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
    .setColor(EMBED_COLORS.ERROR)
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
