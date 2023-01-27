const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { EmbedBuilder } = require(`discord.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`測試指令`)
    .setDescription(`這是一個測試指令`),
    async execute(interaction) {

        const embed = new EmbedBuilder()
        .setColor(`Blurple`)
        .setTitle(`測試指令`)
        .setURL(`https://www.brilliantw.net/`)
        .setAuthor({ name: `測試用`, iconURL: `https://cdn.discordapp.com/attachments/1067011834642698280/1067011954734010398/973921463574868018.png`, url: `https://www.brilliantw.net/`})
        .setDescription(`這是測試指令`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/1067011834642698280/1067011954734010398/973921463574868018.png`)
        .addFields({ name: `測試用A`, value: `測試用A-1`, inline: true})
        .addFields({ name: `測試用B`, value: `測試用B-1`, inline: true})
        .addFields({ name: `測試用C`, value: `測試用C-1`, inline: false})
        .addFields({ name: `測試用D`, value: `測試用D-1`, inline: false})
        .setImage(`https://cdn.discordapp.com/attachments/1067011834642698280/1067011954734010398/973921463574868018.png`)
        .setTimestamp()
        .setFooter({ test: `測試用的`, iconURL:`https://cdn.discordapp.com/attachments/1067011834642698280/1067011954734010398/973921463574868018.png`})

        await interaction.reply({ embeds: [embed] })
    }
}