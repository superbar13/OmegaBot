const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'levelxp',
    run: async(client) => {
        let cooldown = new Set();
        if(!client.config.modules['levels'].enabled) return console.log('[LEVELS] Levels module disabled, skipping...'.brightBlue);
        
        let base = client.config.modules['levels'].addedconfig.base;
        let xpPerMessage = client.config.modules['levels'].addedconfig.xpPerMessage;
        let goalMultiplier = client.config.modules['levels'].addedconfig.goalMultiplier;

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
            var server = await client.serversdb.findOne({ id: message.guild.id });

            // if the user is not found, create a new user
            if (!user) {
                user = await client.usersdb.createModel({ id: message.author.id });
            }

            // if the server is not found, create a new server
            if (!server) {
                server = await client.serversdb.createModel({ id: message.guild.id });
            }

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
                console.log('[LEVELS] ' + message.author.username + ' leveled up to level ' + user.levels.level + ' on the global leaderboard !'.brightGreen);
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