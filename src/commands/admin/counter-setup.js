const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "管理資訊總覽頻道",
  description: "在群組中創建資訊總覽頻道",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  botPermissions: ["ManageChannels"],
  command: {
    enabled: true,
    usage: "<類型> <頻道名稱>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "類型",
        description: "選擇總覽頻道類型",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "總人數",
            value: "總人數",
          },
          {
            name: "成員數",
            value: "成員數",
          },
          {
            name: "機器數",
            value: "機器數",
          },
        ],
      },
      {
        name: "名稱",
        description: "輸入總覽頻道的名稱",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toUpperCase();
    if (!type || !["總人數", "成員數", "機器數"].includes(type)) {
      return message.safeReply("> <a:r2_rice:868583626227478591> 無效的資訊總覽頻道類型，資訊總覽頻道類型必須為：` 總人數 `/` 成員數 `/` 機器數 `其一。");
    }
    if (args.length < 2) return message.safeReply("> <a:r2_rice:868583626227478591> 你未輸入資訊總覽頻道的名稱。");
    args.shift();
    let channelName = args.join(" ");

    const response = await setupCounter(message.guild, type, channelName, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const type = interaction.options.getString("類型");
    const name = interaction.options.getString("名稱");

    const response = await setupCounter(interaction.guild, type.toUpperCase(), name, data.settings);
    return interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} type
 * @param {string} name
 * @param {object} settings
 */
async function setupCounter(guild, type, name, settings) {
  let channelName = name;

  const stats = await guild.fetchMemberStats();
  if (type === "總人數") channelName += ` : ${stats[0]}`;
  else if (type === "成員數") channelName += ` : ${stats[2]}`;
  else if (type === "機器數") channelName += ` : ${stats[1]}`;

  const vc = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: ["Connect"],
      },
      {
        id: guild.members.me.id,
        allow: ["ViewChannel", "ManageChannels", "Connect"],
      },
    ],
  });

  const exists = settings.counters.find((v) => v.counter_type.toUpperCase() === type);
  if (exists) {
    exists.name = name;
    exists.channel_id = vc.id;
  } else {
    settings.counters.push({
      counter_type: type,
      channel_id: vc.id,
      name,
    });
  }

  settings.data.bots = stats[1];
  await settings.save();

  return "> <a:r3_rice:868583679465758820> 你已成功設置資訊總覽頻道。";
}
