const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const Utils = require("../helpers/Utils");

/**
 * @type {import('@structures/BaseContext')}
 */
module.exports = {
  name: "搶奪表情符號",
  description: "將訊息中的表情符號加入到自己的群組（在必要時請尊重著作權）",
  type: ApplicationCommandType.Message,
  enabled: true,
  ephemeral: true,
  userPermissions: ["ManageEmojisAndStickers"],

  async run(interaction) {
    if(!interaction.inCachedGuild()) {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
          .setThumbnail(`https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png`)
          .setAuthor({ name: '你這個大壞蛋！', iconURL: 'https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png', url: 'https://www.brilliantw.net/' })
          .setTitle("花瓶不能在私訊搶奪表情符號啦！")
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
  await interaction.followUp("> <:p7_rice:868583653523984405> 花瓶正在搶奪表情符號中...");
  const emojis = Utils.extractEmoji(interaction.targetMessage.content);
  if(emojis.length > 5) {
    return await interaction.editReply("> <a:r2_rice:868583626227478591> 這個訊息的表情太多了啦")
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
    content: "> <a:r3_rice:868583679465758820> 花瓶搶到了這個表情符號，並放到你的群組啦！",
    embeds:  [
        new EmbedBuilder()
        .setAuthor({ name: '飯娘：你這個大壞蛋！', iconURL: 'https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png', url: 'https://www.brilliantw.net/' })
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(newEmojis.reduce((acc, {identifier, name, animated}) => acc + `${animated ? `<${identifier}>` : `<:${identifier}>`} \`${name}\`\n`, ""))
      ]
  })
  
}