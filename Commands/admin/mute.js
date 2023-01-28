const { Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require(`discord.js`);
const ms = require("ms");

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`禁言成員`)
		.setDescription(`禁言指定的群組成員`)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName(`選擇`)
            .setDescription(`選擇要禁言的群組成員`)
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName(`時長`)
            .setDescription(`輸入禁言時長`)
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName(`原因`)
            .setDescription(`禁言的原因`)
        ),
    
    async execute(interaction) {
        const {guild, options} = interaction;

        const user = options.getUser("選擇");
        const member = guild.members.cache.get(user.id);
        const time = options.getString("時長");
        const convertedTime = ms(time);
        const reason = options.getString("原因") || "我忘了打原因了哈哈";

        const errEmbed = new EmbedBuilder()
            .setTitle(`<a:r2_rice:868583626227478591> 禁言失敗`)
            .setDescription(`你不能禁言 ${user}，因為他的權限組高於或等同於你，\n操你媽世界上就是有你這種屁孩亂玩指令= =\n \n還是自以為禁言自己很好玩？\n到底哪來的自閉兒阿>:(`)
            .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
            .setTimestamp()
            .setColor(0xff4e4e)
            .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })    

        const errTimeEmbed = new EmbedBuilder()
            .setTitle(`<a:r2_rice:868583626227478591> 禁言失敗`)
            .setDescription(`你不能禁言 ${user}，因為指定時長的錯誤。\n \n請她媽輸入指令時動點腦、動點眼，\n花瓶現在對你很失望。`)
            .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
            .setTimestamp()
            .setColor(0xff4e4e)
            .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
        
        const succesEmbed = new EmbedBuilder()
            .setTitle(`<a:r3_rice:868583679465758820> 禁言成功`)
            .setDescription(`管理員已禁言 ${user}，哈哈閉嘴啦。`)
            .setColor(0xff8080)
            .addFields(
                { name: "原因", value: `${reason}`, inline: true },
                { name: "時長", value: `${time}`, inline: true }
            )
            .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
            .setTimestamp()
            .setFooter({ text: '來自花瓶星球的科技支援', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

        if (member.roles.highest.position >= interaction.member.roles.highest.position)
            return interaction.reply({ embeds: [errEmbed]});

        if (!convertedTime)
            return interaction.reply({ embeds: [errTimeEmbed]});

        try {
            await member.timeout(convertedTime, reason);

            interaction.reply({ embeds: [succesEmbed]});
        } catch (err) {
            console.log(err);
        }
    }
}