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
            let top25 = users.filter(user => !(user.levels.xp === 0 && user.levels.level === 0)).slice(0, 25);
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
    }
}