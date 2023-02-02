const deafen = require("../shared/deafen");
const vmute = require("../shared/vmute");
const vunmute = require("../shared/vunmute");
const undeafen = require("../shared/undeafen");
const disconnect = require("../shared/disconnect");
const move = require("../shared/move");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理語音",
  description: "語音管理",
  category: "實用類",
  userPermissions: ["MuteMembers", "MoveMembers", "DeafenMembers"],
  botPermissions: ["MuteMembers", "MoveMembers", "DeafenMembers"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "禁音",
        description: "禁音指定使用者",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "解除禁音",
        description: "解除禁音指定使用者",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "拒聽",
        description: "使指定語音使用者拒聽",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "解除拒聽",
        description: "解除指定語音使用者的拒聽",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "踢出語音",
        description: "踢出語音使用者",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "移動",
        description: "移動語音使用者",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "使用者",
            description: "選擇使用者",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "頻道",
            description: "選擇頻道",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
            required: true,
          },
          {
            name: "原因",
            description: "輸入原因",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    const reason = interaction.options.getString("原因");

    const user = interaction.options.getUser("使用者");
    const target = await interaction.guild.members.fetch(user.id);

    let response;

    if (sub === "禁音") response = await vmute(interaction, target, reason);
    else if (sub === "解除禁音") response = await vunmute(interaction, target, reason);
    else if (sub === "拒聽") response = await deafen(interaction, target, reason);
    else if (sub === "解除拒聽") response = await undeafen(interaction, target, reason);
    else if (sub === "踢出語音") response = await disconnect(interaction, target, reason);
    else if (sub == "移動") {
      const channel = interaction.options.getChannel("頻道");
      response = await move(interaction, target, reason, channel);
    }

    await interaction.followUp(response);
  },
};
