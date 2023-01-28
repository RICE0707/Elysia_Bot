const { Client, Partials, GatewayIntentBits, Collection } = require('discord.js');

const {Guilds, GuildMembers, GuildMessages} = GatewayIntentBits;
const {User, Message, GuildMember, ThreadMember, Channel} = Partials;

const {loadEvents} = require('./Handlers/eventHeadler');
const {loadCommands} = require('./Handlers/commandHandler');

const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages],
	Partials: [User, Message, GuildMember, ThreadMember],
});

client.commands = new Collection();
client.config = require('./config.json');

client.login(client.config.token).then(() => {
	loadEvents(client);
	loadCommands(client);
});