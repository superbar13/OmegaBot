module.exports = {
    name: 'levels',
    showname: 'Levels',
    addedconfig: {
        base: 1.04,
        xpPerMessage: 1,
        goalMultiplier: 50,
    },
    guildconfig: {
        levels: {
            displayname: 'Server Levels',
            description: 'Levels is the system that will give xp to the users when they send messages',
            type: 'databasecategory',
            showed: true,
            childs: {
                enabled: {
                    displayname: 'Enabled',
                    description: 'Enable or disable the levels system on the server',
                    type: 'boolean',
                },
                disabledChannels: {
                    displayname: 'Disabled channels',
                    description: 'The channels where the levels system is disabled',
                    type: 'array',
                    arraytype: 'channel',
                },
                disabledRoles: {
                    displayname: 'Disabled roles',
                    description: 'The roles where the levels system is disabled',
                    type: 'array',
                    arraytype: 'role',
                },
                disabledUsers: {
                    displayname: 'Disabled users',
                    description: 'The users where the levels system is disabled',
                    type: 'array',
                    arraytype: 'user',
                },
                announce: {
                    displayname: 'Announce',
                    description: 'Announce is the announce that will be sent when a user level up',
                    type: 'showedcategory',
                    childs: {
                        announce: {
                            displayname: 'Enabled',
                            description: 'Enable or disable the announce when a user level up',
                            type: 'boolean',
                        },
                        announceChannel: {
                            displayname: 'Announce channel',
                            description: 'The channel where the announce will be sent',
                            type: 'channel',
                        },
                        announceMessage: {
                            displayname: 'Announce message',
                            description: 'The message that will be sent when a user level up',
                            type: 'string',
                        },
                    },
                },
                leaderboard: {
                    displayname: 'Leaderboard',
                    description: 'Leaderboard is the global leaderboard that will be sent on the servers',
                    type: 'showedcategory',
                    childs: {
                        leaderboard: {
                            displayname: 'Enabled',
                            description: 'Enable or disable the leaderboard',
                            type: 'boolean',
                        },
                        leaderboardChannel: {
                            displayname: 'Leaderboard channel',
                            description: 'The channel where the leaderboard will be sent',
                            type: 'channel',
                        },
                        leaderboardMessage: {
                            displayname: 'Leaderboard message',
                            description: 'The message that will be sent when the leaderboard is updated',
                            type: 'sendmessage',
                        },
                    },
                },
            },
        },
        globallevels: {
            displayname: 'Global levels',
            description: 'Global levels is the global leaderboard that will be sent on the servers',
            type: 'databasecategory',
            showed: true,
            childs: {
                leaderboard: {
                    displayname: 'Leaderboard',
                    description: 'Leaderboard is the global leaderboard that will be sent on the servers',
                    type: 'showedcategory',
                    childs: {
                        leaderboard: {
                            displayname: 'Enabled',
                            description: 'Enable or disable the global leaderboard',
                            type: 'boolean',
                        },
                        leaderboardChannel: {
                            displayname: 'Leaderboard channel',
                            description: 'The channel where the global leaderboard will be sent',
                            type: 'channel',
                        },
                        leaderboardMessage: {
                            displayname: 'Leaderboard message',
                            description: 'The message that will be sent when the global leaderboard is updated',
                            type: 'sendmessage',
                        },
                    },
                },
                announce: {
                    displayname: 'Announce',
                    description: 'Announce is the announce that will be sent when a user level up',
                    type: 'showedcategory',
                    childs: {
                        announce: {
                            displayname: 'Enabled',
                            description: 'Enable or disable the announce when a user level up',
                            type: 'boolean',
                        },
                        announceChannel: {
                            displayname: 'Announce channel',
                            description: 'The channel where the announce will be sent',
                            type: 'channel',
                        },
                        announceMessage: {
                            displayname: 'Announce message',
                            description: 'The message that will be sent when a user level up',
                            type: 'string',
                        },
                    },
                },
            },
        },
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
    },
    userSchemaAddition: {
        levels: {
            level: {
                type: Number,
                default: 0
            },
            xp: {
                type: Number,
                default: 0
            }
        }
    },
    guildSchemaAddition: {
        // levels of the server
        levels: {
            enabled: {
                type: Boolean,
                default: false
            },
            disabledChannels: {
                type: Array,
                default: []
            },
            disabledRoles: {
                type: Array,
                default: []
            },
            disabledUsers: {
                type: Array,
                default: []
            },
            announce: {
                type: Boolean,
                default: false
            },
            announceChannel: {
                type: String,
                default: "none"
            },
            announceMessage: {
                type: String,
                default: "GG {user} you leveled up to level {level} on {server} !"
            },
            leaderboard: {
                type: Boolean,
                default: false
            },
            leaderboardChannel: {
                type: String,
                default: "none"
            },
            leaderboardMessage: {
                type: String,
                default: "none"
            },
        },
        globallevels: {
            leaderboard: {
                type: Boolean,
                default: false
            },
            leaderboardChannel: {
                type: String,
                default: "none"
            },
            leaderboardMessage: {
                type: String,
                default: "none"
            },
            announce: {
                type: Boolean,
                default: false
            },
            announceChannel: {
                type: String,
                default: "none"
            },
            announceMessage: {
                type: String,
                default: "GG {user} you leveled up to level {level} on the global leaderboard !"
            },
        },
    },
    guildSchemaUsersAddition: {
        id: {
            type: String,
            required: true,
            unique: true
        },
        levels: {
            level: {
                type: Number,
                default: 0
            },
            xp: {
                type: Number,
                default: 0
            }
        }
    },
    run: async(client) => {
        const createbar = client.modules.createBar.createBar;

        // this is the function that will be executed when the module is loaded
        // it will update the global top 25 users levels and the guild top 25 users every 5 minutes

        const { EmbedBuilder } = require('discord.js');

        async function updatelb(){
            let base = client.config.modules['levels'].addedconfig.base;
            let xpPerMessage = client.config.modules['levels'].addedconfig.xpPerMessage;
            let goalMultiplier = client.config.modules['levels'].addedconfig.goalMultiplier;

            // get all the users
            var users = await client.usersdb.find();
            // sort the users by xp (from the highest to the lowest) and by level (from the highest to the lowest)
            users = users.sort((a, b) => (a.levels.xp < b.levels.xp) ? 1 : -1).sort((a, b) => (a.levels.level < b.levels.level) ? 1 : -1);
            // get the top 25 users
            let top25 = users.filter(user => !(user.levels.xp === 0 && user.levels.level === 0)).slice(0, 14);
            // create the embed
            var embed = new EmbedBuilder()
                .setColor('#0019ff')
                .setTitle('Global leaderboard')
                .setDescription('Ici se trouve le classement global des utilisateurs du serveur !')
                .setTimestamp()
                .setFooter({ text: client.user.username + " - Globals Levels", iconURL: "https://cdn.discordapp.com/attachments/909475569459163186/1086297346796687401/squarecolorgif.gif" });
            // loop in the top 25 users
            index = 0;
            for(const user of top25) {
                index++;
                let xpToNextLevel = Math.floor(goalMultiplier * Math.pow(base, user.levels.level));
                let xp = user.levels.xp;
                let level = user.levels.level;
                let xpOnxpToNextLevel = `${xp} / ${xpToNextLevel} XP`
                let xpBar = createbar({value: xp,max: xpToNextLevel});

                let user1 = await client.users.fetch(user.id);

                embed.addFields(
                    { name: `${index == 1 ? '🥇' : index == 2 ? '🥈' : index == 3 ? '🥉' : index + 1}. ${user1.tag} - Niveau ${level}`.toString(), value: `${xpBar} ${xpOnxpToNextLevel}`.toString(), inline: false }
                );
            }
            console.log('[LEVELS] Global and guild top 25 users is being updated');
            // update the global leaderboard messages on the servers
            i = 0;
            i2 = 0;
            for(let guild of client.guilds.cache){
                guild = guild[1];
                // get the server info
                var info = await client.serversdb.findOne({ id: guild.id }).select('globallevels levels');
                // if the global leaderboard is disabled, return
                if(info?.globallevels?.leaderboard) {
                    // get the channel where the global leaderboard is
                    var channel = guild.channels.cache.get(info.globallevels.leaderboardChannel);
                    // if the channel is not found, return
                    if(!channel) return;
                    // get the global leaderboard message
                    var message = await channel.messages.fetch(info.globallevels.leaderboardMessage);
                    // if the message is not found, return
                    if(!message) return;
                    // edit the message
                    try {
                        message.edit({ content: '', embeds: [embed] });
                        console.log('[LEVELS] Global leaderboard updated on '+guild.name+' !');
                        i++;
                    } catch (error) {
                        console.log('[LEVELS] Error while updating the global leaderboard on '+guild.name+' !');
                    }
                }
                // update the server leaderboard messages on the servers
                // check if the server leaderboard is enabled
                if(info?.levels?.leaderboard) {
                    // get the top 25 users on the server (server.users)
                    var servtop25 = info.users.sort((a, b) => (a.levels.xp < b.levels.xp) ? 1 : -1).sort((a, b) => (a.levels.level < b.levels.level) ? 1 : -1).slice(0, 25);
                    // get the channel where the server leaderboard is
                    var channel = guild.channels.cache.get(info.levels.leaderboardChannel);
                    // if the channel is not found, return
                    if(!channel) return;
                    // get the server leaderboard message
                    var message = await channel.messages.fetch(info.levels.leaderboardMessage);
                    // if the message is not found, return
                    if(!message) return;
                    // create the embed
                    var embed2 = new EmbedBuilder()
                        .setColor('#0019ff')
                        .setTitle('Server leaderboard')
                        .setDescription('Ici se trouve le classement des utilisateurs du serveur !')
                        .setTimestamp()
                        .setFooter({ text: client.user.username + ' - Server Levels of ' + guild.name, iconURL: guild.iconURL({ dynamic: true }) });
                    // loop in the top 25 users
                    index = 0;
                    for(const user of servtop25) {
                        index++;
                        let xpToNextLevel = Math.floor(goalMultiplier * Math.pow(base, user.levels.level));
                        let xp = user.levels.xp;
                        let level = user.levels.level;
                        let xpOnxpToNextLevel = `${xp} / ${xpToNextLevel} XP`
                        let xpBar = createbar({value: xp,max: xpToNextLevel});

                        let user1 = await client.users.fetch(user.id);

                        embed2.addFields(
                            { name: `${index == 1 ? '🥇' : index == 2 ? '🥈' : index == 3 ? '🥉' : index + 1}. ${user1.tag} - Niveau ${level}`.toString(), value: `${xpBar} ${xpOnxpToNextLevel}`.toString(), inline: false }
                        );
                    };
                    // edit the message
                    try {
                        message.edit({ content: '', embeds: [embed2] });
                        console.log('[LEVELS] Server leaderboard updated on '+guild.name+' !');
                        i2++;
                    } catch (error) {
                        console.log('[LEVELS] Error while updating the server leaderboard on '+guild.name+' !');
                    }
                }
            }
            console.log(`[LEVELS] Global top 25 users updated on ${i} servers !`);
            console.log(`[LEVELS] Server top 25 users updated on ${i2} servers !`);
        }
        await updatelb();
        setInterval(async() => {
            // update the global and guild top 25 users
            await updatelb();
        }, 300000);
        // toutes les 5 minutes, update le leaderboard global et le leaderboard du serveur

        let cooldown = new Set();
        if(!client.config.modules['levels'].enabled) return console.log('[LEVELS] Levels module disabled, skipping...'.brightBlue);
        
        let base = client.config.modules['levels'].addedconfig.base;
        let xpPerMessage = client.config.modules['levels'].addedconfig.xpPerMessage;
        let goalMultiplier = client.config.modules['levels'].addedconfig.goalMultiplier;

        // handler niveaux
        // on message event
        client.on('messageCreate', async message => {
            // if the message author is a bot, return
            if (message.author.bot) return;
            // if the message is not in a guild, return
            if (!message.guild) return;
            
            // there are 2 types of levels, guild and global
            // guild level is the level of the user in the guild
            // global level is the level of the user in all the guilds the bot is in

            // get the user and the server info from the database (usersdb and serversdb)
            
            var user = await client.usersdb.findOne({ id: message.author.id });
            // if the user is not found, create a new user
            if (!user) user = await client.usersdb.createModel({ id: message.author.id });

            var server = await client.serversdb.findOne({ id: message.guild.id });
            // if the server is not found, create a new server
            if (!server) server = await client.serversdb.createModel({ id: message.guild.id });

            // cooldown ! (2 minutes)
            if (cooldown.has(message.author.id)) return;
            cooldown.add(message.author.id);
            setTimeout(() => {
                cooldown.delete(message.author.id);
            }, 120000);

            function replaceArguments(announceMessage) {
                var announceMessage = announceMessage.replace('{user}', message.author.username);
                var announceMessage = announceMessage.replace('{level}', user.levels.level);
                return announceMessage;
            }

            // we start with the global level
            // add 1 xp to the user
            user.levels.xp += xpPerMessage;
            // check if the user has enough xp to level up (expo function, 150 xp etc...)
            if (user.levels.xp >= Math.floor(goalMultiplier * Math.pow(base, user.levels.level))) {
                // if the user has enough xp, level up the user
                user.levels.level += 1;
                // reset the xp to 0
                user.levels.xp = 0;
                // check if there is a levelup message
                console.log(('[LEVELS] ' + message.author.username + ' leveled up to level ' + user.levels.level + ' on the global leaderboard !').brightGreen);
                if (server?.globallevels?.announce) {
                    // check if there is a announceMessage
                    if (server.globallevels.announceMessage) {
                        // check if there is a announceChannel (not "none" or null)
                        if (server.globallevels.announceChannel && server.globallevels.announceChannel !== 'none') {
                            // send the levelup message in the announceChannel (replace the arguments)
                            client.channels.cache.get(server.globallevels.announceChannel).send(replaceArguments(server.globallevels.announceMessage));
                        } else {
                            // send the levelup message in the channel where the message was sent
                            message.channel.send(replaceArguments(server.globallevels.announceMessage));
                        }
                    } else {
                        if (server.globallevels.announceChannel && server.globallevels.announceChannel !== 'none') {
                            client.channels.cache.get(server.globallevels.announceChannel).send(`GG ${message.author.username} you leveled up to level ${user.levels.level} on the global leaderboard !`);
                        } else {
                            message.channel.send(`GG ${message.author.username} you leveled up to level ${user.levels.level} on the global leaderboard !`);
                        }
                    }
                }
            }

            // save the user
            try{
                await client.usersdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': message.author.id
                    }, {
                        'levels': user.levels
                    })
                ])
            }catch(err){console.log(err);}
            // invalidate the user variable
            user = null;

            // now we do the same thing for the guild level (server.users[i].levels xp and level)
            // check if the user is in the server.users array and create before the user if he is not in the array
            if (!server.users.find(user => user.id === message.author.id)) {
                server.users.push({ id: message.author.id, levels: { level: 0, xp: 0 } });
            }

            // get the user in the server.users array
            var user = server.users.find(user => user.id === message.author.id);

            // add 1 xp to the user
            user.levels.xp += xpPerMessage;
            // check if the user has enough xp to level up (expo function, 150 xp etc...)
            if (user.levels.xp >= Math.floor(goalMultiplier * Math.pow(base, user.levels.level))) {
                // if the user has enough xp, level up the user
                user.levels.level += 1;
                // reset the xp to 0
                user.levels.xp = 0;
                if(server?.levels?.enabled){
                    // check if there is a levelup message
                    if (server?.levels?.announce) {
                        // check if there is a announceMessage
                        if (server.levels.announceMessage) {
                            // check if there is a announceChannel (not "none" or null)
                            if (server.levels.announceChannel && server.levels.announceChannel !== 'none') {
                                // send the levelup message in the announceChannel (replace the arguments)
                                client.channels.cache.get(server.levels.announceChannel).send(replaceArguments(server.levels.announceMessage));
                            } else {
                                // send the levelup message in the channel where the message was sent
                                message.channel.send(replaceArguments(server.levels.announceMessage));
                            }
                        } else {
                            if (server.levels.announceChannel && server.levels.announceChannel !== 'none') {
                                client.channels.cache.get(server.levels.announceChannel).send(`GG ${message.author.username} you leveled up to level ${user.levels.level} on the guild leaderboard !`);
                            } else {
                                message.channel.send(`GG ${message.author.username} you leveled up to level ${user.levels.level} on the guild leaderboard !`);
                            }
                        }
                    }
                }
            }

            // save the user in the server.users array
            server.users[server.users.findIndex(user => user.id === message.author.id)] = user;

            // save the server in the database
            try{
                await client.serversdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': message.guild.id
                    }, {
                        'users': server.users
                    })
                ])
            }catch(err){console.log(err);}
        });
    }
}