const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('操你媽')
		.setDescription('讓機器人說操你媽'),
	async execute(interaction) {
		await interaction.reply({ content: '操你媽', ephemeral: true });
	},
};