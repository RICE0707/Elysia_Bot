const { SlashCommandBuilder, EmbedBuilder } = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`機器人資訊`)
		.setDescription(`取得機器人資訊`),

        async execute(interaction) {

            const embed = new EmbedBuilder()
            .setColor(0xd3d7da)
            .setAuthor({ name: '你就是個偷窺狂吧！', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Js_V2' })
            .setDescription('感謝邀請，本機器人由 如果我有一個新花瓶#0707 開發與維護，但本機器人只是他的練手用Bot，可能會有許多奇怪的漏洞，不建議在生產環境中做使用，並且，只有當他開啟筆電並編寫有關本機器人的程式時，本機器人才會啟用。')
            .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
            .setTitle(`HI，我是一個易碎的花瓶`)
            .addFields(
                { name: `以下為目前已有的功能：`, value: `(本機器人僅有斜線指令)\n<:n9_air:898205184746991677>`},
                { name: `管理類功能`, value: `<:n9_air:898205184746991677>├ </禁言成員:0> - 禁言指定的群組成員\n<:n9_air:898205184746991677>├ </解除禁言成員:0> - 解除封禁指定的群組成員\n<:n9_air:898205184746991677>├ </封禁成員:0> - 封禁指定的群組成員\n<:n9_air:898205184746991677>├ </解除封禁成員:0> - 解除封禁指定的群組成員\n<:n9_air:898205184746991677>└ </踢出成員:0> - 踢出指定的群組成員\n\u200B`},
                { name: `使用者功能`, value: `<:n9_air:898205184746991677>├ </機器人資訊:0> - 取得機器人資訊\n<:n9_air:898205184746991677>├ </伺服器資訊:0> - 取得伺服器資訊\n<:n9_air:898205184746991677>├ </使用者資訊:0> - 取得使用者的ID、名稱、創帳日期等資訊\n<:n9_air:898205184746991677>└ </使用者頭像:0> - 取得使用者的頭像\n\u200B`},
                { name: `娛樂類功能`, value: `<:n9_air:898205184746991677>├ </操你媽:0> - 讓機器人問候你媽\n<:n9_air:898205184746991677>└ </海草:0> - 召喚海草(需有管理權限)\n\u200B`},
            )
            .setTimestamp()
            .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

            await interaction.reply({
                embeds: [embed],
            });
        },
}