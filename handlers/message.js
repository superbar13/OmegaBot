const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const ratelimit = new Map();

module.exports = {
    name: 'message',
    run: async(client) => {
        // on message event
        client.on('messageCreate', async message => {
            let prefix = client.prefix; // on récupère le prefix du bot
            // Empêcher les bots
            if(message.author.bot) return

            // Uniquement si c'est le bon prefix
            if(!message.content.startsWith(prefix)) return;

            // Obtenir le nom de la commande
            var args = message.content?.split(prefix)?.[1]?.trim()?.split(' '); // on sépare le prefix et la commande
            var commandName = args?.[0]?.toLowerCase() // on peut pas faire de commande slash avec majuscules donc on met tout en minuscules
            delete args // on a plus besoin de ça finalement donc on supprime, eh oui c'est rigolo de faire des trucs inutiles

            // Vérifier si la commande existe sous forme de commande slash
            var command = client.textcommands.get(commandName);

            // Si aucune commande trouvé
            if(!command || command.type != "slash") return;

            if(command.ratelimit) {
                let blockedtime = command.rateblockedtime || process.env.BLOCKEDTIME || 30;
                let maxmessages = command.ratemaxmessages || process.env.MAXMESSAGES || 5;
                let removeafter = command.rateremoveafter || process.env.REMOVEAFTER || 30;

                // check if the user is in the ratelimit map
                if(ratelimit.get(message.author.id)) {
                    // if the user is ratelimited
                    if(ratelimit.get(message.author.id).ratelimit) {
                        if(ratelimit.get(message.author.id).time < Date.now()) {
                            // delete the user from the ratelimit map
                            ratelimit.delete(message.author.id);
                        } else {
                            // if the user has not been responded
                            if(!ratelimit.get(message.author.id).responded) {
                                // send a message to the user
                                await message.reply('Vous êtes bannis des commandes pendant ' + blockedtime + ' secondes pour avoir spammer les commandes, le bot ne répondra plus à vos commandes pendant ' + blockedtime + ' secondes.');
                                // set responded to true
                                ratelimit.get(message.author.id).responded = true;
                                // return
                                return;
                            } else return;
                        }
                    } else {
                        // add 1 to the number of messages
                        ratelimit.get(message.author.id).nbofmessages++;
                        // wait 30 seconds to remove 1 to the number of messages
                        setTimeout(() => {
                            ratelimit.get(message.author.id).nbofmessages--;
                            // if number of messages is 0, delete the user from the ratelimit map
                            if(ratelimit.get(message.author.id).nbofmessages == 0 && !ratelimit.get(message.author.id).ratelimit) ratelimit.delete(message.author.id);
                        }, removeafter * 1000);
                        // if the user has sent more than 5 messages in 30 seconds
                        if(ratelimit.get(message.author.id).nbofmessages > maxmessages) {
                            // set ratelimit to true
                            ratelimit.get(message.author.id).ratelimit = true;
                            // set time to blockedtime seconds
                            ratelimit.get(message.author.id).time = Date.now() + (blockedtime * 1000);
                            // send a message to the user
                            await message.reply('Vous êtes en train de spammer les commandes, veuillez patienter ' + blockedtime + ' secondes avant de pouvoir réutiliser une commande.');
                            // return
                            return;
                        }
                    }
                // add the user to the ratelimit map
                } else {
                    ratelimit.set(message.author.id, {time: Date.now(), responded: false, nbofmessages: 1, ratelimit: false});
                    // wait blockedtime seconds to remove 1 to the number of messages
                    setTimeout(() => {
                        ratelimit.get(message.author.id).nbofmessages--;
                        // if number of messages is 0, delete the user from the ratelimit map
                        if(ratelimit.get(message.author.id).nbofmessages == 0 && !ratelimit.get(message.author.id).ratelimit) ratelimit.delete(message.author.id);
                    }, removeafter * 1000);
                }
            }

            // Si la commande ne doit pas être exécutée en message privé, mais qu'on est en message privé
            if(command?.data?.dm_permission == false // Si la commande ne doit pas être exécutée en message privé
                && (
                    message.channel.type == 1 // Si on est en dm
                    || message.channel.type == 3 // Si on est en dm
                )
            ){
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle("Salon invalide")
                        .setDescription(`Vous ne pouvez pas exécuter cette commande en message privée. Réessayer depuis un serveur.`)
                        .setColor(client.embedcolor)
                    ]
                })
            }

            // Vérifier les permissions de l'utilisateur
            if(command?.data?.default_member_permissions){
                // Obtenir les permissions de la commande (default_member_permissions)
                var permissions = new PermissionsBitField(command?.data?.default_member_permissions)

                // Vérifier les permissions si on est pas en dm
                if(message.channel.type != 1 // Si on est pas en dm
                    && message.channel.type != 3 // Si on est pas en dm
                    && !message?.guild?.members?.cache?.get(message.author.id)?.permissions?.has(permissions) // Si on a pas les permissions
                ) {
                    var array = permissions.toArray()
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle("Permissions insuffisantes")
                            .setDescription(`Vous n'avez pas ${array.length > 1 ? 'les' : 'la'} permission${array.length > 1 ? 's' : ''} nécessaire${array.length > 1 ? 's' : ''} pour exécuter cette commande. Vous devez avoir ${array.length > 1 ? 'les' : 'la'} permission${array.length > 1 ? 's' : ''} suivante${array.length > 1 ? 's' : ''} : \`${array.join(', ')}\``)
                            .setColor(client.embedcolor)
                        ]
                    })
                }
            }

            // Préparer la variable qui contiendra le message de réponse
            var messageResponse;

            // Fonction pour dire que la méthode voulue n'existe pas
            async function methodNotExists(message, method){
                if(messageResponse) {
                    messageResponse.edit(`La méthode \`${method}\` n'est pas disponible dans cet environnement. Demander au créateur de ce module de porter la méthode dans le type d'environnement \`text command\`.`)
                } else {
                    message.reply(`La méthode \`${method}\` n'est pas disponible dans cet environnement. Demander au créateur de ce module de porter la méthode dans le type d'environnement \`text command\`.`)
                    throw new Error('Méthode non disponible dans cette environnement.')
                }
            }

            // Modifier le message pour qu'il ressemble un peu plus à une interaction
            message.user = message.author;
            message.sourceType = 'textCommand';
            message.options = {};
            message.awaitModalSubmit = () => methodNotExists(message, 'awaitModalSubmit');
            message.showModal = () => methodNotExists(message, 'showModal');
            message.deferReply = async (options) => {
                if(options?.ephemeral) {
                    messageResponse = await message.user.send('Veuillez patienter pendant l\'exécution de la commande...');
                } else {
                    
                    messageResponse = await message.reply('Veuillez patienter pendant l\'exécution de la commande...');
                }
                return messageResponse;
            }
            message.fetchReply = async () => {return messageResponse;};
            message.followUp = async (content) => {messageResponse.reply(content)};
            message.deleteReply = async () => {messageResponse.delete();};
            message.editReply = async (content) => {
                // Si on peut modifier le message, le modifier
                if(messageResponse?.editable){
                    if(!content?.content) content.content = "​";
                    await messageResponse.edit(content);
                } else {
                    // Sinon, on vérifie qu'on peut le supprimer (et si oui, on le fait)
                    if(messageResponse?.deletable) await messageResponse.delete();
                    messageResponse = await message.reply(content);
                }
            }
            message.reply = async (content) => {
                // sauvegarder le nouveau message de réponse
                messageResponse = await message.channel.send(content);
                // retourner le message de réponse
                return messageResponse;
            }
            message.deleteToReply = async () => {
                // Supprimer le message de l'utilisateur
                await message.delete();
            }
            
            let options = command.data.options;

            // check if one of the options is a subcommand (has options)
            let hasSubcommand = options.filter(option => option.options != undefined).length > 0;
            // check if one of the options is a subcommand group (has options)
            let hasSubcommandGroup = options.filter(option => option.options != undefined && option.options.filter(suboption => suboption.options != undefined).length > 0).length > 0;
            if(hasSubcommandGroup) hasSubcommand = false;
            
            // Obtenir les arguments à partir du contenu du message
            var args = message.content.replace(prefix + ' ', '');
            // Si ça commence par le préfixe, on l'enlève
            if(args.startsWith(prefix)) args = args.replace(prefix, '');
            // Enlever le nom de la commande des arguments
            if(args.startsWith(commandName + ' ')) args = args.replace(commandName + ' ', ''); else args = args.replace(commandName, '');

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
                        stop = true; stopreason = `L'argument \`${option.name.replace(/`/g, ' `')}\` n'est pas spécifié dans la commande que vous venez d'exécuter. Veuillez utiliser la commande comme ça : \`${prefix}${commandName} ${hasSubcommand ? (subcommand + ' '):''}${hasSubcommandGroup ? (subcommandGroup + ' ' + subcommand + ' '):''}${options.filter(op => op.required).map(op => `${op.name}:<un contenu>`).join(', ')}\``;
                    }
                }
            }
            // Si on a pas rempli toutes les options requises, annuler la commande
            if(stop == true) {
                message.reply({ embeds: [new EmbedBuilder().setTitle("Commande annulée").setDescription(stopreason).setColor("#ff0000")] });
                return console.log(("[MESSAGE] Commande executée par " + message.author.username + " (" + message.author.id + ") annulée car un argument était invalide.").yellow);
            }
            // Exécuter la commande
            try {
                await client.textcommands.get(commandName).execute(message);
                if(message.channel.type != 1 && message.channel.type != 3) console.log(`[MESSAGE] Commande ${commandName} exécutée avec succès par ${message.author.username} (${message.author.id}) sur ${message.guild.name} (${message.guild.id}) dans le salon ${message.channel.name} (${message.channel.id})`.brightGreen);
                else if(message.channel.type == 1) console.log(`[MESSAGE] Commande ${commandName} exécutée avec succès par ${message.author.username} (${message.author.id}) en message privé`.brightGreen);
                else if(message.channel.type == 3) console.log(`[MESSAGE] Commande ${commandName} exécutée avec succès par ${message.author.username} (${message.author.id}) en message privé dans le groupe ${message.channel?.name ? message.channel.name : message.channel.recipients.map(user => user.username).join(', ')} (${message.channel.id})`.brightGreen);
            } catch (error){
                message.reply({ embeds: [new EmbedBuilder().setTitle("Une erreur est survenue").setDescription("Une erreur est survenue lors de l'exécution de la commande, veuillez contacter un administrateur.").setColor("#ff0000")] });
                if(message.channel.type != 1 && message.channel.type != 3) {
                    console.log(`[ERROR] Commande ${commandName} exécutée par ${message.author.username} (${message.author.id} sur ${message.guild.name} (${message.guild.id}) dans le salon ${message.channel.name} (${message.channel.id}) a échoué`.brightRed);
                } else if(message.channel.type == 1) {
                    console.log(`[ERROR] Commande ${commandName} exécutée par ${message.author.username} (${message.author.id}) en message privé a échoué`.brightRed);
                } else if(message.channel.type == 3) {
                    console.log(`[ERROR] Commande ${commandName} exécutée par ${message.author.username} (${message.author.id}) en message privé dans le groupe ${message.channel?.name ? message.channel.name : message.channel.recipients.map(user => user.username).join(', ')} (${message.channel.id}) a échoué`.brightRed);
                }
                console.log(error);
            }
        });
    }
}