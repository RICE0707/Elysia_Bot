const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`解除封禁成員`)
		.setDescription(`解除封禁指定的群組成員`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName(`使用者`)
            .setDescription(`輸入欲解除封禁的群組成員的使用者ID`)
            .setRequired(true)
        ),

    async execute(interaction) {
        const {channel, options} = interaction;

        const userId = options.getString("使用者") || "我忘了打ID了哈哈";

        try {
            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setDescription(`管理員已解除封禁 ${userId}，\n \n希望這不是管理員手殘按到，不然挺智障的哈哈\n不過也希望這位酷割或帥姐不要在他媽的違規囉～`)
                .setColor(0x76ff4d)
                .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
                .setTimestamp()
                .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })    

            await interaction.reply({
                embeds: [embed],
            });
        } catch (err) {
            console.log(err);

            const errEmbed = new EmbedBuilder()
                    .setDescription(`請輸入使用者ID，不然我們美麗的花瓶是找不到人的。\n或者這位成員根本沒有被封禁\n請她媽輸入指令時動點腦、動點眼，\n花瓶現在對你很失望。`)
                    .setColor(0xff4e4e)
                    .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
                    .setTimestamp()
                    .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })    

            interaction.reply({ embeds: [errEmbed]})
        }
    }
}