const { EmbedBuilder } = require('discord.js');
const { resolve } = require("media-extractor");

let antispam = {};
const URL_REGEX = /(?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))?/gi;

module.exports = {
    name: 'interserver',
    showname: 'Interserver',
    run: async (client) => {
        module.exports.client = client;
        client.interserversdb = require('../models/interservers.model.js');
        console.log('[DATABASE] Interserver database loaded !'.brightGreen);

        // Verification at startup to remove deleted servers and channels from interservers
        let interservers = await client.interserversdb.find();
        let nbRemoved = 0;
        for (let interserver of interservers) {
            let toRemove = [];
            for (let server of interserver.servers) {
                let guild = client.guilds.cache.get(server.id);
                if (!guild) {
                    toRemove.push(server);
                    continue;
                }
                let channel = guild.channels.cache.get(server.channel);
                if (!channel) {
                    toRemove.push(server);
                    continue;
                }
            }

            for (let server of toRemove) {
                try {
                    await client.interserversdb.bulkWrite([
                        client.bulkutility.pullInArray({
                            'name': interserver.name
                        }, {
                            'servers': {
                                id: server.id
                            }
                        })
                    ]);
                    nbRemoved++;

                    // Let's refetch to get updated state for the message
                    let updatedInterserver = await client.interserversdb.findOne({ name: interserver.name });
                    let guildName = client.guilds.cache.get(server.id)?.name || "Un serveur inconnu";
                    let iconUrl = client.guilds.cache.get(server.id)?.iconURL() || client.user.avatarURL();

                    await client.modules.interserver.SendSystemMessage(
                        updatedInterserver,
                        `Le serveur ${guildName} a quitté l'interserveur car son salon n'existe plus ou le bot n'y est plus ! (automatique au redémarrage)`,
                        iconUrl
                    );

                } catch (error) { console.log(error) }
            }
        }
        if (nbRemoved > 0) console.log(`[DATABASE] ${nbRemoved} servers/channels removed from interservers database at startup`.yellow);

        // on typing event
        client.on('typingStart', async (typing) => {
            let user = typing.user;
            let channel = typing.channel;

            if (user.bot) return;
            if (channel.type === 'DM') return;

            // get interserver
            let interserver = await client.interserversdb.findOne({
                // guilds is an array of objects with ids and channels
                // we use $elemMatch to find the object with the right id (server id) and channel (channel id)
                servers: {
                    $elemMatch: {
                        id: channel.guild.id,
                        channel: channel.id
                    }
                }
            });

            // if no interserver, return
            if (!interserver) return;

            // if typing is disabled for this interserver, return
            if (interserver.typing === false) return;

            // get guilds
            let guilds = interserver.servers.filter(g => g.id !== channel.guild.id);

            // check if user is banned
            if (interserver.bannedusers.includes(user.id)) return;

            // send typing to guilds
            guilds.forEach(async g => {
                let guild = client.guilds.cache.get(g.id);
                if (!guild) return;
                let channel = guild.channels.cache.get(g.channel);
                if (!channel) return;
                try {
                    await channel.sendTyping();
                } catch (err) { }
            })
        })

        // on message event
        client.on('messageCreate', async message => {
            if (message.author.bot) return; // if bot, return
            if (message.channel.type == 3 || message.channel.type == 1) return; // 3 = DM, 1 = Group DM

            // get interserver
            let interserver = await client.interserversdb.findOne({
                // guilds is an array of objects with ids and channels
                // we use $elemMatch to find the object with the right id (server id) and channel (channel id)
                servers: {
                    $elemMatch: {
                        id: message.channel.guild.id,
                        channel: message.channel.id
                    }
                }
            });

            // if no interserver, return
            if (!interserver) return;

            // if user banned, return
            if (interserver.bannedusers.includes(message.author.id)) return message.delete();
            // if no pictures allowed, return
            if (!interserver.pictures && message.attachments.size > 0) return message.delete();
            // if no invite links allowed, return
            if (!interserver.invites && (message.content.includes('discord.gg/') || message.content.includes('discord.com/invite/'))) return message.delete();
            // if no links allowed, return
            if (interserver.antilinks && (message.content.includes('http://') || message.content.includes('https://'))) return message.delete();
            // if no spam allowed, return
            if (interserver.antispam) {
                if (!antispam[interserver.name]) antispam[interserver.name] = [];
                if (!antispam[interserver.name].find(m => m.id == message.author.id)) {
                    antispam[interserver.name].push({
                        id: message.author.id,
                        messages: 1
                    })
                } else {
                    antispam[interserver.name].find(m => m.id == message.author.id).messages++;
                    if (antispam[interserver.name].find(m => m.id == message.author.id).messages > interserver.maxspamcount) return message.delete();
                }
                // remove the 1 from the messages count with interserver.maxspamtime seconds
                setTimeout(() => {
                    if (antispam[interserver.name]) {
                        let userSpam = antispam[interserver.name].find(m => m.id == message.author.id);
                        if (userSpam) {
                            userSpam.messages--;
                            if (userSpam.messages <= 0) {
                                antispam[interserver.name] = antispam[interserver.name].filter(m => m.id != message.author.id);
                            }
                        }
                    }
                }, interserver.maxspamtime * 1000);
            }

            // if no swear words allowed, return
            if (interserver.antiswear && (
                message.content.match(/merde/gi)
            )) return message.delete();
            // if banned words, return
            if (interserver.bannedwords.length > 0) {
                let banned = false;
                interserver.bannedwords.forEach(word => {
                    if (message.content.toLowerCase().includes(word.toLowerCase())) banned = true;
                })
                if (banned) return message.delete();
            }
            // if banned links, return
            if (interserver.bannedlinks.length > 0) {
                let banned = false;
                interserver.bannedlinks.forEach(link => {
                    if (message.content.includes(link)) banned = true;
                })
                if (banned) return message.delete();
            }

            // make a list of links that are in the message
            // detect links using regex : (?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))?
            let links = message.content.match(URL_REGEX);
            if (!links) links = [];
            // delete links not starting with http:// or https://
            links = links.filter(link => link.startsWith('http://') || link.startsWith('https://'));

            // get this guild in the interserver
            let guild = interserver.servers.find(g => g.id == message.channel.guild.id);

            // check if webhook exists
            client.modules.interserver.CheckWebhook(guild.webhook?.token, guild.webhook?.id, message.channel, interserver.name);

            // get guilds
            let guilds = interserver.servers.filter(g => g.id !== message.channel.guild.id);

            // create embed for webhook
            let embed = new EmbedBuilder()
                .setAuthor({ name: interserver.name + ` [${message.id}]`, iconURL: client.user.avatarURL() })
                .setDescription(message.content)
                .setTimestamp(new Date())
                .setColor(client.modules.randomcolor.getRandomColor())
                .setFooter({ text: `From ${message.channel.guild.name} in ${message.channel.name}`, iconURL: message.channel.guild.iconURL() })
            // alternative embed (if webhook doesn't exist)
            let altembed = new EmbedBuilder()
                .setAuthor({ name: interserver.name + ` [${message.id}]`, iconURL: client.user.avatarURL() })
                .setTitle(message.author.username + ' (Enable webhooks for better messages)')
                .setDescription(message.content)
                .setTimestamp(new Date())
                .setColor(client.modules.randomcolor.getRandomColor())
                .setFooter({ text: `From ${message.channel.guild.name} in ${message.channel.name}`, iconURL: message.channel.guild.iconURL() })

            // if there are links, check for a gif or image link (.gif or tenor.com or giphy.com or .png or .jpg or .jpeg)
            if (links.length > 0) {
                // If the user posted links, we first check if links generally are allowed!
                for (let link of links) {
                    if (interserver.antilinks) return message.delete();

                    let isGif = link.includes('tenor.com') || link.includes('giphy.com') || link.includes('.gif');
                    let allowed = isGif ? interserver.gifs : interserver.pictures;

                    if (isGif || link.includes('.png') || link.includes('.jpg') || link.includes('.jpeg')) {
                        if (allowed) {
                            if (link.includes('tenor.com') || link.includes('giphy.com')) {
                                let newlink = await resolve(link);
                                embed.setImage(newlink);
                                altembed.setImage(newlink);
                            } else {
                                embed.setImage(link);
                                altembed.setImage(link);
                            }
                            break;
                        } else {
                            // remove the message and stop the function
                            try {
                                await message.delete();
                            } catch (err) { console.log((err).red) }
                            return;
                        }
                    }
                }
            }

            // if image, add it to the embed
            if (message.attachments.size > 0) {
                let attachment = message.attachments.first();
                let isGif = attachment.url.includes('.gif') || (attachment.contentType && attachment.contentType.includes('gif'));
                let allowed = isGif ? interserver.gifs : interserver.pictures;

                if (allowed) {
                    embed.setImage(attachment.url);
                    altembed.setImage(attachment.url);
                } else {
                    // remove the message and stop the function
                    try {
                        await message.delete();
                    } catch (err) { }
                    return;
                }
            }

            // give a reaction checkmark to the message
            try {
                await message.react('✅');
            } catch (err) { }

            // send message to guilds
            guilds.forEach(async g => {
                // get guild
                let guild = client.guilds.cache.get(g.id);
                if (!guild) {
                    // if guild doesn't exist, remove it from the interserver
                    try {
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.pullInArray({
                                "name": interserver.name,
                            }, {
                                "servers": {
                                    id: g.id
                                }
                            })
                        ]);
                    } catch (err) { console.log((err).red) }
                    return;
                }

                // get channel
                let channel = guild.channels.cache.get(g.channel);
                if (!channel) {
                    // if channel doesn't exist, remove it from the interserver
                    try {
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.pullInArray({
                                "name": interserver.name,
                            }, {
                                "servers": {
                                    id: g.id
                                }
                            })
                        ]);
                    } catch (err) { console.log((err).red) }
                    return;
                }

                // get webhook (and check if it exists)
                let webhook = await client.modules.interserver.CheckWebhook(g.webhook?.token, g.webhook?.id, channel, interserver.name);

                // if webhook exists
                if (webhook) {
                    // send message
                    try {
                        await webhook.send({
                            embeds: [embed],
                            username: message.author.username,
                            avatarURL: message.author.avatarURL()
                        });
                    } catch (err) {
                        // if error, remove webhook from database
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.setField({
                                "name": interserver.name
                            }, {
                                "webhook": {
                                    id: null,
                                    token: null
                                }
                            })
                        ])
                        // send message in channel (alternative method for servers that don't allow webhooks in channels)
                        // i don't recommend this method, it's not as good as webhooks, but it's better than nothing
                        // servers owners know what they're doing when they don't allow webhooks in channels
                        // WHY WOULD YOU DO THAT THOUGH ?!?! IT'S SO USEFUL !!!!!
                        try {
                            await channel.send({
                                embeds: [altembed]
                            })
                        } catch (err) { console.log((err).red) }
                    }
                } else {
                    // if not, send message in channel (alternative method for servers that don't allow webhooks in channels)
                    // i don't recommend this method, it's not as good as webhooks, but it's better than nothing
                    // servers owners know what they're doing when they don't allow webhooks in channels
                    // WHY WOULD YOU DO THAT THOUGH ?!?! IT'S SO USEFUL !!!!!
                    try {
                        await channel.send({
                            embeds: [altembed]
                        })
                    } catch (err) { console.log((err).red) }
                }
            })
        })

        // on message edit event
        client.on('messageUpdate', async (oldMessage, newMessage) => {
            let message = newMessage;

            if (message.author.bot) return; // if bot, return
            if (message.channel.type == 3 || message.channel.type == 1) return; // 3 = DM, 1 = Group DM

            // get interserver
            let interserver = await client.interserversdb.findOne({
                // guilds is an array of objects with ids and channels
                // we use $elemMatch to find the object with the right id (server id) and channel (channel id)
                servers: {
                    $elemMatch: {
                        id: message.channel.guild.id,
                        channel: message.channel.id
                    }
                }
            });

            // if no interserver, return
            if (!interserver) return;

            // if user banned, return
            if (interserver.bannedusers.includes(message.author.id)) return message.delete();
            // if no pictures allowed, return
            if (!interserver.pictures && message.attachments.size > 0) return message.delete();
            // if no invite links allowed, return
            if (!interserver.invites && (message.content.includes('discord.gg/') || message.content.includes('discord.com/invite/'))) return message.delete();
            // if no links allowed, return
            if (interserver.antilinks && (message.content.includes('http://') || message.content.includes('https://'))) return message.delete();

            // if no swear words allowed, return
            if (interserver.antiswear && (
                message.content.match(/merde/gi)
            )) return message.delete();
            // if banned words, return
            if (interserver.bannedwords.length > 0) {
                let banned = false;
                interserver.bannedwords.forEach(word => {
                    if (message.content.toLowerCase().includes(word.toLowerCase())) banned = true;
                })
                if (banned) return message.delete();
            }
            // if banned links, return
            if (interserver.bannedlinks.length > 0) {
                let banned = false;
                interserver.bannedlinks.forEach(link => {
                    if (message.content.includes(link)) banned = true;
                })
                if (banned) return message.delete();
            }

            // make a list of links that are in the message
            // detect links using regex : (?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))?
            let links = message.content.match(URL_REGEX);
            if (!links) links = [];
            // delete links not starting with http:// or https://
            links = links.filter(link => link.startsWith('http://') || link.startsWith('https://'));

            // get this guild in the interserver
            let guild = interserver.servers.find(g => g.id == message.channel.guild.id);

            // check if webhook existspng
            client.modules.interserver.CheckWebhook(guild.webhook?.token, guild.webhook?.id, message.channel, interserver.name);

            // get guilds
            let guilds = interserver.servers.filter(g => g.id !== message.channel.guild.id);

            // create embed for webhook
            let embed = new EmbedBuilder()
                .setAuthor({ name: interserver.name + ` [${message.id}]`, iconURL: client.user.avatarURL() })
                .setDescription(message.content)
                .setTimestamp(new Date())
                .setColor(client.modules.randomcolor.getRandomColor())
                .setFooter({ text: `From ${message.channel.guild.name} in ${message.channel.name}`, iconURL: message.channel.guild.iconURL() })
            // alternative embed (if webhook doesn't exist)
            let altembed = new EmbedBuilder()
                .setAuthor({ name: interserver.name + ` [${message.id}]`, iconURL: client.user.avatarURL() })
                .setTitle(message.author.username + ' (Enable webhooks for better messages)')
                .setDescription(message.content)
                .setTimestamp(new Date())
                .setColor(client.modules.randomcolor.getRandomColor())
                .setFooter({ text: `From ${message.channel.guild.name} in ${message.channel.name}`, iconURL: message.channel.guild.iconURL() })

            // if there are links, check for a gif or image link (.gif or tenor.com or giphy.com or .png or .jpg or .jpeg)
            if (links.length > 0) {
                for (let link of links) {
                    if (interserver.antilinks) return message.delete();

                    let isGif = link.includes('tenor.com') || link.includes('giphy.com') || link.includes('.gif');
                    let allowed = isGif ? interserver.gifs : interserver.pictures;

                    if (isGif || link.includes('.png') || link.includes('.jpg') || link.includes('.jpeg')) {
                        if (allowed) {
                            if (link.includes('tenor.com') || link.includes('giphy.com')) {
                                let newlink = await resolve(link);
                                embed.setImage(newlink);
                                altembed.setImage(newlink);
                            } else {
                                embed.setImage(link);
                                altembed.setImage(link);
                            }
                            break;
                        } else {
                            // remove the message and stop the function
                            try {
                                await message.delete();
                            } catch (err) { console.log((err).red) }
                            return;
                        }
                    }
                }
            }

            // if image, add it to the embed
            if (message.attachments.size > 0) {
                let attachment = message.attachments.first();
                let isGif = attachment.url.includes('.gif') || (attachment.contentType && attachment.contentType.includes('gif'));
                let allowed = isGif ? interserver.gifs : interserver.pictures;

                if (allowed) {
                    embed.setImage(attachment.url);
                    altembed.setImage(attachment.url);
                } else {
                    // remove the message and stop the function
                    try {
                        await message.delete();
                    } catch (err) { }
                    return;
                }
            }

            // send message to guilds
            guilds.forEach(async g => {
                // get guild
                let guild = client.guilds.cache.get(g.id);
                if (!guild) {
                    // if guild doesn't exist, remove it from the interserver
                    try {
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.pullInArray({
                                "name": interserver.name,
                            }, {
                                "servers": {
                                    id: g.id
                                }
                            })
                        ]);
                    } catch (err) { console.log((err).red) }
                    return;
                }

                // get channel
                let channel = guild.channels.cache.get(g.channel);
                if (!channel) {
                    // if channel doesn't exist, remove it from the interserver
                    try {
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.pullInArray({
                                "name": interserver.name,
                            }, {
                                "servers": {
                                    id: g.id
                                }
                            })
                        ]);
                    } catch (err) { console.log((err).red) }
                    return;
                }

                // get webhook (and check if it exists)
                let webhook = await client.modules.interserver.CheckWebhook(g.webhook?.token, g.webhook?.id, channel, interserver.name);

                let editmsg;
                let messages = await channel.messages.fetch({ limit: 100 });
                for (let msg of messages) {
                    msg = msg[1];
                    if (msg?.embeds[0]?.author?.name?.endsWith(`[${message.id}]`)) {
                        editmsg = msg;
                        break;
                    }
                }

                let webhookmessage;
                if (webhook) {
                    try {
                        webhookmessage = await webhook.fetchMessage(editmsg.id);
                    } catch (err) { }
                }

                // if webhook exists and if message is made by an webhook
                if (webhook && webhookmessage) {
                    // send message
                    try {
                        await webhook.editMessage(editmsg.id, {
                            embeds: [embed]
                        });
                    } catch (err) {
                        // if error, remove webhook from database
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.setField({
                                "name": interserver.name
                            }, {
                                "webhook": {
                                    id: null,
                                    token: null
                                }
                            })
                        ])
                        // send message in channel (alternative method for servers that don't allow webhooks in channels)
                        try {
                            await editmsg.edit({
                                embeds: [altembed]
                            })
                        } catch (err) { console.log((err).red) }
                    }
                } else {
                    // if not, send message in channel (alternative method for servers that don't allow webhooks in channels)
                    try {
                        await editmsg.edit({
                            embeds: [altembed]
                        })
                    } catch (err) { console.log((err).red) }
                }
            })
        })
        // event when the bot quit a server
        client.on('guildDelete', async (guild) => {
            if (client?.config?.modules['interserver']?.enabled) {
                // find servers that have this guild in their servers array
                // a servers array contains list of Objects with .id, .channel .webhook
                var interservers = await client.interserversdb.find({ servers: { $elemMatch: { id: guild.id } } });

                // for each server
                interservers.forEach(async interserver => {
                    // supprime le serveur de l'interserveur
                    try {
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.pullInArray({
                                'name': interserver.name
                            }, {
                                'servers': {
                                    id: guild.id
                                }
                            })
                        ]);
                    } catch (error) { console.log(error) }

                    // refresh l'interserveur
                    interserver = await client.interserversdb.findOne({ name: interserver.name });

                    await client.modules.interserver.SendSystemMessage(
                        interserver, // interserver
                        `Le serveur ${guild.name} a quitté l'interserveur ! (automatique)`, // message
                        guild.iconURL() // icone du serveur
                    );
                });
            }
        });

        // event when a channel is deleted
        client.on('channelDelete', async (channel) => {
            if (channel.type === 'DM' || channel.type === 'GROUP_DM') return;
            if (client?.config?.modules['interserver']?.enabled) {
                var interservers = await client.interserversdb.find({ servers: { $elemMatch: { id: channel.guild.id, channel: channel.id } } });

                interservers.forEach(async interserver => {
                    try {
                        await client.interserversdb.bulkWrite([
                            client.bulkutility.pullInArray({
                                'name': interserver.name
                            }, {
                                'servers': {
                                    id: channel.guild.id
                                }
                            })
                        ]);
                    } catch (error) { console.log(error) }

                    interserver = await client.interserversdb.findOne({ name: interserver.name });

                    await client.modules.interserver.SendSystemMessage(
                        interserver,
                        `Le serveur ${channel.guild.name} a quitté l'interserveur ! (automatique)`,
                        channel.guild.iconURL()
                    );
                });
            }
        });
    },
    CheckWebhook: async (token, id, channel, name) => {
        client = module.exports.client;

        // check if webhook exists
        let webhook;
        try {
            webhook = await client.fetchWebhook(id, token);
        } catch (err) { }
        if (!token || !id || !webhook) {
            // check if webhook exists
            webhook = await channel.fetchWebhooks().then(webhooks => webhooks.find(webhook => webhook.name === 'Interserver'))
            if (!webhook) {
                try {
                    // if not, create it
                    webhook = await channel.createWebhook({
                        name: 'Interserver',
                        avatar: client.user.avatarURL()
                    });
                } catch (err) {
                    console.log(`[WEBHOOK] There was an error creating the webhook: ${err}`.red);
                }
            }
            if (webhook) {
                // save webhook id and token to : interservers.servers.$.webhook
                try {
                    await client.interserversdb.bulkWrite([
                        client.bulkutility.setField({
                            "name": name,
                            "servers.id": channel.guild.id
                        }, {
                            "servers.$.webhook": {
                                id: webhook.id,
                                token: webhook.token
                            }
                        })
                    ])
                } catch (err) { console.log(`${err}`.red) }
                return webhook;
            } else return false;
        } else return webhook;
    },
    SendSystemMessage: async (interserver, content, image) => {
        client = module.exports.client;

        // get guilds
        let guilds = interserver.servers;

        // create embed for webhook
        let embed = new EmbedBuilder()
            .setAuthor({ name: interserver.name, iconURL: client.user.avatarURL() })
            .setDescription(content)
            .setTimestamp(new Date())
            .setColor(client.modules.randomcolor.getRandomColor())
            .setFooter({ text: `System message`, iconURL: client.user.avatarURL() })
        // alternative embed (if webhook doesn't exist)
        let altembed = new EmbedBuilder()
            .setAuthor({ name: interserver.name, iconURL: client.user.avatarURL() })
            .setTitle('System message (Enable webhooks for better messages)')
            .setDescription(content)
            .setTimestamp(new Date())
            .setColor(client.modules.randomcolor.getRandomColor())
            .setFooter({ text: `System message`, iconURL: client.user.avatarURL() })

        if (image) {
            embed.setThumbnail(image);
            altembed.setThumbnail(image);
        }

        // send message to guilds
        guilds.forEach(async g => {
            // get guild
            let guild = client.guilds.cache.get(g.id);
            if (!guild) {
                // if guild doesn't exist, remove it from the interserver
                try {
                    await client.interserversdb.bulkWrite([
                        client.bulkutility.pullInArray({
                            "name": interserver.name,
                        }, {
                            "servers": {
                                "id": g.id
                            }
                        })
                    ]);
                } catch (err) { console.log((err).red) }
                return;
            }

            // get channel
            let channel = guild.channels.cache.get(g.channel);
            if (!channel) {
                // if channel doesn't exist, remove it from the interserver
                try {
                    await client.interserversdb.bulkWrite([
                        client.bulkutility.pullInArray({
                            "name": interserver.name,
                        }, {
                            "servers": {
                                "id": g.id
                            }
                        })
                    ]);
                } catch (err) { console.log((err).red) }
                return;
            }

            // get webhook (and check if it exists)
            let webhook = await client.modules.interserver.CheckWebhook(g.webhook?.token, g.webhook?.id, channel, interserver.name);

            // if webhook exists
            if (webhook) {
                // send message
                try {
                    await webhook.send({
                        embeds: [embed],
                        username: client.user.username,
                        avatarURL: client.user.avatarURL()
                    });
                } catch (err) {
                    // if error, remove webhook from database
                    await client.interserversdb.bulkWrite([
                        client.bulkutility.setField({
                            "name": interserver.name
                        }, {
                            "webhook": {
                                id: null,
                                token: null
                            }
                        })
                    ])
                    // send message in channel (alternative method for servers that don't allow webhooks in channels)
                    // i don't recommend this method, it's not as good as webhooks, but it's better than nothing
                    // servers owners know what they're doing when they don't allow webhooks in channels
                    // WHY WOULD YOU DO THAT THOUGH ?!?! IT'S SO USEFUL !!!!!
                    try {
                        await channel.send({
                            embeds: [altembed]
                        })
                    } catch (err) { console.log((err).red) }
                }
            } else {
                // if not, send message in channel (alternative method for servers that don't allow webhooks in channels)
                // i don't recommend this method, it's not as good as webhooks, but it's better than nothing
                // servers owners know what they're doing when they don't allow webhooks in channels
                // WHY WOULD YOU DO THAT THOUGH ?!?! IT'S SO USEFUL !!!!!
                try {
                    await channel.send({
                        embeds: [altembed]
                    })
                } catch (err) { console.log((err).red) }
            }
        })
    }
}
