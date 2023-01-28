const { Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require(`discord.js`);
const { execute } = require("./kick");

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`解除禁言成員`)
		.setDescription(`解除禁言指定的群組成員`)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName(`選擇`)
            .setDescription(`選擇欲解除禁言指定的群組成員`)
            .setRequired(true)
        ),
    
    async execute(interaction) {
        const {guild, options} = interaction;

        const user = options.getUser("選擇");
        const member = guild.members.cache.get(user.id);

        const errEmbed = new EmbedBuilder()
        .setTitle(`<a:r2_rice:868583626227478591> 解除禁言失敗`)
        .setDescription(`你不能解除禁言 ${user}，因為他的權限組高於或等同於你，\n操你媽世界上就是有你這種屁孩亂玩指令= =\n \n還是自以為禁言自己很好玩？\n到底哪來的自閉兒阿>:(`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
        .setTimestamp()
        .setColor(0xff4e4e)
        .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })    

        const succesEmbed = new EmbedBuilder()
        .setTitle(`<a:r3_rice:868583679465758820> 解除禁言成功`)
        .setDescription(`管理員已解除禁言 ${user}，\n \n希望這不是管理員手殘按到，不然挺智障的哈哈\n不過也希望這位酷割或帥姐不要在他媽的違規囉～`)
        .setColor(0xff8080)
        .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
        .setTimestamp()
        .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

        if (member.roles.highest.position >= interaction.member.roles.highest.position)
        return interaction.reply({ embeds: [errEmbed]});

        try {
            await member.timeout(null);

            interaction.reply({ embeds: [succesEmbed]});
        } catch (err) {
            console.log(err);
        }
    }
}