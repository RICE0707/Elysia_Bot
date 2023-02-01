const user = require("../shared/user");
const channelInfo = require("../shared/channel");
const guildInfo = require("../shared/guild");
const avatar = require("../shared/avatar");
const emojiInfo = require("../shared/emoji");
const botInfo = require("../shared/botstats");
const brilliantInfo = require("../shared/brilliant");
const teamInfo = require("../shared/team");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "資訊查看",
  description: "查看各種資訊",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者",
        description: "取得使用者資訊",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "名稱",
            description: "輸入使用者名稱",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "頻道",
        description: "取得使用者資訊",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "名稱",
            description: "輸入頻道名稱",
            type: ApplicationCommandOptionType.Channel,
            required: false,
          },
        ],
      },
      {
        name: "群組",
        description: "取得群組資訊",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "機器人",
        description: "取得機器人資訊",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "頭像",
        description: "取得使用者頭像",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "名稱",
            description: "輸入使用者名稱",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "表情符號",
        description: "取得表情符號資訊",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "名稱",
            description: "輸入表情符號名稱",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "輝煌伺服器",
        description: "取得輝煌伺服器的資訊",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "輝煌團隊",
        description: "取得輝煌團隊的資訊",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？");
    let response;

    // user
    if (sub === "使用者") {
      let targetUser = interaction.options.getUser("名稱") || interaction.user;
      let target = await interaction.guild.members.fetch(targetUser);
      response = user(target);
    }

    // channel
    else if (sub === "頻道") {
      let targetChannel = interaction.options.getChannel("名稱") || interaction.channel;
      response = channelInfo(targetChannel);
    }

    // guild
    else if (sub === "群組") {
      response = await guildInfo(interaction.guild);
    }

    // bot
    else if (sub === "機器人") {
      response = botInfo(interaction.client);
    }

    // avatar
    else if (sub === "頭像") {
      let target = interaction.options.getUser("名稱") || interaction.user;
      response = avatar(target);
    }

    // emoji
    else if (sub === "表情符號") {
      let emoji = interaction.options.getString("名稱");
      response = emojiInfo(emoji);
    }

    // brilliant
    else if (sub === "輝煌伺服器") {
      response = await brilliantInfo(interaction.guild);
    }

    // team
    else if (sub === "輝煌團隊") {
      response = await teamInfo(interaction.guild);
    }

    // return
    else {
      response = "> <a:r2_rice:868583626227478591> 無效的指令用法，你真的會用指令嗎？";
    }

    await interaction.followUp(response);
  },
};
