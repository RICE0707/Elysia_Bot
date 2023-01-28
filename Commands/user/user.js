const { SlashCommandBuilder, EmbedBuilder } = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`使用者資訊`)
		.setDescription(`取得使用者資訊`)
        .addUserOption((option) =>
            option.setName(`使用者`)
            .setDescription(`選擇使用者`)
            .setRequired(true)
        ),

        async execute(interaction) {
            const { channel, client, options, member } = interaction;
            let user = interaction.options.getUser(`使用者`) || interaction.member;
            let userAvatar = user.displayAvatarURL({ size: 1024 });

            const embed = new EmbedBuilder()
            .setColor(0xd3d7da)
            .setURL(`${user.avatarURL({size: 1024})}`)
            .setAuthor({ name: '你就是個偷窺狂吧！', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Js_V2' })
            .setDescription('這就是你要的資訊，滿意了嗎？')
            .setThumbnail(`${userAvatar}`)
            .setTitle(`${user.username} 的使用者資訊`)
            .addFields(
                { name: `使用者名稱`, value: `${user.tag}`, inline: true },
                { name: `使用者ＩＤ`, value: `${user.id}`, inline: true },
                { name: `使用者創帳時間`, value: `<t:${parseInt(member.user.createdAt / 1000)}:f>`, inline: true },
                { name: `使用者入群時間`, value: `<t:${parseInt(member.joinedAt / 1000)}:f>`, inline: true },
                { name: `是否為機器人？`, value: `${user.bot? '是':'否'}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: '來自花瓶星球的科技支援 v2.1', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });

            await interaction.reply({
                embeds: [embed],
            });
        },
}