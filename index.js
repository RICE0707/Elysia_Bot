const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[警告] ${filePath} 處的指令缺少必需的"data"或"execute"屬性。`);
	}
}

client.once(Events.ClientReady, c => {
	client.user.setPresence({ activities: [{ name: '花瓶的操你媽Js時光' }], status: 'dnd' });
	console.log(`${c.user.tag} 已開啟！`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`[警告] 找不到與 ${interaction.commandName} 匹配的指令！`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: '> 執行此指令時出現錯誤！', ephemeral: true });
	}
});

client.login(process.env.TOKEN);