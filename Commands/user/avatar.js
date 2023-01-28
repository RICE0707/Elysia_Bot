const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`使用者頭像`)
		.setDescription(`取得使用者頭像`)
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
            .setTitle(`${user.username} 的使用者頭像`)
            .setImage(`${userAvatar}`)
            .setTimestamp()
            .setFooter({ text: '來自花瓶星球的科技支援 v2.1', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' });
			
            const button = new ButtonBuilder()
            .setLabel(`點此查看頭像網址`)
            .setStyle(ButtonStyle.Link)
            .setURL(`${user.avatarURL({size: 1024})}`);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.reply({
                embeds: [embed],
                components: [row],
            });
        },
}
