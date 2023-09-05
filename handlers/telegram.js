const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const moment = require('moment');
const ratelimit = new Map();

module.exports = {
    name: 'telegram',
    run: async(client) => {
        if(process.env.TELEGRAM != "true") return console.log('[TELEGRAM] Telegram module disabled, skipping...'.brightBlue);

        // for let command of commands, create a new command in the telegram bot
        let commandsInTelegramFormat = [];
        let commandsToDeleteInTelegramFormat = [];
        console.log('[TELEGRAM] Creating telegram commands...'.brightBlue);
        // transform commands map to array
        let commands = client.textcommands;
        // for each command
        for(let command of commands) {
            command = command[1];
            if(command.data.name == "help" || command.data.name == "start") continue;
            if(command.type != "slash") continue;
            if(process.env.DEBUG_MESSAGES == "true") console.log(`[TELEGRAM] Creating command ${command.data.name}...`.brightBlue);
            if(command.telegram == "disabled" || (command?.data?.dm_permission == false && command.telegram != "enabled")) {
                commandsToDeleteInTelegramFormat.push(command.data.name);
                continue;
            }
            // create the command
            await client.telegram.command(command.data.name, async (ctx) => {
                if(command.ratelimit) {
                    let blockedtime = command.rateblockedtime || process.env.BLOCKEDTIME || 30;
                    let maxmessages = command.ratemaxmessages || process.env.MAXMESSAGES || 5;
                    let removeafter = command.rateremoveafter || process.env.REMOVEAFTER || 30;

                    // check if the user is in the ratelimit map
                    if(ratelimit.get(ctx.from.id)) {
                        // if the user is ratelimited
                        if(ratelimit.get(ctx.from.id).ratelimit) {
                            if(ratelimit.get(ctx.from.id).time < Date.now()) {
                                // delete the user from the ratelimit map
                                ratelimit.delete(ctx.from.id);
                            } else {
                                // if the user has not been responded
                                if(!ratelimit.get(ctx.from.id).responded) {
                                    // send a message to the user
                                    await ctx.reply('Vous êtes bannis des commandes pendant ' + blockedtime + ' secondes pour avoir spammer les commandes, le bot ne répondra plus à vos commandes pendant ' + blockedtime + ' secondes.');
                                    // set responded to true
                                    ratelimit.get(ctx.from.id).responded = true;
                                    // return
                                    return;
                                } else return;
                            }
                        } else {
                            // add 1 to the number of messages
                            ratelimit.get(ctx.from.id).nbofmessages++;
                            // wait 30 seconds to remove 1 to the number of messages
                            setTimeout(() => {
                                ratelimit.get(ctx.from.id).nbofmessages--;
                                // if number of messages is 0, delete the user from the ratelimit map
                                if(ratelimit.get(ctx.from.id).nbofmessages == 0 && !ratelimit.get(ctx.from.id).ratelimit) ratelimit.delete(ctx.from.id);
                            }, removeafter * 1000);
                            // if the user has sent more than 5 messages in 30 seconds
                            if(ratelimit.get(ctx.from.id).nbofmessages > maxmessages) {
                                // set ratelimit to true
                                ratelimit.get(ctx.from.id).ratelimit = true;
                                // set time to blockedtime seconds
                                ratelimit.get(ctx.from.id).time = Date.now() + (blockedtime * 1000);
                                // send a message to the user
                                await ctx.reply('Vous êtes en train de spammer les commandes, veuillez patienter ' + blockedtime + ' secondes avant de pouvoir réutiliser une commande.');
                                // return
                                return;
                            }
                        }
                    // add the user to the ratelimit map
                    } else {
                        ratelimit.set(ctx.from.id, {time: Date.now(), responded: false, nbofmessages: 1, ratelimit: false});
                        // wait blockedtime seconds to remove 1 to the number of messages
                        setTimeout(() => {
                            ratelimit.get(ctx.from.id).nbofmessages--;
                            // if number of messages is 0, delete the user from the ratelimit map
                            if(ratelimit.get(ctx.from.id).nbofmessages == 0 && !ratelimit.get(ctx.from.id).ratelimit) ratelimit.delete(ctx.from.id);
                        }, removeafter * 1000);
                    }
                }

                console.log(`[TELEGRAM] Command ${command.data.name} executed`.brightGreen);
                await onCommand(ctx, command);
            });
            // add the command to the commandsInTelegramFormat array
            commandsInTelegramFormat.push({
                command: command.data.name,
                description: command.data.description
            });
        }
        console.log('[TELEGRAM] Telegram commands created'.brightGreen);

        // set the telegram commands
        console.log('[TELEGRAM] Setting telegram commands...'.brightBlue);
        await client.telegram.telegram.setMyCommands(commandsInTelegramFormat);
        console.log('[TELEGRAM] Telegram commands set'.brightGreen);

        // set start and help
        console.log('[TELEGRAM] Setting start and help commands...'.brightBlue);
        let help = await client.textcommands.get('help');
        
        client.telegram.start(async (ctx) => {
            await onCommand(ctx, help, true);
        });
        client.telegram.help(async (ctx) => {
            await onCommand(ctx, help);
        });
        console.log('[TELEGRAM] Start and help commands set'.brightGreen);

        // on command event
        async function onCommand(message, command, isStart) {
            // Si aucune commande trouvé
            if(!command || command.type != "slash") return;

            let commandName = command.data.name;

            // Modifier le message pour qu'il ressemble un peu plus à une interaction discord, même si c'est adapté à telegram
            message.content = message.message.text;
            // add things of message.message in message
            message.channel = {
                id: message.chat.id,
                type: message.chat.type,
                name: message.chat.title,
                guild: {
                    id: message.chat.id,
                    name: message.chat.title,
                    members: {
                        cache: {
                            get: (id) => {
                                return message.user;
                            }
                        }
                    }
                },
                createMessageComponentCollector: function(obj) {
                    const EventEmitter = require('events');
                    class Collector extends EventEmitter {
                        constructor() {
                            super();
                            this.filter = obj.filter;
                            this.time = obj.time;
                            this.ended = false;
                            this.collected = [];
                            this.on('collect', (data) => {
                                this.collected.push(data);
                            })
                            this.on('end', () => {
                                this.ended = true;
                            })
                        }
                    }
                    let collector = new Collector();
                    return collector;
                },
                messages: {
                    cache: [],
                    // get a number of messages with option obj.limit on the telegram chat, dm or group
                    fetch: async function(obj) {
                        return {
                            size: obj.limit || 99999999
                        }
                    }
                },
                bulkDelete: async function(number) {
                    // delete a number of messages on the telegram chat, dm or group
                    // get the id of the message sent by the bot
                    let message_id = message.message.message_id;
                    for(let i = 0; i < number; i++) {
                        try{
                            // delete the message
                            await client.telegram.telegram.deleteMessage(message.chat.id, message_id - i);
                        }catch(err){}
                    }
                    // return true
                    return true;
                },
            }
            // replace message author
            message.user = {
                id: message.from.id,
                username: message.from.username,
                discriminator: message.from.username,
                tag: message.from.username,
                displayAvatarURL: () => {return message.from.photo_url},
                avatarURL: () => {return message.from.photo_url},
                bot: false,
                fetch: async () => {return message.user}
            }
            message.author = message.user;
            // replace message guild
            let channelsMap = new Map();
            channelsMap.set(message.chat.id, {
                id: message.chat.id,
                type: message.chat.type,
                name: message.chat.title,
                guild: function() {return message.guild},
            })
            // get me with telegram.getChatMember
            let otherme = await client.telegram.telegram.getMe();
            let me = await client.telegram.telegram.getChatMember(message.chat.id, otherme.id);
            message.guild = {
                id: message.chat.id,
                name: message.chat.title,
                members: {
                    cache: [],
                    me: {
                        id: me.user.id,
                        username: me.user.username,
                        discriminator: me.user.username,
                        tag: me.user.username,
                        displayAvatarURL: () => {return me.user.photo_url},
                        bot: false,
                        fetch: async () => {return message.user},
                        // if user admin, add admin type Discord.js permission, absolutely all permissions
                        // else, add basic user type Discord.js permission
                        permissions: new PermissionsBitField(me.status == 'administrator' ? 1099511627775n : 104324673n)
                    }
                },
                fetch: async () => {return message.guild},
                channels: {
                    // get the only channel of the group
                    cache: channelsMap
                },
                roles: {
                    cache: new Map()
                },
                emojis: {
                    cache: new Map()
                },
                memberCount: "unknown"
            }
            // replace other things
            message.sourceType = 'textCommand';
            message.options = {};
            message.awaitModalSubmit = () => methodNotExists(message, 'awaitModalSubmit');
            message.showModal = () => methodNotExists(message, 'showModal');
            message.deferReply = async (options) => { 
                messageResponse = await message.reply('Veuillez patienter pendant l\'exécution de la commande...');
                return messageResponse;
            }
            message.fetchReply = async () => {return messageResponse;};
            message.followUp = async (options) => {client.telegram.telegram.sendMessage(message.chat.id, options.content, {parse_mode: 'MarkdownV2'});};
            message.deleteReply = async () => {client.telegram.telegram.deleteMessage(messageResponse.chat.id, messageResponse.message_id);};
            
            function removeLastInstance(badtext, str) {
                var charpos = str.lastIndexOf(badtext);
                if (charpos<0) return str;
                ptone = str.substring(0,charpos);
                pttwo = str.substring(charpos+(badtext.length));
                return (ptone+pttwo);
            }

            message.editReply = async (content) => {
                // if content is an object
                if(typeof content == 'object') {
                    // if we detect embeds, we convert them to telegram format
                    if(content?.embeds?.length > 0) {
                        // new content
                        let newcontent = '';
                        // for each embed
                        let i = 0;
                        for(let embed of content.embeds) {
                            i++;
                            embed = embed.data;
                            // add author
                            if(embed.author?.name) newcontent += `**${embed.author.name}**\n\n`;
                            // add title
                            if(embed.title) newcontent += `**${embed.title}**` + (embed.url ? (embed.url + '\n') : '\n');
                            // add url
                            if(embed.url) newcontent += `${embed.url}\n`;
                            // add description
                            if(embed.description) newcontent += `${embed.description}\n`;
                            // add fields
                            if(embed.fields?.length > 0) {
                                newcontent += '\n';
                                for(let field of embed.fields) {
                                    newcontent += `**${field.name}**\n${field.value}\n`;
                                }
                            }
                            // add footer
                            if(embed.footer?.text) newcontent += `\n${embed.footer.text}${embed.timestamp ? ' • ' + moment(embed.timestamp).format('DD/MM/YYYY HH:mm:ss') + '\n' : '\n'}`;
                            // image
                            if(embed.image?.url) newcontent += `${embed.image.url}\n`;
                            // thumbnail
                            //if(embed.thumbnail?.url) newcontent += `${embed.thumbnail.url}\n`;
                            // remove last '\n'
                            newcontent = removeLastInstance('\n', newcontent);
                            // if it is not the last embed, add a line break
                            if(i != content.embeds.length) newcontent += '\n\n';
                        }
                        // replace content
                        content = (content?.content || '') + '\n' + newcontent;
                    } else content = (content?.content || '');
                }

                try{
                    await client.telegram.telegram.editMessageText(messageResponse.chat.id, messageResponse.message_id, null, content, {parse_mode: 'markdown'});
                }catch(err){
                    console.log(`[TELEGRAM] Error while editing message : ${err.message}`.brightRed);
                    // use editMessageText from telegram bot
                    try{
                        await client.telegram.telegram.editMessageText(messageResponse.chat.id, messageResponse.message_id, null, content);
                    }catch(err){
                        console.log(`[TELEGRAM] Error (2) while editing message : ${err.message}`.brightRed);
                        client.telegram.telegram.sendMessage(message.chat.id, 'Une erreur est survenue lors de l\'édition du message. Veuillez réessayer plus tard.', {parse_mode: 'markdown'});
                    }
                }
                // retourner le message de réponse
                return messageResponse;
            }

            message.reply = async (content) => {
                // if content is an object
                if(typeof content == 'object') {
                    // if we detect embeds, we convert them to telegram format
                    if(content?.embeds?.length > 0) {
                        // new content
                        let newcontent = '';
                        // for each embed
                        for(let embed of content.embeds) {
                            embed = embed.data;
                            // add author
                            if(embed.author?.name) newcontent += `**${embed.author.name}**\n\n`;
                            // add title
                            if(embed.title) newcontent += `**${embed.title}**` + (embed.url ? (embed.url + '\n') : '\n');
                            // add description
                            if(embed.description) newcontent += `${embed.description}\n`;
                            // add fields
                            if(embed.fields?.length > 0) {
                                newcontent += '\n';
                                for(let field of embed.fields) {
                                    newcontent += `**${field.name}**\n${field.value}\n`;
                                }
                            }
                            // add footer
                            if(embed.footer?.text) newcontent += `\n${embed.footer.text}${embed.timestamp ? ' • ' + moment(embed.timestamp).format('DD/MM/YYYY HH:mm:ss') + '\n' : '\n'}`;
                            // image
                            if(embed.image?.url) newcontent += `${embed.image.url}\n`;
                            // thumbnail
                            //if(embed.thumbnail?.url) newcontent += `${embed.thumbnail.url}\n`;
                            // remove last '\n'
                            newcontent = removeLastInstance('\n', newcontent);
                        }
                        // replace content
                        content = (content?.content || '') + '\n' + newcontent;
                    } else content = (content?.content || '');
                }
                
                try{
                    messageResponse = await client.telegram.telegram.sendMessage(message.chat.id, content, {parse_mode: 'markdown'});
                }catch(err){
                    console.log(`[TELEGRAM] Error while sending message : ${err.message}`.brightRed);
                    // use sendMessage from telegram bot
                    try{
                        messageResponse = await client.telegram.telegram.sendMessage(message.chat.id, content);
                    }catch(err){
                        console.log(`[TELEGRAM] Error (2) while sending message : ${err.message}`.brightRed);
                        client.telegram.telegram.sendMessage(message.chat.id, 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.', {parse_mode: 'markdown'});
                    }
                }
                // retourner le message de réponse
                return messageResponse;
            }
            message.deleteToReply = async () => {
                try{
                    await client.telegram.telegram.deleteMessage(message.chat.id, message.message.message_id);
                }catch(err){}
                return true;
            }

            // Si la commande ne doit pas être exécutée en message privé, mais qu'on est en message privé
            if(command?.data?.dm_permission == false && command.telegram != "enabled") {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle("Salon invalide")
                        .setDescription(`Vous ne pouvez pas exécuter cette commande en message privée (Sur Discord), il est donc impossible de l'utiliser sur telegram. Réessayer depuis un serveur.`)
                        .setColor(client.embedcolor)
                    ]
                })
            }

            // Fonction pour dire que la méthode voulue n'existe pas
            async function methodNotExists(message, method){
                if(messageResponse) {
                    message.editReply(`La méthode \`${method}\` n'est pas disponible dans cet environnement. Demander au créateur de ce module de porter la méthode dans le type d'environnement \`text command\`.`)
                } else {
                    message.reply(`La méthode \`${method}\` n'est pas disponible dans cet environnement. Demander au créateur de ce module de porter la méthode dans le type d'environnement \`text command\`.`)
                    throw new Error('Méthode non disponible dans cette environnement.')
                }
            }

            // Préparer la variable qui contiendra le message de réponse
            var messageResponse = {};
            
            let options = command.data.options;

            // check if one of the options is a subcommand (has options)
            let hasSubcommand = options.filter(option => option.options != undefined).length > 0;
            // check if one of the options is a subcommand group (has options)
            let hasSubcommandGroup = options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).length > 0;
            if(hasSubcommandGroup) hasSubcommand = false;

            // Obtenir les arguments à partir du contenu du message
            var args = message.content
                .replace(`/${isStart ? "start" : commandName}${'@' + otherme.username} `, '')
                .replace(`/${isStart ? "start" : commandName}${'@' + otherme.username}`, '')
                .replace(`/${isStart ? "start" : commandName} `, '')
                .replace(`/${isStart ? "start" : commandName}`, '');
            
            // verifier si le message contient une des sous-commande (sinon, renvoyer une erreur)
            let SubcommandError = true;
            if(hasSubcommand) {
                for(let option of options.filter(option => option.options != undefined)) {
                    if(args.startsWith(option.name)) SubcommandError = false;
                }
            } else SubcommandError = false;
            if(SubcommandError) return message.reply({ embeds: [new EmbedBuilder().setTitle("Sous-commande manquante").setDescription(`Vous devez spécifier une sous-commande pour exécuter cette commande.\nIl y a ${options.filter(option => option.options != undefined).length} sous-commande${options.filter(option => option.options != undefined).length > 1 ? 's' : ''} disponibles : \`${options.filter(option => option.options != undefined).map(option => option.name).join(', ')}\``).setColor(client.embedcolor)] })
            // verifier si le message contient un sous-groupe de commandes (sinon, renvoyer une erreur)
            let SubcommandGroupError = true;
            let SubcommandInGroupError = true;
            if(hasSubcommandGroup) {
                for(let option of options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0)) {
                    if(args.startsWith(option.name)) {SubcommandGroupError = false; SubcommandGroupName = option.name;}
                    for(let suboption of option.options.filter(suboption => suboption.options != undefined)) {
                        if(args.startsWith(option.name + ' ' + suboption.name)) SubcommandInGroupError = false;
                    }
                }
            } else {SubcommandGroupError = false; SubcommandInGroupError = false;}
            if(SubcommandGroupError) return message.reply({ embeds: [new EmbedBuilder().setTitle("Sous-groupe de commandes manquant").setDescription(`Vous devez spécifier un sous-groupe de commandes pour exécuter cette commande.\nIl y a ${options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).length} sous-groupe${options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).length > 1 ? 's' : ''} de commandes disponibles : \`${options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).map(option => option.name).join(', ')}\``).setColor(client.embedcolor)] })
            if(SubcommandInGroupError) return message.reply({ embeds: [new EmbedBuilder().setTitle("Sous-commande manquante").setDescription(`Vous devez spécifier une sous-commande pour exécuter cette commande.\nIl y a ${options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).filter(option => option.name == SubcommandGroupName)[0].options.filter(suboption => suboption.options != undefined).length} sous-commande${options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).filter(option => option.name == SubcommandGroupName)[0].options.filter(suboption => suboption.options != undefined).length > 1 ? 's' : ''} disponibles dans le sous-groupe de commandes \`${SubcommandGroupName}\` : \`${options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).filter(option => option.name == SubcommandGroupName)[0].options.filter(suboption => suboption.options != undefined).map(suboption => suboption.name).join(', ')}\``).setColor(client.embedcolor)] })

            let subcommand = '';
            let subcommandGroup = '';
            // si la commande a des sous-commandes ou des sous-groupes de commandes, detecter dans le message le nom de la sous-commande ou du sous-groupe de commandes
            if(hasSubcommand || hasSubcommandGroup){
                if(hasSubcommand){
                    // with filter
                    let subobject = options.filter(option => option.options != undefined);
                    for(let object of subobject){
                        if(args.startsWith(object.name)) {
                            subcommand = object.name;
                            options = object.options;
                            if(args.startsWith(subcommand + ' ')) args = args.replace(subcommand + ' ', ''); else args = args.replace(subcommand, '');
                        }
                    }
                } else if(hasSubcommandGroup){
                    // with filter
                    subobject = options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0);
                    for(let object of subobject){
                        if(args.startsWith(object.name)) {
                            subcommandGroup = object.name;
                            if(args.startsWith(subcommandGroup + ' ')) args = args.replace(subcommandGroup + ' ', ''); else args = args.replace(subcommandGroup, '');
                            subobject = object.options.filter(option => option.options != undefined);
                            for(let object of subobject){
                                if(args.startsWith(object.name)) {
                                    subcommand = object.name;
                                    options = object.options;
                                    if(args.startsWith(subcommand + ' ')) args = args.replace(subcommand + ' ', ''); else args = args.replace(subcommand, '');
                                }
                            }
                        }
                    }
                }
            }

            // Diviser les arguments avec des ";"
            if(args.includes(';')){
                // Diviser les arguments avec des ";"
                if(args.includes('; ')) {
                    args = args.split('; ');
                } else {
                    args = args.split(';');
                }
            } else {
                // Si il n'y a pas de ";" dans les arguments, on les met dans un tableau
                if(args.includes(' ')) {
                    args = args.split(' ')
                } else {
                    args = [args]
                }
            }

            // Obtenir le contenu d'un argument par son nom
            function getArg(argName){
                // Vérifier si l'argument n'est pas un argument slash mais un argument traditionnel
                // si il a plusieurs arguments dans la commande, on vérifie que l'argument est bien à la bonne position
                if(options.length > 1){
                    // les textes entre guillemets sont considérés comme un seul argument "je suis un argument" "je suis un autre argument" 'moi aussi' `et moi les gars !`
                    if(args.join(' ').includes('"') || args.join(' ').includes("'") || args.join(' ').includes('`')) {
                        let quoted = false;
                        let newargs = [];
                        let thenewarg = '';
                        for(var i = 0; i < args.length; i++){
                            if(args[i].startsWith('"') || args[i].startsWith("'") || args[i].startsWith('`')
                                || args[i].endsWith('"') || args[i].endsWith("'") || args[i].endsWith('`')
                            ) {
                                if(!quoted) {
                                    quoted = true;
                                    thenewarg = args[i].replace('"', '').replace("'", '').replace("`", '') + ' ';
                                } else {
                                    quoted = false;
                                    newargs.push(thenewarg + args[i].replace('"', '').replace("'", '').replace("`", ''));
                                    thenewarg = "";
                                }
                            } else {
                                if(quoted) {
                                    thenewarg += args[i] + ' ';
                                } else {
                                    newargs.push(args[i]);
                                }
                            }
                        }
                        args = newargs;
                    }
                    // on vérifie que l'argument est bien à la bonne position
                    for(var i = 0; i < args.length; i++){
                        let index = options.findIndex(option => option.name == argName); // search options argName position
                        if(!args[i].includes(':') && index == i) return args[i]; // if args not include ":" and index == i
                    }
                } else return args.join(' '); // cas ou il n'y a qu'un seul argument dans la commande, donc on retourne tout les arguments
                // Cette verification est nécessaire car elle permet de rendre plus facile l'utilisation d'une commande traditionnelle si un ou plusieurs arguments n'ont pas de ":" dans leurs noms (ex: !commande arg1 arg2 arg3)

                // Diviser chaque argument par un ":"
                for(var i = 0; i < args.length; i++){
                    if(args[i].includes(':')) {
                        if(args[i].includes(': ')) {
                            argument = args[i].split(': ')
                        } else {
                            argument = args[i].split(':')
                        }
                        if(argument[0] === argName) return argument.slice(1).join(':');
                    }
                }
                // Cette verification est nécessaire car elle permet de rendre la selection d'un argument façon slash possible si un ou plusieurs arguments ont un ":" dans leurs noms (ex: !commande arg1:arg1value arg2:arg2value arg3:arg3value)

                // Retourner null si aucune valeur n'est trouvé
                return null;
            }
            
            // get client
            message.client = client;
            // Recréé les fonctions pour obtenir une option
            message.options.getSubcommand = () => {
                return subcommand;
            }
            message.options.getSubcommandGroup = () => {
                return subcommandGroup;
            }
            message.options.getString = (parametername) => {
                return getArg(parametername)?.toString() || null;
            }
            message.options.getBoolean = (parametername) => {
                var argument = getArg(parametername);
                if(argument && argument.toLowerCase() == 'true') {
                    return true
                } else {
                    if(argument && argument.toLowerCase() == 'false') {
                        return false
                    }
                }

                // Rien de valide, on retourne null
                return null;
            }
            message.options.getUser = (parametername) => {
                var argument = getArg(parametername);
                if(argument){
                    // Obtenir l'identifiant
                    var id = argument.replace('<', '').replace('>', '').replace('@', '').replace('!', '').replace('&', '').replace('#', '').replace(' ', '');
                    id = id.replace(/[^0-9]/g, '');
                    
                    // Obtenir l'utilisateur
                    
                    var user = client.users.cache.get(id);
                    if(user) return user;

                    return null;
                } else return null;
            }
            message.options.getMember = (parametername) => {
                var argument = getArg(parametername);
                if(argument){
                    // Obtenir l'identifiant
                    var id = argument.replace('<', '').replace('>', '').replace('@', '').replace('!', '').replace('&', '').replace('#', '').replace(' ', '');
                    id = id.replace(/[^0-9]/g, '');
                    
                    // Obtenir le membre

                    var member = message?.guild?.members?.cache?.get(id);
                    if(member) return member;

                    return null;
                } else return null;
            }
            message.options.getChannel = (parametername) => {
                var argument = getArg(parametername);
                if(argument){
                    // Obtenir l'identifiant
                    var id = argument.replace('<', '').replace('>', '').replace('@', '').replace('!', '').replace('&', '').replace('#', '').replace(' ', '');
                    id = id.replace(/[^0-9]/g, '');

                    // Obtenir le salon

                    var channel = message?.guild?.channels?.cache?.get(id);
                    if(channel) return channel;

                    return null;
                } else return null
            }
            message.options.getRole = (parametername) => {
                var argument = getArg(parametername);
                if(argument){
                    // Obtenir l'identifiant
                    var id = argument.replace('<', '').replace('>', '').replace('@', '').replace('!', '').replace('&', '').replace('#', '').replace(' ', '');
                    id = id.replace(/[^0-9]/g, '');
                    
                    // Obtenir le rôle

                    var role = message?.guild?.roles?.cache?.get(id);
                    if(role) return role;

                    return null;
                } else return null;
            }
            message.options.getMentionable = (parametername) => {
                var argument = getArg(parametername);
                if(argument){
                    // Obtenir l'identifiant
                    var id = argument.replace('<', '').replace('>', '').replace('@', '').replace('!', '').replace('&', '').replace('#', '').replace(' ', '');
                    id = id.replace(/[^0-9]/g, '');

                    // Obtenir le membre ou le rôle

                    var user = client.users.cache.get(id);
                    if(user) return user;
                    var role = message?.guild?.roles?.cache?.get(id);
                    if(role) return role;
                    
                    return null;
                } else return null;
            }
            message.options.getInteger = (parametername) => {
                var argument = getArg(parametername);
                if(argument && !isNaN(parseInt(argument))) return parseInt(argument);
                else return null;
            }
            message.options.getNumber = (parametername) => {
                var argument = getArg(parametername);
                if(argument && !isNaN(parseFloat(argument))) return parseFloat(argument);
                else return null;
            }
            message.options.getAttachment = () => {
                return message?.attachments?.first() || null;
            }

            // Vérifier qu'on ai rempli toutes les options requises
            let stop = false;
            let stopreason = 'Aucune raison, mais la commande n\'a pas été exécutée.';
            for(let option of options){
                if(getArg(option.name)) {
                    // Si c'est un nombre ou un int, vérifier qu'il est bien dans les limites
                    if(option.type == 10 || option.type == 4){
                        if(message.options.getNumber(option.name) < option.min_value){
                            stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` doit être un nombre supérieure à ${option.min_value}.`;
                        }
                        if(option.min_value && message.options.getNumber(option.name) > option.max_value){
                            stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` doit être un nombre inférieure à ${option.max_value}.`;
                        }
                        if(message.options.getInteger(option.name) < option.min_value){
                            stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` doit être un nombre entier supérieure à ${option.min_value}.`;
                        }
                        if(option.max_value && message.options.getInteger(option.name) > option.max_value){
                            stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` doit être un nombre entier inférieure à ${option.max_value}.`;
                        }
                    }
                    // Si c'est un string, vérifier la longueur
                    if(option.type == 3) {
                        if(option.min_length && message.options.getString(option.name).length < option.min_length){
                            stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` doit faire au moins ${option.min_length} caractères.`;
                        }
                        if(option.max_length && message.options.getString(option.name).length > option.max_length){
                            stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` doit faire moins de ${option.max_length} caractères.`;
                        }
                    }
                    // Si l'option n'est pas du bon type (et qu'on a entrer quelque chose)
                    if(option.type == 3 && !message.options.getString(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être un \`texte\`.`;
                    }
                    if(option.type == 4 && !message.options.getInteger(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être un \`nombre entier\`.`;
                    }
                    if(option.type == 5 && !message.options.getBoolean(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être un \`booléen\`.`;
                    }
                    if(option.type == 6 && !message.options.getUser(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être une \`mention vers un utilisateur\`.`;
                    }
                    if(option.type == 7 && !message.options.getChannel(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être une \`mention vers un salon\`.`;
                    }
                    if(option.type == 8 && !message.options.getRole(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être une \`mention vers un rôle\`.`;
                    }
                    if(option.type == 9 && !message.options.getMentionable(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être une \`mention vers un utilisateur ou un rôle\`.`;
                    }
                    if(option.type == 10 && !message.options.getNumber(option.name)){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` est invalide, celui-ci doit être un \`nombre\`.`;
                    }
                } else {
                    // Si l'options est requise, vérifier qu'on ai entrer quelque chose
                    if(option.required){
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` n'est pas spécifié dans la commande que vous venez d'exécuter. Veuillez utiliser la commande comme ça : \`/${commandName} ${hasSubcommand ? (subcommand + ' '):''}${hasSubcommandGroup ? (subcommandGroup + ' ' + subcommand + ' '):''}${options.filter(op => op.required).map(op => `${op.name}:<un contenu>`).join(', ')}\``;
                    }
                }
            }
            message.telegram = true;
            // Si on a pas rempli toutes les options requises, annuler la commande
            if(stop == true) {
                message.reply({ embeds: [new EmbedBuilder().setTitle("Commande annulée").setDescription(stopreason).setColor("#ff0000")] });
                return console.log(("[MESSAGE] Commande Telegram executée par " + message.author.username + " (" + message.author.id + ") annulée car un argument était invalide.").yellow);
            }
            // Exécuter la commande
            try {
                await client.textcommands.get(commandName).execute(message);
                console.log(`[MESSAGE] Commande Telegram ${commandName} exécutée avec succès par ${message.author.username} (${message.author.id}) sur ${message.guild.name} (${message.guild.id}) dans le salon ${message.channel.name} (${message.channel.id})`.brightGreen);
            } catch (error){
                message.reply({ embeds: [new EmbedBuilder().setTitle("Une erreur est survenue").setDescription("Une erreur est survenue lors de l'exécution de la commande, veuillez contacter un administrateur.").setColor("#ff0000")] });
                console.log(`[ERROR] Commande Telegram ${commandName} exécutée par ${message.author.username} (${message.author.id} sur ${message.guild.name} (${message.guild.id}) dans le salon ${message.channel.name} (${message.channel.id}) a échoué`.brightRed);
                console.log(error);
            }
        }

        // lance le bot telegram
        client.telegram.launch();
        console.log('[TELEGRAM] Telegram bot started'.brightGreen);
    }
}