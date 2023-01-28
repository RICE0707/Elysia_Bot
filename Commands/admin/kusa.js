const { SlashCommandBuilder, PermissionFlagsBits } = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`海草`)
		.setDescription(`呼喚海草`)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.reply({ 
			content: 
				`> 親愛的**<@1023298421551026298>**，\n`+
				`> 聽說有人在呼喚你～～`});
	},
};