const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { isTranslated, logTranslation } = require("@schemas/TranslateLog");
const data = require("@src/data.json");
const { getLanguagesFromEmoji } = require("country-emoji-languages");
const { translate } = require("@helpers/HttpUtils");
const { timeformat } = require("@helpers/Utils");

const TRANSLATE_COOLDOWN = 120;
const cooldownCache = new Map();

/**
 * @param {import('discord.js').User} user
 */
const getTranslationCooldown = (user) => {
  if (cooldownCache.has(user.id)) {
    const remaining = (Date.now() - cooldownCache.get(user.id)) * 0.001;
    if (remaining > TRANSLATE_COOLDOWN) {
      cooldownCache.delete(user.id);
      return 0;
    }
    return TRANSLATE_COOLDOWN - remaining;
  }
  return 0;
};

/**
 * @param {string} emoji
 * @param {import("discord.js").Message} message
 * @param {import("discord.js").User} user
 */
async function handleFlagReaction(emoji, message, user) {
  // cooldown check
  const remaining = getTranslationCooldown(user);
  if (remaining > 0) {
    return message.channel.safeSend(`> <a:r2_rice:868583626227478591> ${user}，你需要等待\` ${timeformat(remaining)} \`後才能再次讓花瓶翻譯。`, 5);
  }

  if (await isTranslated(message, emoji)) return;

  const languages = getLanguagesFromEmoji(emoji);

  // filter languages for which google translation is available
  const targetCodes = languages.filter((language) => data.GOOGLE_TRANSLATE[language] !== undefined);
  if (targetCodes.length === 0) return;

  // remove english if there are other language codes
  if (targetCodes.length > 1 && targetCodes.includes("en")) {
    targetCodes.splice(targetCodes.indexOf("en"), 1);
  }

  let src;
  let desc = "";
  let translated = 0;
  for (const tc of targetCodes) {
    const response = await translate(message.content, tc);
    if (!response) continue;
    src = response.inputLang;
    desc += `**${response.outputLang}:**\n${response.output}\n\n`;
    translated += 1;
  }

  if (translated === 0) return;

  const btnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder({
      url: message.url,
      label: "點此跳轉至原訊息",
      style: ButtonStyle.Link,
    })
  );

  const embed = new EmbedBuilder()
    .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `花瓶的翻譯 ${src}`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://discord.gg/c4tKJME4hE' })
    .setDescription(desc)
    .setFooter({
      text: `來自花瓶星球的科技支援 v3.0 - ${user.tag}`,
      iconURL: user.displayAvatarURL(),
    });

  message.channel.safeSend({ embeds: [embed], components: [btnRow] }).then(
    () => cooldownCache.set(user.id, Date.now()) // set cooldown
  );

  logTranslation(message, emoji);
}

module.exports = {
  handleFlagReaction,
};
