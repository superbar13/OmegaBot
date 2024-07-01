// info command module to be used in index.js

const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonStyle } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const moment = require('moment');
const fetch = require('node-fetch');

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
    )
    .addSubcommand(
        subcommand => subcommand
        .setName('discord')
        .setDescription('Affiche les informations a propos de l\'état de Discord')
    ),
    category: 'basic',
    ratelimit: true,
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
                { name: '📌 Nickname', value: interaction.guild?.members?.cache?.find(member => member?.id === user?.id)?.nickname?.toString() || 'Aucun', inline: true },
                { name: '🔎 ID', value: user?.id.toString(), inline: true },
                { name: '❓ Activité', value: user?.presence?.activities || 'Aucune', inline: true },
                { name: '🎯 Statut', value: user?.presence?.status?.toString() || 'Aucun', inline: true },
                { name: '🔰 Création', value: moment(user?.createdAt).format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
                { name: '🤖 Bot', value: user?.bot ? 'Oui' : 'Non', inline: true },
                { name: '🪐 Avatar', value: `[Lien](${user?.displayAvatarURL({ dynamic: true, size: 4096 })})`, inline: true },
                { name: '🌟 Nitro', value: user?.premiumSince ? 'Oui' : 'Non', inline: true },
                { name: '🎈 Roles', value: interaction?.guild?.members?.cache?.find(member => member.id === user?.id)?.roles?.cache?.size?.toString() || 'Aucun', inline: true },
                { name: '🧭 Flags', value: user?.flags?.toArray().length > 0 ? user?.flags?.toArray().join(', ') : 'Aucun', inline: false },
            )
            .setThumbnail(user?.displayAvatarURL())
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
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
                { name: '💠 Owner', value: server?.members?.cache?.find(member => member.id === server?.ownerId)?.user?.tag?.toString() || 'Aucun', inline: true },
                { name: '🕒 Création', value: moment(server?.createdAt)?.format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
                { name: '😀 Membres', value: server?.memberCount?.toString(), inline: true },
                { name: '🥳 Emojis', value: server?.emojis?.cache?.size?.toString(), inline: true },
                { name: '🧭 Salons', value: server?.channels?.cache?.size?.toString(), inline: true },
                { name: '🎯 Roles', value: server?.roles?.cache.size?.toString(), inline: true },
                { name: '🌟 Boosts', value: server?.premiumSubscriptionCount?.toString() + " > Niveau : " + server?.premiumTier?.toString(), inline: true },
                { name: '🛸 Vérifié', value: server?.verified ? 'Oui' : 'Non', inline: true },
                { name: '🔥 Partenaire', value: server?.partnered ? 'Oui' : 'Non', inline: true },
                { name: '🌀 Vanity URL', value: server?.vanityURLCode?.toString() || 'Aucune', inline: true },
                { name: '🔞 NSFW', value: server?.nsfwLevel? 'Oui' : 'Non', inline: true },
                { name: '🎯 Notifications', value: server?.defaultMessageNotifications === 'ALL' ? 'Tout' : 'Mentions', inline: true },
                { name: '⚡ Système de vérification', value: server?.verificationLevel === 3 ? 'Élevé' : server?.verificationLevel === 2 ? 'Moyen' : server?.verificationLevel === 1 ? 'Faible' : 'Aucun', inline: true },
                { name: '👁 Système de filtrage', value: server?.explicitContentFilter === 2 ? 'Tout' : server?.explicitContentFilter === 1 ? 'Membres sans rôle' : 'Aucun', inline: true },
                { name: '⏫ Membres maximum', value: server?.maximumMembers?.toString() || 'Aucun', inline: true },
                { name: '📃 Langue', value: server?.preferredLocale?.toString(), inline: true },
                { name: '🌐 Features', value: server?.features?.length > 0 ? server?.features?.map(f => f.toString()).join(', ') : 'Aucune', inline: false },
            )
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
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
                { name: '📌 ID', value: channel?.id?.toString(), inline: true },
                { name: '🎯 Catégorie', value: channel?.parent?.name?.toString() || 'Aucune', inline: true },
                { name: '🔎 Position', value: channel?.position?.toString(), inline: true },
                { name: '🔰 Type', value: channel?.type?.toString(), inline: true },
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
                { name: '🌟 Couleur', value: role?.color?.toString(), inline: true },
                { name: '🔎 Position', value: role?.position?.toString(), inline: true },
                { name: '😀 Membres', value: role?.members?.size?.toString(), inline: true },
            )
            .setThumbnail(server?.iconURL())
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
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
                { name: '📡 Nb Serveurs', value: interaction.client.guilds.cache.size.toString(), inline: true },
                { name: '📚 Nb Salons', value: interaction.client.channels.cache.size.toString(), inline: true },
                { name: '👁 Nb Membres', value: interaction.client.users.cache.size.toString(), inline: true },
                { name: '🚀 Version Discord JS', value: interaction.client.discordjsversion.toString(), inline: true },
                { name: '✈ Version Telegraf', value: interaction.client.telegrafversion.toString(), inline: true },
                { name: '🚀 Version NodeJs', value: process.version.toString(), inline: true },
                { name: '⚡ Nb Commandes', value: interaction.client.commands.size.toString(), inline: true },
                { name: '🪐 Créateur', value: interaction.client.users.cache.find(user => user.id === interaction.client.owner)?.tag.toString(), inline: true },
                { name: '📎 Version', value: interaction.client.version.toString(), inline: true },
                { name: '🖋 Prefix', value: interaction.client.prefix.toString(), inline: true },
                { name: '📌 Invite', value: `[Cliquez ici](${interaction.client.invite})`, inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            // if user is the owner
            if(interaction.user.id === interaction.client.owner){
                // max numbers of fields
                let serversperpage = 25;
                // list all the servers
                // get all the servers
                let servers = [];
                let basicServers = interaction.client.guilds.cache;
                for(let server of basicServers){
                    server = server[1];
                    servers.push({
                        name: server.name,
                        id: server.id,
                        count: server.memberCount,
                        owner: await interaction.client.users.fetch(server.ownerId),
                    });
                }

                // trier par nombre de membres (plus grand au plus petit)
                servers.sort((a, b) => b.count - a.count);
                // function to generate the description
                function genDesc() {
                    return servers
                    .slice((page - 1) * serversperpage, page * serversperpage)
                    .map(
                        server => `${server.count} - **${server.name}** (${server.id})\nBy ${server.owner.tag} (${server.owner} - ${server.owner.id})`
                    )
                    .join('\n')
                }
                // calculate the number of pages
                const pages = Math.ceil(servers.length / serversperpage);
                let page = 1;
                // the embed is only for the servers
                let embed2 = new EmbedBuilder()
                .setTitle('🤖 Serveurs')
                .setDescription(genDesc())
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setFooter({ text: `${interaction.client.user.username} - ${page}`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
                // create the message
                await interaction.editReply({ embeds: [embed, embed2], components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(page == 1),
                        new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(pages == 1)
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
                        embed2.setDescription(genDesc())
                        .setFooter({ text: `${interaction.client.user.username} - ${page}`, iconURL: interaction.client.user.displayAvatarURL() })
                        // edit the message
                        await i.update({ embeds: [embed, embed2], components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(page == 1),
                                new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(page == pages)
                            )
                        ] });
                    }
                    // if the button is next
                    else if(i.customId === 'next'){
                        // increase the page
                        page++;
                        embed2.setDescription(genDesc())
                        .setFooter({ text: `${interaction.client.user.username} - ${page}`, iconURL: interaction.client.user.displayAvatarURL() })
                        // edit the message
                        await i.update({ embeds: [embed, embed2], components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(page == 1),
                                new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(page == pages)
                            )
                        ] });
                    }
                });
                // when the collector ends
                collector.on('end', async () => {
                    // edit the message
                    embed2.setFooter({ text: `${interaction.client.user.username} - Vous devez refaire la commande pour les boutons. Temps limité.`, iconURL: interaction.client.user.displayAvatarURL() })
                    await interaction.editReply({ embeds: [embed, embed2], components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(true),
                            new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(true),
                        )
                    ] });
                });
            } else await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'discord'){
            const status = await fetch('https://discordstatus.com/api/v2/summary.json').then(res => res.json());
            if(!status) return interaction.editReply({ content: ':x: Une erreur est survenue' });

            let globalstatus;
            if(status?.status?.indicator === 'none') globalstatus = '✅ Opérationnel';
            else if(status?.status?.indicator === 'minor') globalstatus = '🟡 Performance dégradée';
            else if(status?.status?.indicator === 'major') globalstatus = '🟠 Panne partielle';
            else if(status?.status?.indicator === 'critical') globalstatus = '🔴 Panne majeure';
            else if(status?.status?.indicator === 'maintenance') globalstatus = '🔵 Maintenance';
            else globalstatus = '❌ Inconnu';

            let embeds = [];
            let embed = new EmbedBuilder()
            .setTitle('📡 État de Discord : ' + globalstatus)
            .setDescription(status?.status?.description?.toString() || 'Aucune description')
            .setThumbnail("https://cdn.discordapp.com/attachments/909475568293138494/1125205709492080720/800px-Discord_Logo_sans_texte.png")
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            embeds.push(embed);

            let fieldscount = 0;
            for(let component of status?.components){
                let st;
                if(component.status === 'operational') st = '✅ Opérationnel';
                else if(component.status === 'degraded_performance') st = '🟡 Performance dégradée';
                else if(component.status === 'partial_outage') st = '🟠 Panne partielle';
                else if(component.status === 'major_outage') st = '🔴 Panne majeure';
                else if(component.status === 'under_maintenance') st = '🔵 Maintenance';
                else st = '❌ Inconnu';
                // check embeds count
                if(fieldscount === 25){
                    embed = new EmbedBuilder()
                    .setTitle('(Suite) 📡 État de Discord : ' + globalstatus)
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();
                    embeds.push(embed);
                }
                embed.addFields({ name: component.name, value: st, inline: true });
                fieldscount++;
            }
            
            let incidents = '';
            for(let incident of status?.incidents){
                incidents += `**${incident.name}**\n` +
                    `Impact : ${incident.impact == "none" ? "Aucun" : incident.impact == "minor" ? "Performance dégradée" : incident.impact == "major" ? "Panne partielle" : incident.impact == "critical" ? "Panne majeure" : "Inconnu"}\n` +
                    `Début : ${moment(incident.created_at).format('DD/MM/YYYY à HH:mm:ss')}\n` +
                    `Fin : ${(incident.resolved_at && incident.resolved_at.length > 0) ? moment(incident.resolved_at).format('DD/MM/YYYY à HH:mm:ss') : "En cours"}\n` +
                    `Status: ${incident.status == "resolved" ? "Résolu" : incident.status == "monitoring" ? "En cours" : incident.status == "identified" ? "Identifié" : incident.status == "investigating" ? "En cours d'investigation" : "Inconnu"}\n` +
                    `Dernière mise à jour : ${incident.updated_at.length > 0 ? moment(incident.updated_at).format('DD/MM/YYYY à HH:mm:ss') : "Aucune"}\n` +
                    `Mise à jour : ${incident.incident_updates.length > 0 ? 
                        `${incident.incident_updates.map(update =>
                            `**${update.status == "resolved" ? "Résolu" : update.status == "monitoring" ? "En cours" : update.status == "identified" ? "Identifié" : update.status == "investigating" ? "En cours d'investigation" : "Inconnu"}**\n` +
                            `Crée a : ${moment(update.created_at).format('DD/MM/YYYY à HH:mm:ss')}\n` +
                            `Dernière mise à jour : ${update.updated_at.length > 0 ? moment(update.updated_at).format('DD/MM/YYYY à HH:mm:ss') : "Aucune"}\n` +
                            `Message : ${update.body}`
                        ).join('\n')}` : "Aucune"}`;
            }
            embed.addFields({ name: 'Incidents', value: incidents.length > 0 ? incidents.slice(0, 1023) : 'Aucun' })

            let scheduled_maintenances = '';
            for(let maintenance of status?.scheduled_maintenances){
                scheduled_maintenances += `**${maintenance.name}**\n` +
                    `Impact : ${maintenance.impact == "none" ? "Aucun" : maintenance.impact == "minor" ? "Performance dégradée" : maintenance.impact == "major" ? "Panne partielle" : maintenance.impact == "critical" ? "Panne majeure" : "Inconnu"}\n` +
                    `Début : ${moment(maintenance.scheduled_for).format('DD/MM/YYYY à HH:mm:ss')}\n` +
                    `Fin : ${(maintenance.scheduled_until && maintenance.scheduled_until.length > 0) ? moment(maintenance.scheduled_until).format('DD/MM/YYYY à HH:mm:ss') : "En cours"}\n` +
                    `Status: ${maintenance.status == "completed" ? "Terminé" : maintenance.status == "in_progress" ? "En cours" : maintenance.status == "scheduled" ? "Planifié" : "Inconnu"}\n` +
                    `Dernière mise à jour : ${maintenance.updated_at.length > 0 ? moment(maintenance.updated_at).format('DD/MM/YYYY à HH:mm:ss') : "Aucune"}\n` +
                    `Mise à jour : ${maintenance.incident_updates.length > 0 ?
                        `${maintenance.incident_updates.map(update =>
                            `**${update.status == "completed" ? "Terminé" : update.status == "in_progress" ? "En cours" : update.status == "scheduled" ? "Planifié" : "Inconnu"}**\n` +
                            `Crée a : ${moment(update.created_at).format('DD/MM/YYYY à HH:mm:ss')}\n` +
                            `Dernière mise à jour : ${update.updated_at.length > 0 ? moment(update.updated_at).format('DD/MM/YYYY à HH:mm:ss') : "Aucune"}\n` +
                            `Message : ${update.body}`
                        ).join('\n')}` : "Aucune"}`;
            }
            
            embed.addFields({ name: 'Maintenances planifiées', value: scheduled_maintenances.length > 0 ? scheduled_maintenances.slice(0, 1023) : 'Aucune' })

            await interaction.editReply({ embeds: embeds});
        }
    }
};