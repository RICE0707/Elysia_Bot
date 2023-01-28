const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`踢出成員`)
		.setDescription(`踢出指定的群組成員`)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName(`選擇`)
            .setDescription(`選擇要踢出的群組成員`)
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName(`原因`)
            .setDescription(`踢出的原因`)
        ),

        async execute(interaction) {
            const {channel, options} = interaction;

            const user = options.getUser("選擇");
            const reason = options.getString("原因") || "我忘了打原因了哈哈";

            const member = await interaction.guild.members.fetch(user.id);

            const errEmbed = new EmbedBuilder()
                .setTitle(`<a:r2_rice:868583626227478591> 踢出失敗`)
                .setDescription(`你不能踢出 ${user}，因為他的權限組高於或等同於你。\n \n所以說...沒有權限還想濫權阿，\n操你媽世界上就是有你這種屁孩亂玩指令= =\n \n還是自以為踢掉自己很好玩？\n到底哪來的自閉兒阿>:(`)
                .setColor(0xff8080)
                .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
                .setTimestamp()
                .setFooter({ text: '來自花瓶星球的科技支援 v2.1', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })    

            if (member.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({ embeds: [errEmbed]});

            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setTitle(`<a:r3_rice:868583679465758820> 踢出成功`)
                .setDescription(`管理員已踢出 ${user} ，\n因為：\` ${reason} \`\n \n希望這位酷割或帥姐不要玻璃心碎滿地\n開小號埋怨管理員阿哈哈。`)
                .setThumbnail(`https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg`)
                .setColor(0xff8080)
                .setTimestamp()
                .setFooter({ text: '來自花瓶星球的科技支援 v2.1', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });    

            await interaction.reply({
                    embeds: [embed],
           })
        }
    }