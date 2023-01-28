const { SlashCommandBuilder, EmbedBuilder } = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`輝煌伺服器資訊`)
		.setDescription(`取得輝煌伺服器的資訊`),

        async execute(interaction) {

            const embed = new EmbedBuilder()
            .setColor(0xd3d7da)
            .setAuthor({ name: '有關於輝煌 Minecraft 伺服器的相關資訊', iconURL: 'https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png', url: 'https://www.brilliantw.net/' })
            .setDescription('輝煌是一個Minecraft伺服器，近期開發開源插件、模組來為麥塊社群提供資源，但他現在在休服中，所以進入不了啦！')
            .setThumbnail(`https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png`)
            .setTitle(`HI，我是花瓶中突然冒出來的飯娘`)
            .addFields(
                { name: `<a:q3_rice:868584244002291802> 基本資訊`, value: `\u200B`},
                { name: `Java 連線位置`, value: `Brilliantw.net`,inline: true},
                { name: `Bedrock 連線位置`, value: `BE.Brilliantw.net`,inline: true},
                { name: `Bedrock 連線端口`, value: `19132`,inline: true},
                { name: `Java 連線版本`, value: `未定`,inline: true},
                { name: `Bedrock 連線版本`, value: `未定`,inline: true},
                { name: `Server 運行機制`, value: `未定`,inline: true},
                { name: `Server 人數上限`, value: `100 人`,inline: true},
                { name: `Server 正版驗證`, value: `開啟`,inline: true},
                { name: `Server 遊玩類型`, value: `生存...？`,inline: true},
                { name: `Server 運行時間`, value: `一種想開就開的節奏`,inline: true},
                { name: `Server 主機位置`, value: `臺灣\n\u200B`,inline: true},
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

            await interaction.reply({
                embeds: [embed],
            });
        },
}