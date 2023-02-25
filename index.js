const { Client, GatewayIntentBits, PermissionsBitField, Partials, EmbedBuilder, Routes, Collection } = require('discord.js');

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const conn = mongoose.connection; // Connection à la base de données
var colors = require('colors');

colors.enable();

// .env file
require('dotenv').config();

connectToDatabase();
async function connectToDatabase() {
	const mongoURI = process.env.DB_LINK+'/'+process.env.DB_NAME;
	await mongoose.connect(mongoURI, {
		serverSelectionTimeoutMS: 5000,
		useNewUrlParser: true,
		directConnection: true,
		ssl: false,
		authSource: 'admin',
	}).catch(async(err) => {
		console.error(('[DATABASE] Database connection error:', err).red);
	});
}

conn.once('open', function () {
	console.log("[DATABASE] Database successfully connected".brightGreen);
});

// create a new Discord client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	],
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember
	]
});

// version
client.version = process.env.VERSION;
client.discordjsversion = require("discord.js/package.json").version;

// prefix
client.prefix = process.env.PREFIX

// create a new collection for the commands
client.commands = new Map();
client.textcommands = new Map();

// mongo models on the client
client.usersdb = require('./models/users.model.js');
client.serversdb = require('./models/servers.model.js');
client.interserversdb = require('./models/interservers.model.js');

