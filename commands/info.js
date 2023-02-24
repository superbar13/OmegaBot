// ping command module to be used in index.js

const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonStyle } = require('discord.js');
const {PermissionsBitField} = require('discord.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Affiche les informations a propos de ce que vous avez demandé')
    // add options radio required for the command
    .addSubcommand(
        subcommand => subcommand
        .setName('user')
        .setDescription('Affiche les informations a propos de l\'utilisateur')
        .addUserOption(option => option.setName('user').setDescription('Utilisateur a afficher').setRequired(false))
    )
    .addSubcommand(
        subcommand => subcommand
        .setName('server')
        .setDescription('Affiche les informations a propos du serveur')
        .addBooleanOption(option => option.setName('server').setDescription('Serveur a afficher').setRequired(false))
    )
    .addSubcommand(
        subcommand => subcommand
        .setName('channel')
        .setDescription('Affiche les informations a propos du salon')
        .addChannelOption(option => option.setName('channel').setDescription('Salon a afficher').setRequired(false))
    )
    .addSubcommand(
        subcommand => subcommand
        .setName('role')
        .setDescription('Affiche les informations a propos du role')
        .addRoleOption(option => option.setName('role').setDescription('Role a afficher').setRequired(false))
    )
    .addSubcommand(
        subcommand => subcommand
        .setName('bot')
        .setDescription('Affiche les informations a propos du bot')
    ),
    category: 'info',
    async execute(interaction){
        await interaction.deferReply();
        // check which subcommand is used
        const subcommand = interaction.options.getSubcommand();
        if(subcommand === 'user'){
            // get the option value
            const user = interaction.options.getUser('user') || interaction.user;
            // create embed
            const embed = new EmbedBuilder()
            .setTitle('😁 ' + user?.tag)
            .setDescription(user.toString())
            .addFields(
                { name: '🖋 Tag', value: user?.tag.toString(), inline: true },
                { name: '📌 Nickname', value: interaction.guild?.members.cache.find(member => member.id === user?.id)?.nickname?.toString() || 'Aucun', inline: true },
                { name: '🔎 ID', value: user?.id.toString(), inline: true },
                { name: '❓ Activité', value: user?.presence?.activities || 'Aucune', inline: true },
                { name: '🎯 Statut', value: user?.presence?.status?.toString() || 'Aucun', inline: true },
                { name: '🔰 Création', value: moment(user?.createdAt).format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
                { name: '🤖 Bot', value: user?.bot ? 'Oui' : 'Non', inline: true },
                { name: '🪐 Avatar', value: `[Lien](${user?.displayAvatarURL({ dynamic: true, size: 4096 })})`, inline: true },
                { name: '🌟 Nitro', value: user?.premiumSince ? 'Oui' : 'Non', inline: true },
                { name: '🎈 Roles', value: interaction.guild?.members.cache.find(member => member.id === user?.id)?.roles.cache.size.toString() || 'Aucun', inline: true },
                { name: '🧭 Flags', value: user?.flags?.toArray().length > 0 ? user?.flags?.toArray().join(', ') : 'Aucun', inline: false },
            )
            .setThumbnail(user?.displayAvatarURL())
            .setColor(Math.floor(Math.random()*16777215).toString(16))
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'server'){
            // get the option value
            const server = interaction.options.getBoolean('server') || interaction.guild;
            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🏠 ' + server?.name)
            .setDescription(server?.description?.toString() || 'Aucune description')
            .addFields(
                { name: '🔎 ID', value: server.id?.toString(), inline: true },
                { name: '💠 Owner', value: server?.members.cache.find(member => member.id === server?.ownerId)?.user?.tag?.toString() || 'Aucun', inline: true },
                { name: '🕒 Création', value: moment(server?.createdAt).format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
                { name: '😀 Membres', value: server?.memberCount.toString(), inline: true },
                { name: '🥳 Emojis', value: server?.emojis.cache.size.toString(), inline: true },
                { name: '🧭 Salons', value: server?.channels.cache.size.toString(), inline: true },
                { name: '🎯 Roles', value: server?.roles.cache.size.toString(), inline: true },
                { name: '🌟 Boosts', value: server?.premiumSubscriptionCount.toString() + " > Niveau : " + server?.premiumTier.toString(), inline: true },
                { name: '🛸 Vérifié', value: server?.verified ? 'Oui' : 'Non', inline: true },
                { name: '🔥 Partenaire', value: server?.partnered ? 'Oui' : 'Non', inline: true },
                { name: '🌀 Vanity URL', value: server?.vanityURLCode?.toString() || 'Aucune', inline: true },
                { name: '🔞 NSFW', value: server?.nsfwLevel? 'Oui' : 'Non', inline: true },
                { name: '🎯 Notifications', value: server?.defaultMessageNotifications === 'ALL' ? 'Tout' : 'Mentions', inline: true },
                { name: '⚡ Système de vérification', value: server?.verificationLevel === 3 ? 'Élevé' : server?.verificationLevel === 2 ? 'Moyen' : server?.verificationLevel === 1 ? 'Faible' : 'Aucun', inline: true },
                { name: '👁 Système de filtrage', value: server?.explicitContentFilter === 2 ? 'Tout' : server?.explicitContentFilter === 1 ? 'Membres sans rôle' : 'Aucun', inline: true },
                { name: '⏫ Membres maximum', value: server?.maximumMembers?.toString() || 'Aucun', inline: true },
                { name: '🌐 Features', value: server?.features.length > 0 ? server?.features.map(f => f.toString()).join(', ') : 'Aucune', inline: false },
                { name: '📃 Langue', value: server?.preferredLocale.toString(), inline: true },
            )
            .setColor(Math.floor(Math.random()*16777215).toString(16))
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(server?.iconURL())
            .setTimestamp();
            // set image if there is one
            if(server?.bannerURL() || server?.splashURL() || server?.discoverySplashURL()){
                embed.setImage(server?.bannerURL() || server?.splashURL() || server?.discoverySplashURL() || '');
            }
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'channel'){
            // get the option value
            const channel = interaction.options.getChannel('channel') || interaction.channel;
            // create embed
            const server = interaction.guild;
            const embed = new EmbedBuilder()
            .setTitle('🪟 ' + channel?.name)
            .setDescription(channel.toString())
            .addFields(
                { name: '📃 Topic', value: channel?.topic?.toString() || 'Aucun', inline: false },
                { name: '📌 ID', value: channel?.id.toString(), inline: true },
                { name: '🎯 Catégorie', value: channel?.parent?.name.toString() || 'Aucune', inline: true },
                { name: '🔎 Position', value: channel?.position.toString(), inline: true },
                { name: '🔰 Type', value: channel?.type.toString(), inline: true },
                { name: '🕒 Création', value: moment(channel?.createdAt).format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
                { name: '🔞 NSFW', value: channel?.nsfw ? 'Oui' : 'Non', inline: true },
            )
            .setThumbnail(server?.iconURL())
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'role'){
            // get the option value
            const server = interaction.guild;
            const role = interaction.options.getRole('role') || interaction.guild.roles.everyone;
            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🎭 ' + role?.name)
            .setDescription(role?.toString())
            .addFields(
                { name: '📌 ID', value: role?.id.toString(), inline: true },
                { name: '🕒 Création', value: moment(role?.createdAt).format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
                { name: '🔰 Mentionable', value: role?.mentionable ? 'Oui' : 'Non', inline: true },
                { name: '🧭 Detaché', value: role?.hoist ? 'Oui' : 'Non', inline: true },
                { name: '🌟 Couleur', value: role?.color.toString(), inline: true },
                { name: '🔎 Position', value: role?.position.toString(), inline: true },
                { name: '😀 Membres', value: role?.members.size.toString(), inline: true },
            )
            .setThumbnail(server?.iconURL())
            .setColor(Math.floor(Math.random()*16777215).toString(16))
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'bot'){
            let uptime = interaction.client.uptime;
            // format using moment
            if(uptime < 1000) uptime = moment(uptime).format('ss')
            else if(uptime < 60000) uptime = moment(uptime).format('ss')
            else if(uptime < 3600000) uptime = moment(uptime).format('mm:ss')
            else if(uptime < 86400000) uptime = moment(uptime).format('HH:mm:ss')
            else if(uptime < 2592000000) uptime = moment(uptime).format('DD et HH:mm:ss')
            else if(uptime < 31536000000) uptime = moment(uptime).format('MM/DD et HH:mm:ss')
            else uptime = moment(uptime).format('YYYY/MM/DD et HH:mm:ss');
            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🤖 Informations sur ' + interaction.client.user.tag)
            .setDescription(interaction.client.user?.about?.toString() || 'Aucune description')
            .addFields(
                { name: '⏫ Uptime', value: uptime, inline: true },
                { name: '🏓 Ping', value: interaction.client.ws.ping.toString(), inline: true },
                { name: '📡 Serveurs', value: interaction.client.guilds.cache.size.toString(), inline: true },
                { name: '📚 Salons', value: interaction.client.channels.cache.size.toString(), inline: true },
                { name: '👁 Membres', value: interaction.client.users.cache.size.toString(), inline: true },
                { name: '🚀 Version Discord JS', value: interaction.client.version.toString(), inline: true },
                { name: '🧳 Utilisation de la mémoire', value: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB', inline: true },
                { name: '🚀 Version NodeJs', value: process.version.toString(), inline: true },
                { name: '⚡ Commandes', value: interaction.client.commands.size.toString(), inline: true },
                { name: '🪐 Créateur', value: interaction.client.users.cache.find(user => user.id === interaction.client.owner)?.tag.toString(), inline: true },
                { name: '🛸 Création', value: moment(interaction.client.user.createdAt).format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
                { name: '📎 Version', value: interaction.client.version.toString(), inline: true },
                { name: '🖋 Prefix', value: interaction.client.prefix.toString(), inline: true },
                { name: '📌 Invite', value: `[Cliquez ici](${interaction.client.invite})`, inline: true },
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setColor(Math.floor(Math.random()*16777215).toString(16))
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            // if user is the owner
            if(interaction.user.id === interaction.client.owner){
                // max numbers of fields
                let serversperpage = 25;
                // list all the servers
                // get all the servers
                const servers = interaction.client.guilds.cache.map(server => {
                    return {
                        name: server.name,
                        id: server.id
                    }
                });
                // calculate the number of pages
                const pages = Math.ceil(servers.length / serversperpage);
                let page = 0;
                // the embed is only for the servers
                let embed2 = new EmbedBuilder()
                .setTitle('🤖 Serveurs')
                .setDescription(servers.slice(page * serversperpage, page * serversperpage + serversperpage).map(server => `**${server.name}**\n${server.id}`).join('\n\n'))
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setColor(Math.floor(Math.random()*16777215).toString(16))
                .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
                // create the message
                await interaction.editReply({ embeds: [embed, embed2], components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(pages === 1),
                        new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(pages === 1),
                    )
                ] });
                // create the collector
                const collector = interaction.channel.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 60000 });
                // when a button is clicked
                collector.on('collect', async (i) => {
                    // if the button is previous
                    if(i.customId === 'previous'){
                        // decrease the page
                        page--;
                        // edit the message
                        await i.update({ embeds: [embed, embed2], components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
                                new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(page === pages - 1),
                            )
                        ] });
                    }
                    // if the button is next
                    else if(i.customId === 'next'){
                        // increase the page
                        page++;
                        // edit the message
                        await i.update({ embeds: [embed, embed2], components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
                                new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(page === pages - 1),
                            )
                        ] });
                    }
                });
                // when the collector ends
                collector.on('end', async () => {
                    // edit the message
                    await interaction.editReply({ embeds: [embed, embed2], components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(true),
                            new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(true),
                        )
                    ] });
                });
            } else await interaction.editReply({ embeds: [embed] });
        }
    }
};