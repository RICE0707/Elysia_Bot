const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (user) => {
  
    const embed = new EmbedBuilder()
      .setTitle(`HI，我是花瓶中突然冒出來的飯娘`)
      .setAuthor({ name: '有關於輝煌團隊的相關資訊', iconURL: 'https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png', url: 'https://www.brilliantw.net/' })
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(`https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png`)
      .setDescription('輝煌團隊始於2019年7月13日，為一個普通的伺服器營運團隊。')
      .addFields(
        { name: `<a:q3_rice:868584244002291802> 名詞解釋`, value: `<:n9_air:898205184746991677>├ 煌務卿 - 官方人員、伺服器管理員\n<:n9_air:898205184746991677>├ 技務士 - 插件技術人員、後端技術人員、綜合技術人員\n<:n9_air:898205184746991677>├ 築務士 - 遊戲建築人員\n<:n9_air:898205184746991677>└ 協務士 - 客服支援人員\n\u200B`},
        { name: `<a:r7_rice:868583884844040222> 團隊成員`, value: `<:n9_air:898205184746991677>├ 煌務卿 - [飯](https://github.com/RICE0707)\n<:n9_air:898205184746991677>├ 煌務卿 - [清遠](https://github.com/Yuruka4312)\n<:n9_air:898205184746991677>├ 煌務卿 - 風城\n<:n9_air:898205184746991677>├ 煌務卿 - [冰](https://github.com/YTiceice)\n<:n9_air:898205184746991677>├ 技務士 - [羽森](https://github.com/NCT-skyouo)\n<:n9_air:898205184746991677>├ 技務士 - [小千](https://github.com/rDruTNT)\n<:n9_air:898205184746991677>├ 技務士 - [菘菘](https://github.com/SiongSng)\n<:n9_air:898205184746991677>├ 技務士 - [SnowFireWolf](https://github.com/SnowFireWolf)\n<:n9_air:898205184746991677>├ 技務士 - [達斯](https://github.com/DasCrystal)\n<:n9_air:898205184746991677>├ 築務士 - 鷺\n<:n9_air:898205184746991677>├ 築務士 - 波波\n<:n9_air:898205184746991677>├ 協務士 - 沙鼠\n<:n9_air:898205184746991677>└ 協務士 - 虎鯨\n\u200B`},
        { name: `<:n0_rice:868584523980488715> 相關連結`, value: `\u200B`},
        { name: `官方網站`, value: `[點此前往](https://www.brilliantw.net)`,inline: true},
        { name: `Discord`, value: `[點此前往](https://discord.gg/5MHGpAFGEN)`,inline: true},
        { name: `Instagram`, value: `[點此前往](https://www.instagram.com/brilliant.server)`,inline: true},
        { name: `Facebook`, value: `[點此前往](https://www.facebook.com/Brilliant.Server)`,inline: true},
        { name: `Twitter`, value: `[點此前往](https://twitter.com/BrilliantServer)`,inline: true},
        { name: `GitHub`, value: `[點此前往](https://github.com/BrilliantServer)`,inline: true},
        { name: `每天都可以投一票！`, value: `[點此投票](https://discordservers.tw/servers/762627112867725403)`,inline: true},
    )
    .setTimestamp()
    .setFooter({ text: '輝煌伺服器 - 目前休服中', iconURL: 'https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png' });
  
    return {
      embeds: [embed],
    };
  };