// mongo utility bulkutility
client.bulkutility = require('./utils/BulkUtility.js');

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', async () => {
    console.log('[CLIENT] Ready!'.brightGreen);

	client.embedcolor = "#3EA9E0";
	client.owner = process.env.OWNER;
	client.invite = 'https://discord.com/api/oauth2/authorize?client_id='+client.user.id+'&permissions=8&scope=bot%20applications.commands';

	// SERVERS TO DATABASE //
	// check what servers the bot is in and add them to the database
	client.guilds.cache.forEach(async (guild) => {
		// check if the server exists in the database
		var server = await client.serversdb.findOne({ id: guild.id });
		if(!server){
			// create the server document
			await client.serversdb.createModel({
				id: guild.id,
			});
			console.log(`[DATABASE] Server ${guild.id} added to database`.brightGreen);
		} else {
			console.log(`[DATABASE] Server ${guild.id} already in database`.brightBlue);
		}
	});

	// check servers in the database and remove them if the bot is not in them
	var servers = await client.serversdb.find();
	servers.forEach(async (server) => {
		// check if the server exists
		var guild = client.guilds.cache.get(server.id);
		if(!guild) {
			// delete the server document
			await client.serversdb.deleteOne({ id: guild.id });
			console.log(`[DATABASE] Server ${guild.id} deleted from database`.yellow);
		}
	});

	// MODULES //
	client.modules = new Collection();
	client.disabledmodules = [];
	const modulesFiles = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));

	// read a file called config.json for global enabled modules and config
	try {
		client.config = require('./config.json');
	} catch (error) {
		console.log('[CONFIG] config.json not found, creating one...'.brightRed);
		// create a new config file
		client.config = {}
		// save the config file
		fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
	}
	
	// loop through the modules
	console.log(`[MODULES] Chargement des modules...`.brightBlue);
	for (const file of modulesFiles) {
		// import the module
		const module = await require(`./modules/${file}`);
		module.client = client;

		// check if .modules exists in the config file
		if(!client.config.modules) {
			// create the .modules object in the config file
			client.config.modules = {};
			// save the config file
			fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
		}

		// check if the module don't exists in the config file
		if(module.name) {
			if(!client.config.modules[module.name]) {
				// add the module to the config file
				client.config.modules[module.name] = {
					enabled: true
				}
				// if addedconfig exist in the module
				if(module.addedconfig) {
					// add the addedconfig to the config file
					client.config.modules[module.name].addedconfig = module.addedconfig;
				}
				// save the config file
				fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
			} else {
				// if addedconfig exist in the module
				if(module.addedconfig) {
					// check if the addedconfig don't exists in the config file
					if(!client.config.modules[module.name].addedconfig) {
						// add the addedconfig to the config file
						client.config.modules[module.name].addedconfig = module.addedconfig;
						// save the config file
						fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
					} else {
						// check if the addedconfig is different in the config file
						if(JSON.stringify(module.addedconfig) !== JSON.stringify(client.config.modules[module.name].addedconfig)) {
							// but keep old configuration values for existing keys and add new keys
							client.config.modules[module.name].addedconfig = Object.assign(module.addedconfig, client.config.modules[module.name].addedconfig);
							// save the config file
							fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
						}
						// check if there are keys in the config file that don't exists in the module
						for (const key in client.config.modules[module.name].addedconfig) {
							if(!module.addedconfig[key]) {
								// delete the key
								delete client.config.modules[module.name].addedconfig[key];
								// save the config file
								fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
							}
						}
					}
				}
			}
		}
		console.log(`[MODULES] Module ${file} configuré...`.brightBlue);
						
		// check if the module is enabled
		if(!client.config.modules[module.name]?.enabled && module.name) {
			console.log(`[MODULES] Module ${file} désactivé !`.yellow);
			client.disabledmodules.push(module.name);
			continue;
		}
		let moduleerror = false;
		let modulesnotfound = [];
		if(module.dependencies) {
			// check if the dependencies are installed (the dependencies are modules names)
			for (const dependency of module.dependencies) {
				let secondcondition = false;
				// it is true only if the module is not defined in the config file or if it is defined but disabled
				if(!client.config.modules[dependency.replace('.js', '')]) {
					secondcondition = true;
				} else {
					if(!client.config.modules[dependency.replace('.js', '')]?.enabled) {
						secondcondition = true;
					}
				}
				console.log(!modulesFiles.includes(dependency), secondcondition);
				if(!modulesFiles.includes(dependency) || secondcondition) {
					moduleerror = true;
					modulesnotfound.push(dependency);
					console.log(`[MODULES] Module ${module.name} dépend du module ${dependency} qui n'est pas installé ou activé !`.brightRed);
				}
			}
		}
		if(moduleerror) {
			console.log(`[MODULES] Module ${module.name} non chargé !, les modules suivants sont requis : ${modulesnotfound.join(', ')}`.brightRed);
			client.config.modules[module.name].enabled = false;
			client.disabledmodules.push(module.name);
			continue;
		}
		if(module?.run) {
			module.run(client);
			console.log(`[MODULES] Module ${file} exécuté !`.brightBlue);
			client.modules[module.name] = module;
			console.log(`[MODULES] Module ${file} sauvegardé !`.brightGreen);
		} else {
			client.modules[module.name] = module;
			console.log(`[MODULES] Module ${file} sauvegardé !`.brightGreen);
		}
		console.log(`[MODULES] Module ${file} chargé !`.brightGreen);
	}
	// modules in the config file that don't exists in the modules folder
	for (const key in client.config.modules) {
		if(!client.modules[key] && !client.disabledmodules.includes(key)) {
			// delete the module from the config file
			delete client.config.modules[key];
			// save the config file
			fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
		}
	}

	// HANDLERS //
	const handlersFiles = fs.readdirSync('./handlers').filter(file => file.endsWith('.js'));
	console.log(`[HANDLERS] Chargement des handlers...`.brightBlue);
	for (const file of handlersFiles) {
		// import the handler
		const handler = await require(`./handlers/${file}`);
		handler.client = client;
		if(handler?.run) {
			handler.run(client);
			console.log(`[HANDLERS] Exécution du handler ${file}...`.brightBlue);
		}
		console.log(`[HANDLERS] Handler ${file} chargé !`.brightGreen);
	}

	// COMMANDS TO DISCORD API //
	// check the commands in the commands folders
	
	let commandFiles = [];
	// slash commands
	try{
		commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	}catch{}
	// context menu
	try{
		let contextcommandFiles = fs.readdirSync('./contextcommands').filter(file => file.endsWith('.js'));
		commandFiles = commandFiles.concat(contextcommandFiles);
	}catch{}
	// modals commands
	try{
		let modalscommandFiles = fs.readdirSync('./modalscommands').filter(file => file.endsWith('.js'));
		commandFiles = commandFiles.concat(modalscommandFiles);
	}catch{}
	// buttons commands
	try{
		let buttoncommandFiles =  fs.readdirSync('./buttonscommands').filter(file => file.endsWith('.js'));
		commandFiles = commandFiles.concat(buttoncommandFiles);
	}catch{}
	// select commands
	try{
		let selectcommandFiles =  fs.readdirSync('./selectcommands').filter(file => file.endsWith('.js'));
		commandFiles = commandFiles.concat(selectcommandFiles);
	}catch{}

	// fetch the commands
	var commands = await client.application.commands.fetch();
	console.log(`[INFO] ${commandFiles.length} commandes trouvées !`.brightGreen);

	// remove commands that are 2 times in the commands of the bot
	console.log(`[INFO] Vérification des commandes en double ou plus...`.brightBlue);
	commands.forEach(async command => {
		// check if the command is in double or more, if yes, remove all commands !
		commands = await commands.filter(c => c.name == command.name);
		if(commands.size > 1){
			console.log(`[INFO] Commande ${command.name} en double ! Suppression de toutes les commandes du même nom !`.red);
			commands.forEach(async c => {
				await client.application.commands.delete(c.id);
				console.log(`[INFO] Commande ${c.name} supprimée !`.yellow);
			});
		}
	});

	// loop through the commands
	console.log(`[INFO] Chargement des commandes...`.brightBlue);
	for (const file of commandFiles) {
		// importation de la commande slash
		let command;
		try {
			command = require(`./commands/${file}`);
			command.type = 'slash';
			console.log('[INFO] Commande slash enregistrée !'.brightGreen);
		} catch (error) {}
		try {
			command = require(`./contextcommands/${file}`);
			command.type = 'contextmenu';
			console.log('[INFO] Commande contextmenu enregistrée !'.brightGreen);
		} catch (error) {}
		try {
			command = require(`./modalscommands/${file}`);
			command.type = 'modal';
			console.log('[INFO] Commande modal enregistrée !'.brightGreen);
		} catch (error) {}
		try {
			command = require(`./buttonscommands/${file}`);
			command.type = 'button';
			console.log('[INFO] Commande button enregistrée !'.brightGreen);
		} catch (error) {}
		try {
			command = require(`./selectcommands/${file}`);
			command.type = 'select';
			console.log('[INFO] Commande select enregistrée !'.brightGreen);
		} catch (error) {}

		// on sauvegarde la commande dans le client
		client.commands.set(command.data.name, command); // slash command
		client.textcommands.set(command.data.name, command); // text command

		// on indique que la commande a été chargée
		console.log(`[INFO] Commande ${command.data.name} chargée !`.brightGreen);
	}
	console.log(`[INFO] Commandes chargées !`.brightGreen);

	// remove commands from the discord api if they are not in the commands folder
	console.log(`[INFO] Vérification des commandes slash en trop...`.brightBlue);
	commands.forEach(async command => {
		// check if the command exists in the commands folder
		if(!client.commands.has(command.name)){
			// delete the command
			await client.application.commands.delete(command.id);
			console.log(`[INFO] Commande slash ${command.name} supprimée !`.yellow);
		}
	});

	// register the commands with the discord api
	client.commands.forEach(async command => {
		await client.application.commands.create(command.data.toJSON());
	});
	console.log('[INFO] Commandes slash enregistrées !'.brightGreen);

	client.discordcommands = await client.application.commands.fetch();
});

// login to Discord with your app's token
client.login(process.env.TOKEN);

// error handler
process.on('unhandledRejection', error => console.error(`[ERROR] Unhandled promise rejection:\n${error}`));
process.on('uncaughtException', error => console.error(`[ERROR] Uncaught exception:\n${error}`));