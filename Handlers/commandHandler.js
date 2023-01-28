function loadCommands(client) {
	const ascii = require('ascii-table');
	const fs = require('fs');
	const table = new ascii().setHeading("指令", "狀態");

	let commandsArray = [];

	const commandsFolder = fs.readdirSync('./Commands');
	for (const folder of commandsFolder) {
		const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const commandFile = require(`../Commands/${folder}/${file}`);

			client.commands.set(commandFile.data.name, commandFile);

			commandsArray.push(commandFile.data.toJSON());

			table.addRow(file, "載入");
			continue;
		}
	}

	client.application.commands.set(commandsArray);

	return console.log(table.toString(), `\n[提示] 指令已註冊完成。`);
}

module.exports = {loadCommands};