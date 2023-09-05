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
            
            // then we loop in all modules
            // get module string option
            var modulestring = interaction.options.getString('module');
            if(!modulestring) {
                embed.setDescription(`Pour afficher la configuration d\'un module, utilisez '/config show <module>'
                \nLes modules disponibles sont :
                \n• ${Object.values(interaction.client.modules).filter(module => module.guildconfig).map(module => module.showname).join('\n• ')}`);
                return interaction.editReply({ embeds: [embed] });
            }

            // check if the module exists
            if(!interaction.client.modules[modulestring] && !Object.entries(interaction.client.modules).find(([key, value]) => value.showname == modulestring)) {
                return interaction.editReply({ content: 'Le module n\'existe pas !', ephemeral: true });
            } else {
                // get module REAL name (not displayname) (key of the module in the collection)
                if(!interaction.client.modules[modulestring]) modulestring = Object.keys(interaction.client.modules).find(key => interaction.client.modules[key].showname == modulestring);
            }

            // we find the module
            let module = interaction.client.modules[modulestring] || Object.entries(interaction.client.modules).find(([key, value]) => value.showname == modulestring);
            var config = '';

            if(!module.guildconfig) {
                return interaction.editReply({ content: 'Le module n\'a pas de configuration serveur !', ephemeral: true });
            }

            let oldchild = null;
            // we loop in all config options (module.guildconfig)
            for(const [key, option] of Object.entries(module.guildconfig)) {
                // we check if the option is a category
                if(option.type == 'databasecategory' || option.type == 'databasecategory') {
                    let server1 = server;
                    if(option.type == 'databasecategory') {
                        server1 = server[key];
                        if(option.showed) config += `\n**__${option.displayname}__** (${key}) - ${option.description}\n`;
                        if(option.showed && Object.keys(module.guildconfig)[0] == key) config += "\n";
                    } else {
                        server1 = server;
                        config += `\n**__${option.displayname}__** (${key}) - ${option.description}\n`;
                        if(Object.keys(module.guildconfig)[0] == key) config += "\n";
                    }
                    for(const [key2, child] of Object.entries(option.childs)) {
                        // we check if the option is a data
                        if(child.type != 'databasecategory' && child.type != 'showedcategory') {
                            // we add the option to the config string
                            if(child.type == 'boolean') config += `- ${child.displayname} (${key2}) : ${server1[key2] ? '✅' : '❌'}\n> ${child.description ? (child.description + '\n') : ''}`;
                            else config += `- ${child.displayname} (${key2}): ${server1[key2] ? server1[key2] : '❌'}\n> ${child.description ? (child.description + '\n') : ''}`;
                        } else {
                            if(child.type == 'databasecategory') if(child.showed) config += `\n**${child.displayname}** - ${child.description}\n`;
                            else config += `\n**${child.displayname}** (${key2}) - ${child.description}\n`;
                            // we loop in all childs of the category
                            for(const [key3, child2] of Object.entries(child.childs)) {
                                // we check if the option is a data
                                if(child2.type != 'databasecategory' && child2.type != 'showedcategory') {
                                    if(child.type == 'showedcategory') {
                                        // we add the option to the config string
                                        if(child2.type == 'boolean') config += `- ${child2.displayname} (${key3}) : ${server1[key3] ? '✅' : '❌'}\n> ${child2.description ? (child2.description + '\n') : ''}`;
                                        else config += `- ${child2.displayname} (${key3}) : ${server1[key3] ? server1[key3] : '❌'}\n> ${child2.description ? (child2.description + '\n') : ''}`;
                                    } else {
                                        // we add the option to the config string
                                        if(child2.type == 'boolean') config += `- ${child2.displayname} (${key3}) : ${server1[key2][key3] ? '✅' : '❌'}\n> ${child2.description ? (child2.description + '\n') : ''}`;
                                        else config += `- ${child2.displayname} (${key3}) : ${server1[key2][key3] ? server1[key2][key3] : '❌'}\n> ${child2.description ? (child2.description + '\n') : ''}`;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // si l'option précédente est une catégorie ou null on ajoute un saut de ligne
                    if(oldchild == null || oldchild.type == 'databasecategory' || oldchild.type == 'showedcategory') {
                        config += '\n';
                    }
                    // we add the option to the config string
                    if(option.type == 'boolean') config += `- ${option.displayname} (${key}) : ${server[key] ? '✅' : '❌'}\n> ${option.description ? (option.description + '\n') : ''}`;
                    else config += `- ${option.displayname} (${key}) : ${server[key] ? server[key] : '❌'}\n> ${option.description ? (option.description + '\n') : ''}`;
                }
                oldchild = option;
            }
            // we add the config string to the embed
            if(config.length <= 1024) {
                embed.addFields({ name: `${module.showname}`, value: config, inline: false });
            } else {
                var i = 0;
                // we split the config string in multiple parts but we keep the whole option
                var configarray = config.split('\n');
                var configstring = '';
                for(const configpart of configarray) {
                    if(configstring.length + configpart.length <= 1024) configstring += configpart + '\n';
                    else {
                        i++;
                        if(i == 1) embed.addFields({ name: `${module.showname}`, value: configstring, inline: false });
                        else embed.addFields({ name: "​", value: configstring, inline: false });
                        configstring = configpart + '\n';
                    }
                }
                if(configstring.length > 0) {
                    i++;
                    if(i == 1) embed.addFields({ name: `${module.showname}`, value: configstring, inline: false });
                    else embed.addFields({ name: "​", value: configstring, inline: false });
                }
            }
            // we send the embed
            interaction.editReply({ embeds: [embed] });
        }
        if(interaction.options.getSubcommand() == 'set') {
            const modules = interaction.client.modules;

            // we get the module name
            let modulename = interaction.options.getString('module');

            let choosenmodule = null;
            // check if the module exists
            if(!modules[modulename] && !Object.entries(modules).find(([key, value]) => value.showname == modulename)) {
                return interaction.editReply({ content: `Le module \`${modulename}\` n'existe pas.`, ephemeral: true });
            } else {
                choosenmodule = modules[modulename] || Object.entries(modules).find(([key, value]) => value.showname == modulename)[1];
                // get module REAL name (not displayname) (key of the module in the collection)
                if(!modules[modulename]) modulename = Object.keys(modules).find(key => modules[key].showname == modulename);
            }
            
            // check if the module has a guildconfig
            if(!choosenmodule.guildconfig) {
                return interaction.editReply({ content: `Le module \`${modulename}\` n'a pas de configuration serveur.`, ephemeral: true });
            }

            // set the variable tosearch to the guildconfig of the module
            let tosearch = choosenmodule.guildconfig;

            let optioncategoryobject = null;
            let optionsubcategoryobject = null;

            // we get the option category
            let optioncategory = interaction.options.getString('category');

            // we get the option subcategory
            let optionsubcategory = interaction.options.getString('subcategory');

            if(optioncategory) {
                let choosencategory = null;

                // check if the option category exists in the module guildconfig
                if(!tosearch[optioncategory] && !Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory)) {
                    return interaction.editReply({ content: `La catégorie \`${optioncategory}\` n'existe pas dans le module \`${modulename}\`.`, ephemeral: true });
                } else {
                    choosencategory = tosearch[optioncategory] || Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory)[1];
                    // get category REAL name (not displayname) (key of the category in the module guildconfig)
                    if(!tosearch[optioncategory]) optioncategory = Object.keys(tosearch).find(key => tosearch[key].displayname == optioncategory);
                }

                // on verifie que c'est bien une catégorie
                if(choosencategory.type != 'showedcategory' && choosencategory.type != 'databasecategory') return interaction.editReply({ content: `La catégorie \`${optioncategory}\` du module \`${modulename}\` n'est pas une catégorie.`, ephemeral: true });
                // si il existe on le récupère
                optioncategoryobject = choosencategory;

                // modify the variable tosearch to the category
                tosearch = optioncategoryobject.childs;

                if(optionsubcategory) {
                    let choosensubcategory = null;

                    // check if the option subcategory exists in the category
                    if(!optioncategoryobject.childs[optionsubcategory] && !Object.entries(optioncategoryobject.childs).find(([key, value]) => value.displayname == optionsubcategory)) {
                        return interaction.editReply({ content: `La sous-catégorie \`${optionsubcategory}\` n'existe pas dans la catégorie \`${optioncategory}\` du module \`${modulename}\`.`, ephemeral: true });
                    } else {
                        choosensubcategory = optioncategoryobject.childs[optionsubcategory] || Object.entries(optioncategoryobject.childs).find(([key, value]) => value.displayname == optionsubcategory)[1];
                        // get subcategory REAL name (not displayname) (key of the subcategory in the category)
                        if(!optioncategoryobject.childs[optionsubcategory]) optionsubcategory = Object.keys(optioncategoryobject.childs).find(key => optioncategoryobject.childs[key].displayname == optionsubcategory);
                    }
                    // on verifie que c'est bien une sous-catégorie
                    if(choosensubcategory.type != 'showedcategory' && choosensubcategory.type != 'databasecategory') return interaction.editReply({ content: `La sous-catégorie \`${optionsubcategory}\` de la catégorie \`${optioncategory}\` du module \`${modulename}\` n'est pas une sous-catégorie.`, ephemeral: true });

                    // modify the variable tosearch to the subcategory
                    tosearch = choosensubcategory.childs;
                }
            }

            // so a this point, tosearch is defined with the module, category and subcategory
            // we now check the option

            // we get the option name
            let optionname = interaction.options.getString('option');
            if(!optionname) return interaction.editReply({ content: `Vous devez spécifier une option à configurer.`, ephemeral: true });

            let choosenoption = null;

            // check if the option name exists in the tosearch object
            if(!tosearch[optionname] && !Object.entries(tosearch).find(([key, value]) => value.displayname == optionname)) {
                return interaction.editReply({ content: `L'option \`${optionname}\` n'existe pas dans le module \`${modulename}\`.`, ephemeral: true });
            } else {
                choosenoption = tosearch[optionname] || Object.entries(tosearch).find(([key, value]) => value.displayname == optionname)[1];
                // get option REAL name (not displayname) (key of the option in the tosearch object)
                if(!tosearch[optionname]) optionname = Object.keys(tosearch).find(key => tosearch[key].displayname == optionname);
            }

            // on verifie que c'est bien une option
            if(choosenoption.type == 'showedcategory' || choosenoption.type == 'databasecategory') return interaction.editReply({ content: `L'option \`${optionname}\` du module \`${modulename}\` n'est pas une option.`, ephemeral: true });
            
            // define the option
            const option = choosenoption;

            // we get the option value
            let optionvalue = interaction.options.getString('value');
            let collector = null;

            // variable to check if the command can continue
            let continuecommand = false;
            var modifiedvalue = optionvalue;

            // if there is a value, update the value
            if(optionvalue && !optionvalue.startsWith('select')) {
                continuecommand = true;
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
            } else { // else if there is no value, ask the user to choose a value
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
                collector = interaction.channel.createMessageComponentCollector({ filter:(i) => i.user.id == interaction.user.id, time: 60000 });
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
                collector.on('end', async (collected, reason) => {
                    continuecommand = true;
                    // if the reason is 'time', the collector is ended because the time is over
                    if(reason == 'time') {
                        stopcommand = true;
                        return interaction.editReply({ content: `Vous avez mis trop de temps à répondre.`, ephemeral: true, components: [] });
                    } else return interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, ephemeral: true, components: [] });
                });
            }
            let stopcommand = false;

            async function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            // si il y a un collecteur, on attend qu'il soit terminé
            if(collector) {
                // tant que le collecteur n'est pas terminé, on attend 1 seconde
                while(!continuecommand) {
                    // if stopcommand is true, stop the command
                    if(stopcommand) return;
                    await sleep(1000);
                }
            }

            if(modifiedvalue == null) return interaction.editReply({ content: `Veuillez choisir une valeur pour l'option \`${optionname}\`.`, ephemeral: true, components: [] });

            let server1 = server;
            let updatestring = null;

            // define the updatestring
            // if there are a category
            if(optioncategoryobject && optioncategoryobject?.type == 'databasecategory') {
                server1 = server[optioncategory];
                // if there are a subcategory
                if(optionsubcategoryobject && optionsubcategoryobject?.type == 'databasecategory') {
                    server1 = server1[optioncategory][optionsubcategory];
                    updatestring = `${optioncategory}.${optionsubcategory}.${optionname}`;
                } else updatestring = `${optioncategory}.${optionname}`;
            } else updatestring = optionname;

            // check if the option value is the same as the current value
            if(server1[optionname] == modifiedvalue) return interaction.editReply({ content: `La valeur \`${modifiedvalue}\` est déjà celle de l'option \`${optionname}\`.`, ephemeral: true });

            if(updatestring) {
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': interaction.guild.id,
                        }, {
                            [updatestring]: modifiedvalue,
                        })
                    ])
                }catch(err){console.log((err).red)}
            }

            // send the embed
            let embed = new EmbedBuilder()
                .setTitle(`Option \`${optionname}\` du module \`${modulename}\` modifiée`)
                .setDescription(`La valeur de l'option \`${optionname}\` du module \`${modulename}\` a été modifiée de \`${server1[optionname]}\` à \`${modifiedvalue}\`.`)
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setFooter({ text: `ID: ${interaction.user.id}` })
                .setTimestamp()
            interaction.editReply({ embeds: [embed] });

            console.log(`[CONFIG] ${interaction.guild.name} (${interaction.guild.id}) - ${interaction.user.tag} (${interaction.user.id}) - ${optionname} - ${modifiedvalue}`.green);
        }

        // reset, same as set but it deletes the option from the database, to use the default value
        if(interaction.options.getSubcommand() == 'reset') {
            const modules = interaction.client.modules;

            // we get the module name
            let modulename = interaction.options.getString('module');

            let choosenmodule = null;
            // check if the module exists
            if(!modules[modulename] && !Object.entries(modules).find(([key, value]) => value.showname == modulename)) {
                return interaction.editReply({ content: `Le module \`${modulename}\` n'existe pas.`, ephemeral: true });
            } else {
                choosenmodule = modules[modulename] || Object.entries(modules).find(([key, value]) => value.showname == modulename)[1];
                // get module REAL name (not displayname) (key of the module in the collection)
                if(!modules[modulename]) modulename = Object.keys(modules).find(key => modules[key].showname == modulename);
            }
            
            // check if the module has a guildconfig
            if(!choosenmodule.guildconfig) {
                return interaction.editReply({ content: `Le module \`${modulename}\` n'a pas de configuration serveur.`, ephemeral: true });
            }
            
            // set the variable tosearch to the guildconfig of the module
            let tosearch = choosenmodule.guildconfig;

            let optioncategoryobject = null;
            let optionsubcategoryobject = null;

            // we get the option category
            const optioncategory = interaction.options.getString('category');

            // we get the option subcategory
            const optionsubcategory = interaction.options.getString('subcategory');

            if(optioncategory) {
                let choosencategory = null;

                // check if the option category exists in the module guildconfig
                if(!tosearch[optioncategory] && !Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory)) {
                    return interaction.editReply({ content: `La catégorie \`${optioncategory}\` n'existe pas dans le module \`${modulename}\`.`, ephemeral: true });
                } else {
                    choosencategory = tosearch[optioncategory] || Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory)[1];
                    // get category REAL name (not displayname) (key of the category in the module guildconfig)
                    if(!tosearch[optioncategory]) optioncategory = Object.keys(tosearch).find(key => tosearch[key].displayname == optioncategory);
                }

                // on verifie que c'est bien une catégorie
                if(choosencategory.type != 'showedcategory' && choosencategory.type != 'databasecategory') return interaction.editReply({ content: `La catégorie \`${optioncategory}\` du module \`${modulename}\` n'est pas une catégorie.`, ephemeral: true });
                // si il existe on le récupère
                optioncategoryobject = choosencategory;

                // modify the variable tosearch to the category
                tosearch = optioncategoryobject.childs;

                if(optionsubcategory) {
                    let choosensubcategory = null;

                    // check if the option subcategory exists in the category
                    if(!optioncategoryobject.childs[optionsubcategory] && !Object.entries(optioncategoryobject.childs).find(([key, value]) => value.displayname == optionsubcategory)) {
                        return interaction.editReply({ content: `La sous-catégorie \`${optionsubcategory}\` n'existe pas dans la catégorie \`${optioncategory}\` du module \`${modulename}\`.`, ephemeral: true });
                    } else {
                        choosensubcategory = optioncategoryobject.childs[optionsubcategory] || Object.entries(optioncategoryobject.childs).find(([key, value]) => value.displayname == optionsubcategory)[1];
                        // get subcategory REAL name (not displayname) (key of the subcategory in the category)
                        if(!optioncategoryobject.childs[optionsubcategory]) optionsubcategory = Object.keys(optioncategoryobject.childs).find(key => optioncategoryobject.childs[key].displayname == optionsubcategory);
                    }
                    // on verifie que c'est bien une sous-catégorie
                    if(choosensubcategory.type != 'showedcategory' && choosensubcategory.type != 'databasecategory') return interaction.editReply({ content: `La sous-catégorie \`${optionsubcategory}\` de la catégorie \`${optioncategory}\` du module \`${modulename}\` n'est pas une sous-catégorie.`, ephemeral: true });

                    // modify the variable tosearch to the subcategory
                    tosearch = choosensubcategory.childs;
                }
            }

            // so a this point, tosearch is defined with the module, category and subcategory
            // we now check the option

            // we get the option name
            let optionname = interaction.options.getString('option');

            let choosenoption = null;

            // check if the option name exists in the tosearch object
            if(!tosearch[optionname] && !Object.entries(tosearch).find(([key, value]) => value.displayname == optionname)) {
                return interaction.editReply({ content: `L'option \`${optionname}\` n'existe pas dans le module \`${modulename}\`.`, ephemeral: true });
            } else {
                choosenoption = tosearch[optionname] || Object.entries(tosearch).find(([key, value]) => value.displayname == optionname)[1];
                // get option REAL name (not displayname) (key of the option in the tosearch object)
                if(!tosearch[optionname]) optionname = Object.keys(tosearch).find(key => tosearch[key].displayname == optionname);
            }

            // on verifie que c'est bien une option
            if(choosenoption.type == 'showedcategory' || choosenoption.type == 'databasecategory') return interaction.editReply({ content: `L'option \`${optionname}\` du module \`${modulename}\` n'est pas une option.`, ephemeral: true });

            let server1 = server;
            let updatestring = null;

            // define the updatestring
            // if there are a category
            if(optioncategoryobject && optioncategoryobject?.type == 'databasecategory') {
                server1 = server[optioncategory];
                // if there are a subcategory
                if(optionsubcategoryobject && optionsubcategoryobject?.type == 'databasecategory') {
                    server1 = server1[optioncategory][optionsubcategory];
                    updatestring = `${optioncategory}.${optionsubcategory}.${optionname}`;
                } else updatestring = `${optioncategory}.${optionname}`;
            } else updatestring = optionname;

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
        }
    },
    async autocomplete(interaction) {
        let focused = interaction.options.getFocused(true);
        let focusedOption = focused?.name;
		let focusedValue = focused?.value;
        if(!focusedValue) focusedValue = false;

        // check the subcommand
        if(interaction.options.getSubcommand() == 'show') {
            if(focusedOption == 'module') {
                // get modules list
                const modules = interaction.client.modules;

                // filter modules list
                //let filtered = focusedValue ? Object.keys(modules).filter(module => module.startsWith(focusedValue)) : Object.keys(modules);
                // filter modules list with displayname
                let filtered = (focusedValue ? Object.entries(modules).filter(([key, value]) => value.showname.startsWith(focusedValue)) : Object.entries(modules)).map(([key, value]) => value.showname);
                // merge the 2 arrays
                //filtered = filtered.concat(filtered2);

                // show only modules with guildconfig
                filtered = filtered.filter(module => Object.entries(modules).find(([key, value]) => value.showname == module && typeof value?.guildconfig != 'undefined'));

                // send the filtered list
                await interaction.respond(
                    filtered.map(module => ({ name: module, value: module })),
                );
            } else interaction.respond([]);
        } else if(interaction.options.getSubcommand() == 'set' || interaction.options.getSubcommand() == 'reset') {
            if(focusedOption == 'module') {
                // get modules list
                const modules = interaction.client.modules;

                // filter modules list
                //let filtered = focusedValue ? Object.keys(modules).filter(module => module.startsWith(focusedValue)) : Object.keys(modules);
                // filter modules list with displayname
                let filtered = (focusedValue ? Object.entries(modules).filter(([key, value]) => value.showname.startsWith(focusedValue)) : Object.entries(modules)).map(([key, value]) => value.showname);
                // merge the 2 arrays
                //filtered = filtered.concat(filtered2);

                // show only modules with guildconfig
                filtered = filtered.filter(module => Object.entries(modules).find(([key, value]) => value.showname == module && typeof value?.guildconfig != 'undefined'));

                // send the filtered list
                await interaction.respond(
                    filtered.map(module => ({ name: module, value: module })),
                );
            } else if(focusedOption == 'category') {
                // get modules list
                const modules = interaction.client.modules;

                // get the module name
                const modulename = interaction.options.getString('module');
                // set choosenmodule
                let choosenmodule = null;
                // check if the module exists
                if(!modules[modulename] && !Object.entries(modules).find(([key, value]) => value.showname == modulename)) {
                    return interaction.respond([{ name: `Pas de module, pas de catégorie.`, value: `Nope` }]);
                } else {
                    choosenmodule = modules[modulename] || Object.entries(modules).find(([key, value]) => value.showname == modulename);
                }
                // get the module guildconfig
                if(!choosenmodule[1].guildconfig) return interaction.respond([{ name: `Pas de configuration, pas de catégorie.`, value: `Nope` }]);
                let tosearch = choosenmodule[1].guildconfig;

                // filter modules list
                //let filtered = focusedValue ? Object.keys(tosearch).filter(category => category.startsWith(focusedValue)) : Object.keys(tosearch);
                let filtered = (focusedValue ? Object.keys(tosearch).filter(category => tosearch[category].displayname.startsWith(focusedValue)) : Object.keys(tosearch)).map(category => tosearch[category].displayname);
                //filtered = filtered.concat(filtered2);

                // show only categories
                filtered = filtered.filter(category => Object.entries(tosearch).find(([key, value]) => value.displayname == category && (value.type == 'showedcategory' || value.type == 'databasecategory')));
                
                // send the filtered list
                await interaction.respond(
                    filtered.map(category => ({ name: category, value: category })),
                );
            } else if(focusedOption == 'subcategory') {
                // get modules list
                const modules = interaction.client.modules;

                // get the module name
                const modulename = interaction.options.getString('module');
                // set choosenmodule
                let choosenmodule = null;
                // check if the module exists
                if(!modules[modulename] && !Object.entries(modules).find(([key, value]) => value.showname == modulename)) {
                    return interaction.respond([{ name: `Module invalide.`, value: `Nope` }]);
                } else {
                    choosenmodule = modules[modulename] || Object.entries(modules).find(([key, value]) => value.showname == modulename);
                }
                // get the module guildconfig
                if(!choosenmodule[1].guildconfig) return interaction.respond([{ name: `Pas de configuration, pas de catégorie.`, value: `Nope` }]);
                let tosearch = choosenmodule[1].guildconfig;

                // get the option category
                const optioncategory = interaction.options.getString('category');
                // set choosencategory
                let choosencategory = null;
                // check if the option category exists in the module guildconfig
                if(!tosearch[optioncategory] && !Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory)) {
                    return interaction.respond([{ name: `Catégorie invalide.`, value: `Nope` }]);
                } else {
                    choosencategory = tosearch[optioncategory] || Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory);
                }
                // on verifie que c'est bien une catégorie
                if(choosencategory[1].type != 'showedcategory' && choosencategory[1].type != 'databasecategory') return interaction.respond([{ name: `Catégorie invalide.`, value: `Nope` }]);
                // si il existe on le récupère
                tosearch = choosencategory[1].childs;

                // filter modules list
                //let filtered = focusedValue ? Object.keys(tosearch).filter(subcategory => subcategory.startsWith(focusedValue)) : Object.keys(tosearch);
                let filtered = (focusedValue ? Object.keys(tosearch).filter(subcategory => tosearch[subcategory].displayname.startsWith(focusedValue)) : Object.keys(tosearch)).map(subcategory => tosearch[subcategory].displayname);
                //filtered = filtered.concat(filtered2);

                // show only subcategories
                filtered = filtered.filter(category => Object.entries(tosearch).find(([key, value]) => value.displayname == category && (value.type == 'showedcategory' || value.type == 'databasecategory')));

                // send the filtered list
                await interaction.respond(
                    filtered.map(subcategory => ({ name: subcategory, value: subcategory })),
                );
            } else if(focusedOption == 'option') {
                // get modules list
                const modules = interaction.client.modules;

                // get the module name
                const modulename = interaction.options.getString('module');
                // set choosenmodule
                let choosenmodule = null;
                // check if the module exists
                if(!modules[modulename] && !Object.entries(modules).find(([key, value]) => value.showname == modulename)) {
                    return interaction.respond([{ name: `Module invalide.`, value: `Nope` }]);
                } else {
                    choosenmodule = modules[modulename] || Object.entries(modules).find(([key, value]) => value.showname == modulename);
                }
                // get the module guildconfig
                if(!choosenmodule[1].guildconfig) return interaction.respond([{ name: `Pas de configuration, pas de catégorie.`, value: `Nope` }]);
                let tosearch = choosenmodule[1].guildconfig;

                // get the option category
                const optioncategory = interaction.options.getString('category');
                // set choosencategory
                let choosencategory = null;
                // check if the option category exists in the module guildconfig
                if(optioncategory) {
                    if(!tosearch[optioncategory] && !Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory)) {
                        return interaction.respond([{ name: `Catégorie invalide.`, value: `Nope` }]);
                    } else {
                        choosencategory = tosearch[optioncategory] || Object.entries(tosearch).find(([key, value]) => value.displayname == optioncategory);
                    }
                    // on verifie que c'est bien une catégorie
                    if(choosencategory[1].type != 'showedcategory' && choosencategory[1].type != 'databasecategory') return interaction.respond([{ name: `Catégorie invalide.`, value: `Nope` }]);
                    // si il existe on le récupère
                    tosearch = choosencategory[1].childs;

                    // get the option subcategory
                    const optionsubcategory = interaction.options.getString('subcategory');
                    // set choosensubcategory
                    let choosensubcategory = null;
                    // check if the option subcategory exists in the module guildconfig
                    if(optionsubcategory) {
                        if(!tosearch[optionsubcategory] && !Object.entries(tosearch).find(([key, value]) => value.displayname == optionsubcategory)) {
                            return interaction.respond([{ name: `Sous-catégorie invalide.`, value: `Nope` }]);
                        } else {
                            choosensubcategory = tosearch[optionsubcategory] || Object.entries(tosearch).find(([key, value]) => value.displayname == optionsubcategory);
                        }
                        // on verifie que c'est bien une sous-catégorie
                        if(choosensubcategory[1].type != 'showedcategory' && choosensubcategory[1].type != 'databasecategory') return interaction.respond([{ name: `Sous-catégorie invalide.`, value: `Nope` }]);
                        // si il existe on le récupère
                        tosearch = choosensubcategory[1].childs;
                    }
                }

                // filter modules list
                //let filtered = focusedValue ? Object.keys(tosearch).filter(option => option.startsWith(focusedValue)) : Object.keys(tosearch);
                let filtered = (focusedValue ? Object.keys(tosearch).filter(option => tosearch[option].displayname.startsWith(focusedValue)) : Object.keys(tosearch)).map(option => tosearch[option].displayname);
                //filtered = filtered.concat(filtered2);

                // filter filtered to show only options
                filtered = filtered.filter(option => Object.entries(tosearch).find(([key, value]) => value.displayname == option && value.type != 'showedcategory' && value.type != 'databasecategory'));
                
                // send the filtered list
                await interaction.respond(
                    filtered.map(option => ({ name: option, value: option })),
                );
            } else await interaction.respond([]);
        } else await interaction.respond([]);
	},
}