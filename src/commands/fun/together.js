const { ApplicationCommandOptionType } = require("discord.js");

const discordTogether = [
  "askaway",
  "awkword",
  "betrayal",
  "bobble",
  "checkers",
  "chess",
  "chessdev",
  "doodlecrew",
  "fishing",
  "land",
  "lettertile",
  "meme",
  "ocho",
  "poker",
  "puttparty",
  "puttpartyqa",
  "sketchheads",
  "sketchyartist",
  "spellcast",
  "wordsnack",
  "youtube",
  "youtubedev",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "趣味語音活動",
  description: "discord 語音活動",
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["discordtogether"],
    usage: "<類型>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "類型",
        description: "類型",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: discordTogether.map((game) => ({ name: game, value: game })),
      },
    ],
  },

  async messageRun(message, args) {
    const input = args[0];
    const response = await getTogetherInvite(message.member, input);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("類型");
    const response = await getTogetherInvite(interaction.member, choice);
    await interaction.followUp(response);
  },
};

async function getTogetherInvite(member, choice) {
  choice = choice.toLowerCase();

  const vc = member.voice.channel?.id;
  if (!vc) return "> <a:r2_rice:868583626227478591> 你需要在一個允許活動的語音房中才能使用此指令。";

  if (!discordTogether.includes(choice)) {
    return `> <a:r2_rice:868583626227478591> 無效的活動類別，\n> <a:r2_rice:868583626227478591> 目前只允許這些活動類別：\` ${discordTogether.join(" | ")} \`。`;
  }

  const invite = await member.client.discordTogether.createTogetherCode(vc, choice);
  return `${invite.code}`;
}
