process.setMaxListeners(1000);
require('events').EventEmitter.prototype._maxListeners = 1000;

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
		GatewayIntentBits.GuildMembers,
		// GatewayIntentBits.GuildModeration,
		// GatewayIntentBits.GuildEmojisAndStickers,
		// GatewayIntentBits.GuildIntegrations,
		// GatewayIntentBits.GuildWebhooks,
		// GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		// GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		// GatewayIntentBits.DirectMessageReactions,
		// GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		// GatewayIntentBits.GuildScheduledEvents,
		// GatewayIntentBits.AutoModerationConfiguration,
		// GatewayIntentBits.AutoModerationExecution
	],
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		//Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember
	]
});

// version
client.version = process.env.VERSION;
client.discordjsversion = require("discord.js/package.json").version;
client.telegrafversion = JSON.parse(fs.readFileSync(path.join(__dirname, 'node_modules', 'telegraf', 'package.json'))).version;

// prefix
client.prefix = process.env.PREFIX

// create a new collection for the commands
client.commands = new Map();
client.textcommands = new Map();

// UsersDbAddedValues
UserDbAddedValues = {};
// ServersDbAddedValues
ServerDbAddedValues = {users: [{}]};

// mongo utility bulkutility
client.bulkutility = require('./utils/BulkUtility.js');

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', async () => {
    console.log('[CLIENT] Ready!'.brightGreen);

	client.embedcolor = "#3EA9E0";
	client.owner = process.env.OWNER;
	client.invite = 'https://discord.com/api/oauth2/authorize?client_id='+client.user.id+'&permissions=8&scope=bot%20applications.commands';

	// MODULES //
	client.modules = new Collection();
	client.disabledmodules = [];
	disabledmodulesjs = [];
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
	console.log('[CONFIG] config.json loaded'.brightGreen);
	
	// loop through the modules
	console.log(`[MODULES] Chargement des modules...`.brightBlue);
	for (const file of modulesFiles) {
		// import the module
		let module = await require(`./modules/${file}`);
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
						// check if there are keys in the config file that don't exists in the module
						for (const key in client.config.modules[module.name].addedconfig) {
							if(!module.addedconfig[key]) {
								// delete the key
								delete client.config.modules[module.name].addedconfig[key];
								// save the config file
								fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
							}
						}
						// check if the addedconfig is different in the config file
						if(JSON.stringify(module.addedconfig) !== JSON.stringify(client.config.modules[module.name].addedconfig)) {
							// but keep old configuration values for existing keys and add new keys
							client.config.modules[module.name].addedconfig = Object.assign(module.addedconfig, client.config.modules[module.name].addedconfig);
							// save the config file
							fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
						}
					}
				}
			}
		}
		if(process.env.DEBUG_MESSAGES == "true") console.log(`[MODULES] Module ${file} configuré...`.brightBlue);
		
		// check if the module is enabled
		if(!client.config.modules[module.name]?.enabled && module.name) {
			console.log(`[MODULES] Module ${file} désactivé !`.yellow);
			client.disabledmodules.push(module.name);
			// push the module file name in the disabledmodulesjs array
			disabledmodulesjs.push(file);
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
				if(!modulesFiles.includes(dependency) || secondcondition) {
					moduleerror = true;
					modulesnotfound.push(dependency);
				}
			}
		}
		if(moduleerror) {
			console.log(`[MODULES] Module ${module.name} non chargé !, les modules suivants sont requis : ${modulesnotfound.join(', ')}`.brightRed);
			client.config.modules[module.name].enabled = false;
			client.disabledmodules.push(module.name);
			// push the module file name in the disabledmodulesjs array
			disabledmodulesjs.push(file);
			continue;
		}
		if(module?.userSchemaAddition) {
			// there are some fields to add to the user schema
			// userSchemaAddition is an object with the fields to add
			// we need to add to Values of client.usersdb
			for (const key in module.userSchemaAddition) {
				UserDbAddedValues[key] = module.userSchemaAddition[key];
				if(process.env.DEBUG_MESSAGES == "true") console.log(`[MODULES] Module ${file} ajouté à la base de données des utilisateurs...`.brightBlue);
			}
		}
		if(module?.guildSchemaAddition) {
			// there are some fields to add to the guild schema
			// guildSchemaUsersAddition is an object with the fields to add
			// we need to add to Values of client.serversdb
			for (const key in module.guildSchemaAddition) {
				ServerDbAddedValues[key] = module.guildSchemaAddition[key];
				if(process.env.DEBUG_MESSAGES == "true") console.log(`[MODULES] Module ${file} ajouté à la base de données des serveurs...`.brightBlue);
			}
		}
		if(module?.guildSchemaUsersAddition) {
			// the server schema have an array of users for config of the members of the server
			// schema.users is an array of objects
			// we need to add to Values of client.serversdb	
			for (const key in module.guildSchemaUsersAddition) {
				ServerDbAddedValues.users[0][key] = module.guildSchemaUsersAddition[key];
				// [0] because we need to add the field to the first object of the array (the only object)
				// because this is an mongoose array of objects to signify that the array can have multiple objects for each user
				if(process.env.DEBUG_MESSAGES == "true") console.log(`[MODULES] Module ${file} ajouté à la base de données des serveurs pour les utilisateurs...`.brightBlue);
			}
		}
		console.log(`[MODULES] Module ${file} chargé !`.brightGreen);
	}

	// mongo models on the client
	CreateUserDb = require('./models/users.model.js');
	CreateServerDb = require('./models/servers.model.js');
	// permit modules to add fields to the user schema (Yeah, I know, it's a bit complicated)

	// client.usersdb = createModel(fields, ID);
	client.usersdb = await CreateUserDb(UserDbAddedValues, 'user');
	client.serversdb = await CreateServerDb(ServerDbAddedValues, 'server');
	// and we can use it like this
	
	// run the modules (enabled modules only)
	for (const file of modulesFiles) {
		if(disabledmodulesjs.includes(file)) continue;
		const module = require(`./modules/${file}`);
		module.client = client;
		if(module?.run) {
			module.run(client);
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[MODULES] Module ${file} exécuté !`.brightBlue);
			client.modules[module.name] = module;
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[MODULES] Module ${file} sauvegardé !`.brightGreen);
		} else {
			client.modules[module.name] = module;
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[MODULES] Module ${file} sauvegardé !`.brightGreen);
		}
		console.log(`[MODULES] Module ${file} exécuté !`.brightGreen);
	}

	console.log(`[MODULES] ${modulesFiles.length - client.disabledmodules.length} modules chargés !`.brightGreen);
	console.log(`[MODULES] ${client.disabledmodules.length} modules désactivés !`.brightYellow);
	// modules in the config file that don't exists in the modules folder
	for (const key in client.config.modules) {
		if(!client.modules[key] && !client.disabledmodules.includes(key)) {
			// delete the module from the config file
			delete client.config.modules[key];
			// save the config file
			fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));
		}
	}

	// SERVERS TO DATABASE //
	// check what servers the bot is in and add them to the database
	let nbServersAdded = 0;
	let nbServersAlreadyInDatabase = 0;
	client.guilds.cache.forEach(async (guild) => {
		// check if the server exists in the database
		var server = await client.serversdb.findOne({ id: guild.id });
		if(!server){
			// create the server document
			await client.serversdb.createModel({
				id: guild.id,
			});
			nbServersAdded++;
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] Server ${guild.id} added to database`.brightGreen);
		} else {
			nbServersAlreadyInDatabase++;
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] Server ${guild.id} already in database`.brightBlue);
		}
	});
	console.log(`[DATABASE] ${nbServersAdded} servers added to database, ${nbServersAlreadyInDatabase} servers already in database`.brightGreen);

	if(process.env.REMOVE_OLD_SERVERS == "true") {
		// check servers in the database and remove them if the bot is not in them
		let nbServersRemoved = 0;
		var servers = await client.serversdb.find();
		servers.forEach(async (server) => {
			// check if the server exists
			var guild = client.guilds.cache.get(server.id);
			if(!guild) {
				// delete the server document
				await client.serversdb.deleteOne({ id: guild.id });
				nbServersRemoved++;
				if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] Server ${guild.id} deleted from database`.yellow);
			}
		});
		console.log(`[DATABASE] ${nbServersRemoved} servers removed from database`.yellow);
	} else console.log(`[DATABASE] Remove old servers disabled`.brightYellow);

	// USERS TO DATABASE //
	// check what users the bot is in and add them to the database
	let nbUsersAdded = 0;
	let nbUsersAlreadyInDatabase = 0;
	client.users.cache.forEach(async (user) => {
		// if the user is a bot, skip
		if(user.bot) return;
		// check if the user exists in the database
		var userdb = await client.usersdb.findOne({ id: user.id });
		if(!userdb){
			// create the user document
			await client.usersdb.createModel({
				id: user.id,
			});
			nbUsersAdded++;
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] User ${user.id} added to database`.brightGreen);
		} else {
			nbUsersAlreadyInDatabase++;
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] User ${user.id} already in database`.brightBlue);
		}
	});
	console.log(`[DATABASE] ${nbUsersAdded} users added to database, ${nbUsersAlreadyInDatabase} users already in database`.brightGreen);

	if(process.env.REMOVE_OLD_USERS == "true") {
		// check users in the database and remove them if their are not in a server where the bot is
		let nbUsersRemoved = 0;
		var users = await client.usersdb.find();
		users.forEach(async (user) => {
			// check if the user exists
			var user1 = client.users.cache.get(user.id);
			if(!user1) {
				nbUsersRemoved++;
				// delete the user document
				await client.usersdb.deleteOne({ id: user.id });
				if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] User ${user.id} deleted from database`.yellow);
			}
		});
		console.log(`[DATABASE] ${nbUsersRemoved} users removed from database`.yellow);

		// remove users from servers .users array with their .id
		// only if the user is not in a server where the bot is
		let nbUsersRemovedFromServers = 0;
		var servers = await client.serversdb.find();
		servers.forEach(async (server) => {
			// check if the server exists
			var guild = client.guilds.cache.get(server.id);
			if(!guild) return;
			// loop through the users of the server
			for (const user of server.users) {
				// check if the user exists
				var user1 = client.users.cache.get(user.id);
				if(!user1) {
					// delete the user from the server document
					await client.serversdb.updateOne({ id: guild.id }, { $pull: { users: { id: user.id } } });
					nbUsersRemovedFromServers++;
					if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] User ${user.id} removed from server ${guild.id} in database`.yellow);
				}
			}
		});
		console.log(`[DATABASE] ${nbUsersRemovedFromServers} users removed from servers in database`.yellow);
	} else console.log(`[DATABASE] Remove old users disabled`.brightYellow);

	// remove bots from the database
	let nbBotsRemoved = 0;
	var users = await client.usersdb.find();
	users.forEach(async (user) => {
		// check if the user exists
		var user1 = client.users.cache.get(user.id);
		if(!user1) return;
		if(user1.bot) {
			nbBotsRemoved++;
			// delete the user document
			await client.usersdb.deleteOne({ id: user.id });
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] User bot ${user.id} deleted from database`.yellow);
		}
	});
	// remove bots from servers .users array with their .id
	// only if the user is not in a server where the bot is
	let nbBotsRemovedFromServers = 0;
	var servers = await client.serversdb.find();
	servers.forEach(async (server) => {
		// check if the server exists
		var guild = client.guilds.cache.get(server.id);
		if(!guild) return;
		// loop through the users of the server
		for (const user of server.users) {
			// check if the user exists
			var user1 = client.users.cache.get(user.id);
			if(!user1) return;
			if(user1.bot) {
				// delete the user from the server document
				await client.serversdb.updateOne({ id: guild.id }, { $pull: { users: { id: user.id } } });
				nbBotsRemovedFromServers++;
				if(process.env.DEBUG_MESSAGES == "true") console.log(`[DATABASE] User bot ${user.id} removed from server ${guild.id} in database`.yellow);
			}
		}
	});
	console.log(`[DATABASE] ${nbBotsRemoved} bots users removed from database`.yellow);
	console.log(`[DATABASE] ${nbBotsRemovedFromServers} bots users removed from servers in database`.yellow);

	if(process.env.TELEGRAM == "true") {
		const { Telegraf } = require('telegraf');
		client.telegram = new Telegraf(process.env.TELEGRAM_TOKEN);
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
			let exist = fs.existsSync(path.join(__dirname, `./commands/${file}`));
			if(exist) {
				command = require(`./commands/${file}`);
				command.type = 'slash';
				console.log(`[INFO] Commande ${command.data.name} slash chargée !`.brightGreen);
			}
		} catch (error) {console.log(`[ERROR] Une erreur est survenue lors du chargement de la commande ${command} !`.red), console.log(error); return process.exit(1);}
		try {
			let exist = fs.existsSync(path.join(__dirname, `./contextcommands/${file}`));
			if(exist) {
				command = require(`./contextcommands/${file}`);
				command.type = 'contextmenu';
				console.log(`[INFO] Commande ${command.data.name} contextmenu chargée !`.brightGreen);
			}
		} catch (error) {console.log(`[ERROR] Une erreur est survenue lors du chargement de la commande ${command} !`.red), console.log(error); return process.exit(1);}
		try {
			let exist = fs.existsSync(path.join(__dirname, `./modalscommands/${file}`));
			if(exist) {
				command = require(`./modalscommands/${file}`);
				command.type = 'modal';
				console.log(`[INFO] Commande ${command.data.name} modal chargée !`.brightGreen);
			}
		} catch (error) {console.log(`[ERROR] Une erreur est survenue lors du chargement de la commande ${command} !`.red), console.log(error); return process.exit(1);}
		try {
			let exist = fs.existsSync(path.join(__dirname, `./buttonscommands/${file}`));
			if(exist) {
				command = require(`./buttonscommands/${file}`);
				command.type = 'button';
				console.log(`[INFO] Commande ${command.data.name} button chargée !`.brightGreen);
			}
		} catch (error) {console.log(`[ERROR] Une erreur est survenue lors du chargement de la commande ${command} !`.red), console.log(error); return process.exit(1);}
		try {
			let exist = fs.existsSync(path.join(__dirname, `./selectcommands/${file}`));
			if(exist) {
				command = require(`./selectcommands/${file}`);
				command.type = 'select';
				console.log(`[INFO] Commande ${command.data.name} select chargée !`.brightGreen);
			}
		} catch (error) {console.log(`[ERROR] Une erreur est survenue lors du chargement de la commande ${command} !`.red), console.log(error); return process.exit(1);}

		// on sauvegarde la commande dans le client
		try{
			client.commands.set(command.data.name, command); // slash command
		}catch(error){console.log(`[INFO] Une erreur est survenue lors du chargement de la commande ${command} !`.red), console.log(error); return process.exit(1);}
		try{
			client.textcommands.set(command.data.name, command); // text command
		}catch(error){console.log(`[INFO] Une erreur est survenue lors du chargement de la commande ${command} !`.red), console.log(error); return process.exit(1);}
	}
	console.log(`[INFO] ${client.commands.size} commandes chargées !`.brightGreen);

	// remove commands from the discord api if they are not in the commands folder
	let nbCommandsDeleted = 0;
	console.log(`[INFO] Vérification des commandes slash en trop...`.brightBlue);
	commands.forEach(async command => {
		// check if the command exists in the commands folder
		if(!client.commands.has(command.name)){
			// delete the command
			await client.application.commands.delete(command.id);
			nbCommandsDeleted++;
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[INFO] Commande slash ${command.name} supprimée !`.yellow);
		}
	});
	console.log(`[INFO] ${nbCommandsDeleted} commandes slash supprimées !`.brightGreen);

	// register the commands with the discord api
	client.commands.forEach(async command => {
		await client.application.commands.create(command.data.toJSON());
	});
	console.log('[INFO] Commandes slash enregistrées !'.brightGreen);

	client.discordcommands = await client.application.commands.fetch();

	// HANDLERS //
	const handlersFiles = fs.readdirSync('./handlers').filter(file => file.endsWith('.js'));
	console.log(`[HANDLERS] Chargement des handlers...`.brightBlue);
	for (const file of handlersFiles) {
		// import the handler
		const handler = await require(`./handlers/${file}`);
		handler.client = client;
		if(handler?.run) {
			handler.run(client);
			if(process.env.DEBUG_MESSAGES == "true") console.log(`[HANDLERS] Exécution du handler ${file}...`.brightBlue);
		}
		console.log(`[HANDLERS] Handler ${file} chargé !`.brightGreen);
	}
	console.log(`[HANDLERS] ${handlersFiles.length} handlers chargés !`.brightGreen);
});

// login to Discord with your app's token
client.login(process.env.TOKEN);

// error handler
process.on('unhandledRejection', (error) => {
	console.error(
		`[ERROR] Uncaught exception:`
		+ `\n${error.stack}`
	);
});
process.on('uncaughtException', (error) => {
	console.error(
		`[ERROR] Uncaught exception:`
		+ `\n${error.stack}`
	);
});