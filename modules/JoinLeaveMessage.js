module.exports = {
    name: 'JoinLeaveMessage',
    showname: 'Join/Leave Message',
    addedconfig: {
        joinmessage: {
            enabled: true,
            channelsIDS: [],
        },
        leavemessage: {
            enabled: true,
            channelsIDS: [],
        },
    },
    run: async (client) => {
        const { EmbedBuilder } = require('discord.js');
        // when the bot join a server
        client.on('guildCreate', async guild => {
            // The bot will send an message in channels configured in the config.json
            if (client.config.modules['JoinLeaveMessage'].addedconfig.joinmessage.enabled) {
                client.config.modules['JoinLeaveMessage'].addedconfig.joinmessage.channelsIDS.forEach(async channelID => {
                    var channel = client.channels.cache.get(channelID);
                    if (!channel) return;
                    // create the embed
                    var embed = new EmbedBuilder()
                        .setTitle('Le bot a rejoint un serveur !')
                        .setDescription(`✅ Le bot a rejoint le serveur **${guild.name}** !
                        \n👤 Propriétaire : **${guild.owner.user.tag}**\n📅 Date de création: **${guild.createdAt}**
                        \n🌐 ID du serveur : **${guild.id}**\n👥 Nombre de membres: **${guild.memberCount}**
                        // en ligne = pas hors ligne (online, idle, dnd)
                        \n🔰 Membres : **${guild.members.cache.filter(member => !member.user.bot).size} | En ligne : ${guild.members.cache.filter(member => !member.user.bot && member.presence.status != 'offline').size}**
                        // format de la date : nomdujour jour mois - année - heure:minute:seconde
                        \n🕒 Date de création : **${guild.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}**`)
                        // timestamp on the embed footer
                        .setTimestamp()
                        // icon of the server
                        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
                        // color of the embed
                        .setColor(Math.floor(Math.random() * 16777215))

                    channel.send({ embeds: [embed] });
                });
            }
        });
        // when the bot leave a server
        client.on('guildDelete', async guild => {
            // The bot will send an message in channels configured in the config.json
            if (client.config.modules['JoinLeaveMessage'].addedconfig.leavemessage.enabled) {
                client.config.modules['JoinLeaveMessage'].addedconfig.leavemessage.channelsIDS.forEach(async channelID => {
                    var channel = client.channels.cache.get(channelID);
                    if (!channel) return;
                    // create the embed
                    var embed = new EmbedBuilder()
                        .setTitle('Le bot a quitté un serveur !')
                        .setDescription(`❌ Le bot a quitté le serveur **${guild.name}** !
                        \n👤 Propriétaire : **${guild.owner.user.tag}**\n📅 Date de création: **${guild.createdAt}**
                        \n🌐 ID du serveur : **${guild.id}**\n👥 Nombre de membres: **${guild.memberCount}**
                        // en ligne = pas hors ligne (online, idle, dnd)
                        \n🔰 Membres : **${guild.members.cache.filter(member => !member.user.bot).size} | En ligne : ${guild.members.cache.filter(member => !member.user.bot && member.presence.status != 'offline').size}**
                        // format de la date : nomdujour jour mois - année - heure:minute:seconde
                        \n🕒 Date de création : **${guild.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}**`)
                        // timestamp on the embed footer
                        .setTimestamp()
                        // icon of the server
                        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
                        // color of the embed
                        .setColor(Math.floor(Math.random() * 16777215))

                    channel.send({ embeds: [embed] });
                });
            }
        });
    }
}
