const { Client, GatewayIntentBits, PermissionsBitField, Partials, EmbedBuilder, Routes, Collection } = require('discord.js');

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const conn = mongoose.connection; // Connection à la base de données
var colors = require('colors');

colors.enable();

// .env file
require('dotenv').config()

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

client.bulkutility = require('./modules/BulkUtility');

// mongo models on the client
client.usersdb = require('./models/users.model.js');
client.serversdb = require('./models/servers.model.js');
client.interserversdb = require('./models/interservers.model.js');

// get command prefix from env
client.prefix = process.env.PREFIX
// create a new collection for the commands
client.commands = new Map();
client.textcommands = new Map();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', async () => {
    console.log('[CLIENT] Ready!'.brightGreen);

	client.embedcolor = "#3EA9E0";

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
		if(!guild){
			// delete the server document
			await client.serversdb.deleteOne({ id: server.id });
			console.log(`[DATABASE] Server ${server.id} deleted from database`.yellow);
		}
	});

	// MODULES //
	const modulesFiles = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));

	// loop through the modules
	console.log(`[MODULES] Chargement des modules...`.brightBlue);
	for (const file of modulesFiles) {
		// import the module
		const module = await require(`./modules/${file}`);
		module.client = client;
		if(module?.run) {
			console.log(`[MODULES] Exécution du module ${file}...`.brightBlue);
			module.run(client);
		} else {
			// on sauvegarde le module dans le client
			client[module.name] = module;
		}
		console.log(`[MODULES] Module ${file} chargé !`.brightGreen);
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
	// check the commands in the commands folder
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	var commands = await client.application.commands.fetch();
	console.log(`[INFO] ${commands.size} commandes trouvées !`.brightGreen);

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
		const command = require(`./commands/${file}`);

		// fonction pour rendre compatible les commandes texte avec les commandes slash
		function textCommandCompatibility(fileName){
			// Utiliser le module fs pour lire le fichier
			return fs
			// Lire le fichier
			.readFileSync(fileName, 'utf8')
			// Modifier quelques éléments du code pour qu'il soit compatible avec les commandes slash mais aussi avec les commandes texte
			.replaceAll('interaction?.message?.interaction', 'interaction.message.interaction').replaceAll('interaction.message.interaction', 'interaction?.message')
			.replaceAll('interaction?.message?.user', '(await interaction?.message?.channel?.messages.fetch(interaction?.message?.reference?.messageId))?.author');
			// Retourner le fichier après toutes les modifications
		}
		// on transforme la commande texte en commande slash
		var textcommand = eval(textCommandCompatibility(path.join(__dirname, `./commands/${file}`)));

		// on sauvegarde la commande dans le client
		client.commands.set(command.data.name, command); // slash command
		client.textcommands.set(textcommand.data.name, textcommand); // text command

		// on indique que la commande a été chargée
		console.log(`[INFO] Commande ${command.data.name} chargée !`.brightGreen);
	}
	console.log(`[INFO] ${client.commands.size} commandes chargées !`.brightGreen);

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
		// check if command is global
		await client.application.commands.create(command.data.toJSON());
	});
	console.log('[INFO] Commandes slash enregistrées !'.brightGreen);
});

// login to Discord with your app's token
client.login(process.env.TOKEN);

// error handler
//process.on('unhandledRejection', error => console.error(`[ERROR] Unhandled promise rejection:\n${error}`));
//process.on('uncaughtException', error => console.error(`[ERROR] Uncaught exception:\n${error}`));