const { SlashCommandBuilder } = require(`discord.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`操你媽`)
		.setDescription(`讓機器人說操你媽`),
	async execute(interaction) {
		await interaction.reply({ 
			content: 
				`> 親愛的**<@${interaction.user.id}>**，\n`+
				`> 我想跟您說一句重要的話，\n`+
				`> 也就是，**__操你媽__**<:g6_miko:939962068109508669>`,
			 ephemeral: true });
	},
};