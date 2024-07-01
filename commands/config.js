// in guildconfig you can have config options that are in the guilds / servers database
// there are 2 types of configs : data and category
// data is a config that is a simple value (string, number, boolean, array, object)
// category is a config that is a category of configs
// category can have childs that are data or category
// there are 2 types of categories : showed and database
// showed category is a category that is showed in the config command but is not in the database
// database category is a category that is showed in the config command and is in the database
// example of showed category : levels.announce (in the database there is no levels.announce.announce but there is levels.announce)
// example of database category : levels (in the database there is levels and there can be levels.enabled...)
// to check if it is data or category you can check the type property of the config
// if the type is showedcategory or databasecategory it is a category
// databasecategory can be showed with showed: true or false
// showedcategory is always showed (it is in the name, like showed category, THAT'S WHY IT IS SHOWED) (i'm sorry for this joke)
// if the type is string, number, boolean, array, object it is a data
// if you want to add a config option you can add it here, it will appear in the config command and in the dashboard (if the dashboard module is loaded)

// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// function getCat
function getCat(name, toS) {
    let cat = toS[name] || Object.entries(toS).find(([key, value]) => value.displayname == name)[1];
    if(!cat || (cat.type != 'showedcategory' && cat.type != 'databasecategory'))
        return interaction.editReply({ content: `La catégorie \`${name}\` n'existe pas dans le module \`${modulename}\`.`, ephemeral: true });
    
    cat.name = name;
    let childs = cat.childs;
    if(!toS[name]) cat.name = Object.keys(toS).find(key => toS[key].displayname == name);
    return childs, cat;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure ou affiche la configuration du serveur')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Affiche la configuration du serveur')
                .addStringOption(option =>
                    option.setName('module')
                        .setDescription('Module de configuration à afficher')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Configure une option de configuration du serveur')
                .addStringOption(option =>
                    option.setName('module')
                        .setDescription('Module de configuration à configurer')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Catégorie de configuration à configurer (si besoin)')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('subcategory')
                        .setDescription('Sous-catégorie de configuration à configurer (si besoin)')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('option')
                        .setDescription('Option de configuration à configurer')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('value')
                        .setDescription('Valeur de l\'option de configuration à configurer')
                        .setRequired(false)
                        .setAutocomplete(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Réinitialise une option de configuration du serveur')
                .addStringOption(option =>
                    option.setName('module')
                        .setDescription('Module de configuration à réinitialiser')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('option')
                        .setDescription('Option de configuration à réinitialiser')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Catégorie de configuration à réinitialiser (si besoin)')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName('subcategory')
                        .setDescription('Sous-catégorie de configuration à réinitialiser (si besoin)')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
        category: 'config',
    async execute(interaction){
        // defer the reply
        await interaction.deferReply({ ephemeral: false });

        // We configure modules for servers / guilds here
        
        // check if the server is in the database
        var server = await interaction.client.serversdb.findOne({ id: interaction.guild.id });
        if(!server) return interaction.editReply({ content: 'Le serveur n\'est pas enregistré dans la base de données !', ephemeral: true });

        // check which subcommand is used
        if(interaction.options.getSubcommand() == 'show') {
            // we will show the config of all modules located in client.modules collection
            // first we create the embed
            let embed = new EmbedBuilder()
                .setTitle('Configuration du serveur')
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setTimestamp();
            
            //// ALL MODULES SHOW //// 
            // then we loop in all modules
            // get module string option
            var modulestring = interaction.options.getString('module');
            if(!modulestring) {
                embed.setDescription(`Pour afficher la configuration d\'un module, utilisez '/config show <module>'
                \nLes modules disponibles sont :
                \n• ${Object.values(interaction.client.modules).filter(module => module.guildconfig).map(module => module.showname).join('\n• ')}`);
                return interaction.editReply({ embeds: [embed] });
            }

            //// ONE MODULE SHOW ////
            // check if the module exists
            if(!interaction.client.modules[modulestring]
                && !Object.entries(interaction.client.modules).find(([key, value]) => value.showname == modulestring)
            ) return interaction.editReply({ content: 'Le module n\'existe pas !', ephemeral: true });
            // get module REAL name (not displayname) (key of the module in the collection)
            else if(!interaction.client.modules[modulestring])
                modulestring = Object.keys(interaction.client.modules).find(key => interaction.client.modules[key].showname == modulestring);

            // we find the module
            let module = interaction.client.modules[modulestring] || Object.entries(interaction.client.modules).find(([key, value]) => value.showname == modulestring);

            if(!module.guildconfig) return interaction.editReply({ content: 'Le module n\'a pas de configuration serveur !', ephemeral: true });

            // startChars
            let startChars = ['##', '###', '>', '-', '+', ':', '/', '=', '°', '~'];

            // function getpath
            function getpath(path, obj) {
                try{
                    path = path.replace('[', '.').replace(']', '');
                    let patharray = path.split('.');
                    // remove empty strings
                    patharray = patharray.filter(function (el) {
                        return el != "";
                    });
                    let obj1 = obj;
                    for(const path1 of patharray){
                        try{
                            obj1 = obj1[path1];
                            if(!obj1) return null;
                        } catch (error) {
                            return null;
                        }
                    }
                    return obj1;
                } catch (error) {
                    return null;
                }
            }

            // function loopConfig
            function loopConfig(Obj, startChar, level, server, path = '', config = '') {
                let newconfig = ''+config;
                for(const [key, option] of Object.entries(Obj)) {
                    // if it is a category
                    if(option.type == 'databasecategory') {
                        // we get the server
                        let server1 = server[key];

                        // we add the category to the config string
                        if(option.showed) {
                            newconfig += `${startChar} **__${option.displayname}__** (${key}) \n*${option.description}*\n`;
                            if(Object.keys(Obj)[0] == key) newconfig += "\n";

                            // loop in the category
                            newconfig += loopConfig(option.childs, startChars[level + 1], level + 1, path, server1, '');
                        } else {
                            newconfig += loopConfig(option.childs, startChars[level], level + 1, path, server1, '');
                        }
                    
                    // if it is a showed category
                    } else if(option.type == 'showedcategory') {
                        // we get the server
                        let server1 = server;

                        // we add the category to the config string
                        newconfig += `${startChar} **__${option.displayname}__** (${key}) \n*${option.description}*\n`;
                        if(Object.keys(Obj)[0] == key) config += "\n";

                        // loop in the category
                        newconfig += loopConfig(option.childs, startChars[level + 1], level + 1, path, server1, '');
                    }

                    // if it is a data boolean
                    else if(option.type == 'boolean') newconfig += `- ${option.displayname} (${key}) : ${getpath(path + `[${key}]`, server) ? '✅' : '❌'}\n> ${option.description ? (option.description + '\n') : ''}`;

                    // if it is a data
                    else newconfig += `- ${option.displayname} (${key}) : ${getpath(path + `[${key}]`, server) ? getpath(path + `[${key}]`, server) : '❌'}\n> ${option.description ? (option.description + '\n') : ''}`;
                }
                return newconfig;
            }

            // we loop in all config options (module.guildconfig)
            let config = loopConfig(module.guildconfig, startChars[0], 0, server);
            
            // MAX MESSAGE LENGTH : 2000
            // if the message is too long, we split it, the split need to be where there is a \n
            // we split the message
            let splitConfigArray = config.split('\n');
            let splitConfig = [];
            for(var i = 0; i < splitConfigArray.length; i++) {
                if(splitConfig[splitConfig.length - 1] && splitConfig[splitConfig.length - 1].length + splitConfigArray[i].length < 2000) {
                    splitConfig[splitConfig.length - 1] += splitConfigArray[i] + '\n';
                } else {
                    splitConfig.push(splitConfigArray[i] + '\n');
                }
            }

            // we send the message
            let first = true;
            for(const split of splitConfig) {
                embed.setDescription(split);
                if(first) {
                    interaction.editReply({ embeds: [embed] });
                    first = false;
                } else {
                    interaction.followUp({ embeds: [embed] });
                }
            }
        }
        if(interaction.options.getSubcommand() == 'set' || interaction.options.getSubcommand() == 'reset') {
            /////////////////////// DEBUT DE SELECTION ///////////////////////

            // get module and modulename
            const modules = interaction.client.modules;
            let modulename = interaction.options.getString('module');

            // get module
            let choosenmodule = modules[modulename] || Object.entries(modules).find(([key, value]) => value.showname == modulename)[1];

            // check if the module exists
            if(!choosenmodule) return interaction.editReply({ content: `Le module \`${modulename}\` n'existe pas.`, ephemeral: true });

            // get module REAL name
            if(!modules[modulename]) modulename = Object.keys(modules).find(key => modules[key].showname == modulename);
            
            // check if the module has a guildconfig
            if(!choosenmodule.guildconfig) return interaction.editReply({ content: `Le module \`${modulename}\` n'a pas de configuration serveur.`, ephemeral: true });

            // we get the option name
            let optionname = interaction.options.getString('option');
            if(!optionname) return interaction.editReply({ content: `Vous devez spécifier une option à configurer.`, ephemeral: true });

            // set the variable tosearch to the guildconfig of the module
            let tosearch = choosenmodule.guildconfig;

            // we get the categories
            let oCat = interaction.options.getString('category');
            let oSubCat = interaction.options.getString('subcategory');
            
            // get cat and sub
            let catObj = null;
            let catSubObj = null;
            if(oCat) tosearch, catObj = getCat(oCat, tosearch);
            if(oSubCat) tosearch, catSubObj = getCat(oSubCat, tosearch);

            // so a this point, tosearch is defined with the module, category and subcategory
            // we now check the option

            let option = tosearch[optionname] || Object.entries(tosearch).find(([key, value]) => value.displayname == optionname)[1];
            if(!option || (option.type == 'showedcategory' || option.type == 'databasecategory'))
                return interaction.editReply({ content: `L'option \`${optionname}\` n'existe pas dans le module \`${modulename}\`.`, ephemeral: true });

            if(!tosearch[optionname]) optionname = Object.keys(tosearch).find(key => tosearch[key].displayname == optionname);
        
            let updatestring = optionname
            if(catObj && catObj?.type == 'databasecategory') {
                server = server[catObj.name];
                updatestring = `${catObj.name}.${optionname}`;
                if(catSubObj && catSubObj?.type == 'databasecategory') {
                    server = server[catObj.name][catSubObj.name];
                    updatestring = `${catObj.name}.${catSubObj.name}.${optionname}`;
                }
            }
            /////////////////////// FIN DE SELECTION ///////////////////////

            if(interaction.options.getSubcommand() == 'set') {
                /////////////////////// DEBUT VALEUR ///////////////////////
                // we get the option value
                let optionvalue = interaction.options.getString('value');

                // variable to check if the command can continue
                var modifiedvalue = optionvalue;

                // if there is a value, update the value
                if(optionvalue && !optionvalue.startsWith('select')) {
                    // check if the option value is valid
                    if(option.type == 'boolean') {
                        if(optionvalue != 'true' && optionvalue != 'false') return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        if(typeof optionvalue == 'boolean') modifiedvalue = optionvalue;
                        else modifiedvalue = optionvalue == 'true';
                    } else if(option.type == 'number') {
                        if(isNaN(optionvalue)) return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        modifiedvalue = parseInt(optionvalue);
                    } else if(option.type == 'string') {
                        if(optionvalue.length > 100) return interaction.editReply({ content: `La valeur \`${optionvalue}\` est trop longue pour l'option \`${optionname}\`.`, ephemeral: true });
                        modifiedvalue = optionvalue;
                    } else if(option.type == 'channel') {
                        optionvalue = optionvalue.replace('<#', '').replace('>', '');
                        const channel = interaction.guild.channels.cache.get(optionvalue) || interaction.guild.channels.cache.find(channel => channel.name == optionvalue);
                        if(!channel) return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        modifiedvalue = channel.id;
                    } else if(option.type == 'role') {
                        optionvalue = optionvalue.replace('<@&', '').replace('>', '');
                        const role = interaction.guild.roles.cache.get(optionvalue) || interaction.guild.roles.cache.find(role => role.name == optionvalue);
                        if(!role) return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        modifiedvalue = role.id;
                    } else if(option.type == 'user') {
                        optionvalue = optionvalue.replace('<@', '').replace('>', '').replace('!', '');
                        const user = interaction.client.users.cache.get(optionvalue) || interaction.client.users.cache.find(user => user.username == optionvalue);
                        if(!user) return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        modifiedvalue = user.id;
                    } else if(option.type == 'message') {
                        optionvalue = optionvalue.replace(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/`, '');
                        const message = await interaction.guild.messages.fetch(optionvalue);
                        if(!message) return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        modifiedvalue = message.id;
                    } else if(option.type == 'array') {
                        // check if it is an array
                        if(optionvalue.split(',').length == 1) return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        modifiedvalue = optionvalue.split(',');
                        // check if the array values are valid
                        for(var i = 0; i < modifiedvalue.length; i++) {
                            if(option.arraytype == 'user') {
                                const user = interaction.client.users.cache.get(modifiedvalue[i]) || interaction.client.users.cache.find(user => user.username == modifiedvalue[i]);
                                if(!user) return interaction.editReply({ content: `La valeur \`${modifiedvalue[i]}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                            } else if(option.arraytype == 'role') {
                                const role = interaction.guild.roles.cache.get(modifiedvalue[i]) || interaction.guild.roles.cache.find(role => role.name == modifiedvalue[i]);
                                if(!role) return interaction.editReply({ content: `La valeur \`${modifiedvalue[i]}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                            } else if(option.arraytype == 'channel') {
                            const channel = interaction.guild.channels.cache.get(modifiedvalue[i]) || interaction.guild.channels.cache.find(channel => channel.name == modifiedvalue[i]);
                            if(!channel) return interaction.editReply({ content: `La valeur \`${modifiedvalue[i]}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                            } else if(option.arraytype == 'number') {
                                if(isNaN(modifiedvalue[i])) return interaction.editReply({ content: `La valeur \`${modifiedvalue[i]}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                            } else if(option.arraytype == 'string') {
                                if(modifiedvalue[i].length > 100) return interaction.editReply({ content: `La valeur \`${modifiedvalue[i]}\` est trop longue pour l'option \`${optionname}\`.`, ephemeral: true });
                            }
                        }
                    } else if(option.type == 'sendmessage') {
                        optionvalue = optionvalue.replace('<#', '').replace('>', '');
                        const channel = interaction.guild.channels.cache.get(optionvalue) || interaction.guild.channels.cache.find(channel => channel.name == optionvalue);
                        if(!channel) return interaction.editReply({ content: `La valeur \`${optionvalue}\` n'est pas valide pour l'option \`${optionname}\`.`, ephemeral: true });
                        // send the message
                        const message = await channel.send({ content: "Message configuré par l'option " + optionname + " qui se mettra à jour automatiquement." });
                        modifiedvalue = message.id;
                    } else return interaction.editReply({ content: 'Une erreur est survenue.', ephemeral: true });
                } else {
                    // else if there is no value, ask the user to choose a value                    
                    // create the ActionRow and the select menu for the options that need it
                    if(option.type == 'boolean') {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('boolean')
                                    .setPlaceholder('Choisissez une valeur')
                                    .addOptions([
                                        {
                                            label: 'Vrai',
                                            description: 'Valeur vrai',
                                            value: 'true',
                                        },
                                        {
                                            label: 'Faux',
                                            description: 'Valeur faux',
                                            value: 'false',
                                        },
                                    ]),
                            );
                        interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row], ephemeral: true });
                    } else if(option.type == 'number') {
                        return interaction.editReply({ content: `Il n'est pas possible de choisir une valeur en menu déroulant pour l'option \`${optionname}\`.`, ephemeral: true });
                    } else if(option.type == 'string') {
                        return interaction.editReply({ content: `Il n'est pas possible de choisir une valeur en menu déroulant pour l'option \`${optionname}\`.`, ephemeral: true });
                    } else if(option.type == 'channel') {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('channel')
                                    .setPlaceholder('Choisissez une valeur')
                            );
                            // add the options (channels of the guild)
                            i = 0;
                            for(const channel of interaction.guild.channels.cache) {
                                // le loop s'arrête après 25 channels
                                if(channel[1].type == 0) { 
                                    i++;
                                    row.components[0].addOptions([
                                        {
                                            label: channel[1].name,
                                            description: `Valeur ${channel[1].name}`,
                                            value: channel[1].id,
                                        },
                                    ]);
                                }
                                if(i == 25) break;
                            }
                        interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row], ephemeral: true });
                    } else if(option.type == 'role') {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('role')
                                    .setPlaceholder('Choisissez une valeur')
                            );
                            // add the options (roles of the guild)
                            i = 0;
                            for(const role of interaction.guild.roles.cache) {
                                // le loop s'arrête après 25 roles
                                i++;
                                row.components[0].addOptions([
                                    {
                                        label: role[1].name,
                                        description: `Valeur ${role[1].name}`,
                                        value: role[1].id,
                                    },
                                ]);
                                if(i == 25) break;
                            }
                        interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row], ephemeral: true });
                    } else if(option.type == 'user') {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('user')
                                    .setPlaceholder('Choisissez une valeur')
                            );
                        // add the options (users of the guild)
                        i = 0;
                        for(const member of interaction.guild.members.cache) {
                            // le loop s'arrête après 25 users
                            i++;
                            row.components[0].addOptions([
                                {
                                    label: member[1].user.username,
                                    description: `Valeur ${member[1].user.username}`,
                                    value: member[1].user.id,
                                },
                            ]);
                            if(i == 25) break;
                        }
                        interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row], ephemeral: true });
                    } else if(option.type == 'message') {
                        return interaction.editReply({ content: `Il n'est pas possible de choisir une valeur en menu déroulant pour l'option \`${optionname}\`.`, ephemeral: true });
                    } else if(option.type == 'array') {
                        modifiedvalue = [];
                        // check what is the type of the array
                        if(option.arraytype == 'user') {
                            // the user can choose multiple users, so we create an select menu and an confirm button
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('arrayuser')
                                        .setPlaceholder('Choisissez une valeur')
                                        .setMinValues(1)
                                        .setMaxValues(10)
                                );
                                // add the options (users of the guild)
                                i = 0;
                                for(const member of interaction.guild.members.cache) {
                                    // le loop s'arrête après 25 users
                                    i++;
                                    row.components[0].addOptions([
                                        {
                                            label: member[1].user.username,
                                            description: `Valeur ${member[1].user.username}`,
                                            value: member[1].user.id,
                                        },
                                    ]);
                                    if(i == 25) break;
                                }
                            const row2 = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('confirm')
                                        .setLabel('Confirmer')
                                        .setStyle(ButtonStyle.Primary)
                                );
                            interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row, row2], ephemeral: true });
                        } else if(option.arraytype == 'string') {
                            return interaction.editReply({ content: `Il n'est pas possible de choisir une valeur en menu déroulant pour l'option \`${optionname}\`.`, ephemeral: true });
                        } else if(option.arraytype == 'number') {
                            return interaction.editReply({ content: `Il n'est pas possible de choisir une valeur en menu déroulant pour l'option \`${optionname}\`.`, ephemeral: true });
                        } else if(option.arraytype == 'message') {
                            return interaction.editReply({ content: `Il n'est pas possible de choisir une valeur en menu déroulant pour l'option \`${optionname}\`.`, ephemeral: true });
                        } else if(option.arraytype == 'channel') {
                            // the user can choose multiple channels, so we create an select menu and an confirm button
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('arraychannel')
                                        .setPlaceholder('Choisissez une valeur')
                                        .setMinValues(1)
                                        .setMaxValues(10)
                                );
                                // add the options (channels of the guild)
                                i = 0;
                                for(const channel of interaction.guild.channels.cache) {
                                    // le loop s'arrête après 25 channels
                                    if(channel[1].type == 0) {
                                        i++;
                                        row.components[0].addOptions([
                                            {
                                                label: channel[1].name,
                                                description: `Valeur ${channel[1].name}`,
                                                value: channel[1].id,
                                            },
                                        ]);
                                        if(i == 25) break;
                                    }
                                }
                            const row2 = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('confirm')
                                        .setLabel('Confirmer')
                                        .setStyle(ButtonStyle.Primary)
                                );
                            interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row, row2], ephemeral: true });
                        } else if(option.arraytype == 'role') {
                            // the user can choose multiple roles, so we create an select menu and an confirm button
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('arrayrole')
                                        .setPlaceholder('Choisissez une valeur')
                                        .setMinValues(1)
                                        .setMaxValues(10)
                                );
                                // add the options (roles of the guild)
                                i = 0;
                                for(const role of interaction.guild.roles.cache) {
                                    // le loop s'arrête après 25 roles
                                    i++;
                                    row.components[0].addOptions([
                                        {
                                            label: role[1].name,
                                            description: `Valeur ${role[1].name}`,
                                            value: role[1].id,
                                        },
                                    ]);
                                    if(i == 25) break;
                                }
                            const row2 = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('confirm')
                                        .setLabel('Confirmer')
                                        .setStyle(ButtonStyle.Primary)
                                );
                            interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row, row2], ephemeral: true });
                        } else {
                            interaction.editReply({ content: `Une erreur est survenue.`, ephemeral: true });
                        }
                    } else if(option.type == 'sendmessage') {
                        const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('sendmessage')
                                .setPlaceholder('Choisissez une valeur')
                        );
                        // add the options (channels of the guild)
                        i = 0;
                        for(const channel of interaction.guild.channels.cache) {
                            // le loop s'arrête après 25 channels
                            if(channel[1].type == 0) { 
                                i++;
                                row.components[0].addOptions([
                                    {
                                        label: channel[1].name,
                                        description: `Valeur ${channel[1].name}`,
                                        value: channel[1].id,
                                    },
                                ]);
                            }
                            if(i == 25) break;
                        }
                        interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, components: [row], ephemeral: true });
                    } else interaction.editReply({ content: `Une erreur est survenue.`, ephemeral: true });

                    // if the option need a value, create a collector to get the value (and the command will continue only when the collector is ended)
                    let collector = interaction.channel.createMessageComponentCollector({ filter:(i) => i.user.id == interaction.user.id, time: 60000 });
                    collector.on('collect', async m => {
                        // si une option n'est pas valide, on arrête le collector
                        if(option.type == 'number' || option.type == 'string' || option.type == 'message') {
                            return collector.stop();
                        } else if(option.type == 'boolean') {
                            // save the value
                            if(m.values[0] == 'true') modifiedvalue = true;
                            else if(m.values[0] == 'false') modifiedvalue = false;
                            return collector.stop();
                        } else if(option.type == 'channel') {
                            // save the value
                            const channel = interaction.guild.channels.cache.get(m.values[0]);
                            if(channel) {
                                modifiedvalue = channel.id;
                                return collector.stop();
                            } else return collector.stop();
                        } else if(option.type == 'role') {
                            // save the value
                            const role = interaction.guild.roles.cache.get(m.values[0]);
                            if(role) {
                                modifiedvalue = role.id;
                                return collector.stop();
                            } else return collector.stop();
                        } else if(option.type == 'user') {
                            // save the value
                            const user = interaction.guild.members.cache.get(m.values[0]);
                            if(user) {
                                modifiedvalue = user.user.id;
                                return collector.stop();
                            } else return collector.stop();
                        } else if(option.type == 'array') {
                            // take values in the modifiedvalue array
                            // check if it is confirm or array value to add
                            if(m.customId.toLowerCase() == 'confirm') {
                                return collector.stop();
                            } else {
                                if(option.arraytype == 'channel') {
                                    modifiedvalue = [];
                                    for(var i = 0; i < m.values.length; i++) {
                                        // save the value
                                        const channel = interaction.guild.channels.cache.get(m.values[i]);
                                        if(channel) modifiedvalue.push(channel.id);
                                    }
                                } else if(option.arraytype == 'role') {
                                    modifiedvalue = [];
                                    for(var i = 0; i < m.values.length; i++) {
                                        // save the value
                                        const role = interaction.guild.roles.cache.get(m.values[i]);
                                        if(role) modifiedvalue.push(role.id);
                                    }
                                } else if(option.arraytype == 'user') {
                                    modifiedvalue = [];
                                    for(var i = 0; i < m.values.length; i++) {
                                        // save the value
                                        const user = interaction.guild.members.cache.get(m.values[i]);
                                        if(user) modifiedvalue.push(user.user.id);
                                    }
                                } else return collector.stop();
                            }
                        } else if(option.type == 'sendmessage') {
                            // save the value
                            const channel = interaction.guild.channels.cache.get(m.values[0]);
                            if(channel) {
                                // send the message
                                const message = await channel.send({ content: "Message configuré par l'option " + optionname + " qui se mettra à jour automatiquement." });
                                // save the message id
                                modifiedvalue = message.id;
                                return collector.stop();
                            } else return collector.stop();
                        } else return collector.stop();
                    });

                    let continuecommand = false;
                    let stopcommand = false;

                    async function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }
    
                    // si il y a un collecteur, on attend qu'il soit terminé
                    // tant que le collecteur n'est pas terminé, on attend 1 seconde
                    while(!continuecommand) {
                        // if stopcommand is true, stop the command
                        if(stopcommand) return;
                        await sleep(1000);
                    }

                    collector.on('end', async (collected, reason) => {
                        continuecommand = true;
                        // if the reason is 'time', the collector is ended because the time is over
                        if(reason == 'time') {
                            stopcommand = true;
                            return interaction.editReply({ content: `Vous avez mis trop de temps à répondre.`, ephemeral: true, components: [] });
                        } else return interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, ephemeral: true, components: [] });
                    });
                }

                if(!modifiedvalue)
                    return interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, ephemeral: true, components: [] });

                // check if the option value is the same as the current value
                if(server[optionname] == modifiedvalue)
                    return interaction.editReply({ content: `La valeur \`${modifiedvalue}\` est déjà celle de l'option \`${optionname}\`.`, ephemeral: true });
                /////////////////////// FIN VALEUR ///////////////////////


                /////////////////////// MISE A JOUR DE LA VALEUR ///////////////////////
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': interaction.guild.id,
                        }, {
                            [updatestring]: modifiedvalue,
                        })
                    ])
                }catch(err){console.log((err).red)}

                // send the embed
                let embed = new EmbedBuilder()
                    .setTitle(`Option \`${optionname}\` du module \`${modulename}\` modifiée`)
                    .setDescription(`La valeur de l'option \`${optionname}\` du module \`${modulename}\` a été modifiée de \`${server[optionname]}\` à \`${modifiedvalue}\`.`)
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setFooter({ text: `ID: ${interaction.user.id}` })
                    .setTimestamp()
                interaction.editReply({ embeds: [embed] });

                console.log(`[CONFIG] ${interaction.guild.name} (${interaction.guild.id}) - ${interaction.user.tag} (${interaction.user.id}) - ${optionname} - ${modifiedvalue}`.green);
                /////////////////////// FIN DE MISE A JOUR DE LA VALEUR ///////////////////////
            }

            // reset, same as set but it deletes the option from the database, to use the default value
            if(interaction.options.getSubcommand() == 'reset') {
                /////////////////////// MISE A JOUR DE LA VALEUR ///////////////////////
                if(updatestring) {
                    try{
                        await client.serversdb.bulkWrite([
                            client.bulkutility.unsetField({
                                'id': interaction.guild.id,
                            }, {
                                [updatestring]: '',
                            })
                        ])
                    }catch(err){console.log((err).red)}
                }

                // send the embed
                let embed = new EmbedBuilder()
                    .setTitle(`Option \`${optionname}\` du module \`${modulename}\` réinitialisée`)
                    .setDescription(`La valeur de l'option \`${optionname}\` du module \`${modulename}\` a été réinitialisée avec succès.`)
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setFooter({ text: `ID: ${interaction.user.id}` })
                    .setTimestamp()
                interaction.editReply({ embeds: [embed] });

                console.log(`[CONFIG] ${interaction.guild.name} (${interaction.guild.id}) - ${interaction.user.tag} (${interaction.user.id}) - ${optionname} - reset`.green);
                /////////////////////// FIN DE MISE A JOUR DE LA VALEUR ///////////////////////
            }
        }
    },
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused(true); // Get the focused option
        const focusedOption = focused?.name; // Get the name of the focused option
        let focusedValue = focused?.value || ''; // Get the value of the focused option or set to empty string if undefined
    
        // Function to filter modules based on the focused value and key (showname or displayname)
        const filterModules = (modules, focusedValue, key) => {
            return (focusedValue 
                ? Object.entries(modules).filter(([k, v]) => v[key].startsWith(focusedValue)) 
                : Object.entries(modules)
            ).map(([k, v]) => v[key]);
        };
    
        // Function to filter modules that have a guild configuration
        const getFilteredModules = (modules, focusedValue) => {
            let filtered = filterModules(modules, focusedValue, 'showname');
            return filtered.filter(module => 
                Object.entries(modules).some(([k, v]) => v.showname == module && typeof v.guildconfig !== 'undefined')
            );
        };
    
        // Handler for the 'show' subcommand
        const handleShowCommand = async () => {
            if (focusedOption === 'module') {
                const modules = interaction.client.modules;
                const filtered = getFilteredModules(modules, focusedValue);
                await interaction.respond(filtered.map(module => ({ name: module, value: module })));
            } else await interaction.respond([]);
        };

        // Function to get the chosen module based on the module name
        const getChosenThings = (tosearch, thing) => {
            const moduleEntry = Object.entries(tosearch).find(([k, v]) => v.showname === thing || v.displayname === thing);
            return tosearch[thing] || moduleEntry || null;
        };
    
        // Handler for the 'set' and 'reset' subcommands
        // Consolidated handler for category, subcategory, and option interactions
        const handleSetResetCommand = async () => {
            const modules = interaction.client.modules;

            let filtered = [];

            // for modules
            if (focusedOption === 'module') {
                filtered = getFilteredModules(modules, focusedValue);
                return await interaction.respond(filtered.map(item => ({ name: item, value: item })));
            }

            choosenModule = getChosenThings(modules, interaction.options.getString('module'));
            if (!choosenModule) return;
            let tosearch = choosenModule[1].guildconfig;
            if (!tosearch) return await interaction.respond([{ name: `Pas de configuration, pas de ${focusedOption}.`, value: `Nope` }]);

            // for categories
            if (focusedOption === 'category') {
                // filter the categories
                let filtered = filterModules(tosearch, focusedValue, 'displayname');
                filtered = filtered.filter(category =>
                    Object.entries(tosearch).some(([k, v]) => v.displayname == category && (v.type === 'showedcategory' || v.type === 'databasecategory'))
                );
                return await interaction.respond(filtered.map(item => ({ name: item, value: item })));
            }

            // Get the category name
            const choosenCategory = getChosenThings(tosearch, interaction.options.getString('category'));
            if (!choosenCategory) return;
            tosearch = choosenCategory[1].childs;
            if (!tosearch) return await interaction.respond([]);

            // for subcategories
            if (focusedOption === 'subcategory') {
                let filtered = filterModules(tosearch, focusedValue, 'displayname');
                filtered = filtered.filter(subcategory =>
                    Object.entries(tosearch).some(([k, v]) => v.displayname == subcategory && (v.type === 'showedcategory' || v.type === 'databasecategory'))
                );
                return await interaction.respond(filtered.map(item => ({ name: item, value: item })));
            }

            // Get the subcategory name
            const choosenSubcategory = getChosenThings(tosearch, interaction.options.getString('subcategory'));
            if (!choosenSubcategory) return;
            tosearch = choosenSubcategory[1].childs;
            if (!tosearch) return await interaction.respond([]);

            // for options
            if (focusedOption === 'option') {
                let filtered = filterModules(tosearch, focusedValue, 'displayname');
                filtered = filtered.filter(option =>
                    Object.entries(tosearch).some(([k, v]) => v.displayname == option && v.type !== 'showedcategory' && v.type !== 'databasecategory')
                );
                return await interaction.respond(filtered.map(item => ({ name: item, value: item })));
            }

            // send
            return await interaction.respond(filtered.map(item => ({ name: item, value: item })));
        };

        // Handle different subcommands
        if (interaction.options.getSubcommand() === 'show') await handleShowCommand();
        else if (['set', 'reset'].includes(interaction.options.getSubcommand())) await handleSetResetCommand();
        else await interaction.respond([]);
    }
}