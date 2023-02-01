const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const Utils = require("../helpers/Utils");

/**
 * @type {import('@structures/BaseContext')}
 */
module.exports = {
  name: "搶走表情",
  description: "將信息中的表符加入執行的服務器",
  type: ApplicationCommandType.Message,
  enabled: true,
  ephemeral: true,
  userPermissions: ["ManageEmojisAndStickers"],

  async run(interaction) {
    if(!interaction.inCachedGuild()) {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
          .setTitle("我不能在私信用啦！")
          .setColor(EMBED_COLORS.BOT_EMBED)
        ]
      });
    } else {
      await stealEmoji(interaction);
    }
  },
};
/**
 * @param {import('discord.js').MessageContextMenuCommandInteraction} interaction 
 */
async function stealEmoji(interaction){
  await interaction.followUp("> <:p7_rice:868583653523984405> 獲取表情中...");
  const emojis = Utils.extractEmoji(interaction.targetMessage.content);
  if(emojis.length > 5) {
    return await interaction.editReply("> <a:r2_rice:868583626227478591> 這個信息的表情太多了啦")
  }
  const newEmojis = []
  try {
    for(let emoji of emojis){
      const newEmoji = await interaction.guild.emojis.create({
        name: emoji.name,
        attachment: emoji.url
      });
      newEmojis.push({
        identifier: newEmoji.identifier,
        name: emoji.name,
        animated: emoji.animated
      });
    }
  } catch (e) {
    return await interaction.editReply("> <a:r2_rice:868583626227478591> 哎呀！ 運行這個指令讓花瓶不小心碎掉了。\n可能是因爲服務器太多表情，或者機器人被限制了。")
  }
  await interaction.editReply({
    content: "成功增加了表情！",
    embeds:  [
        new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(newEmojis.reduce((acc, {identifier, name, animated}) => acc + `${animated ? `<${identifier}>` : `<:${identifier}>`} \`${name}\`\n`, ""))
      ]
  })
  
}