// rank command module to be used in index.js (but it's for guilds)
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clan')
        .setDescription('Gestion des clans')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('info')
            .setDescription('Affiche les informations du clan')
            .addStringOption(option => option
                .setName('clan')
                .setDescription('Nom du clan')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Créer un clan')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Nom du clan')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('description')
                .setDescription('Description du clan')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('join')
            .setDescription('Rejoindre un clan')
            .addStringOption(option => option
                .setName('clan')
                .setDescription('Nom du clan')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('leave')
            .setDescription('Quitter son clan')
        )
        .addSubcommand(subcommand => subcommand
            .setName('invite')
            .setDescription('Inviter un membre dans son clan')
            .addUserOption(option => option
                .setName('user')
                .setDescription('Membre à inviter')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('kick')
            .setDescription('Exclure un membre de son clan')
            .addUserOption(option => option
                .setName('user')
                .setDescription('Membre à exclure')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Supprimer un clan')
        ),
    category: 'rpg',
    telegram: 'disabled',
    async execute(interaction){
        if(!interaction?.client?.RPG) return interaction.reply({ content: '> ❌ Le module est en cours de chargement.'});
        if(!interaction?.client?.config?.modules['rpg']?.enabled) return interaction.reply({ content: '> ❌ Le module est désactivé.'});

        // defer reply
        await interaction.deferReply();

        // get subcommand
        const subcommand = interaction.options.getSubcommand();
        if(subcommand == 'info') {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get clan in the database (user clan (via members) if he has one or name of the clan, priority to name of the clan)
            const clan = await interaction.client.clansdb.findOne({ $or: [{ name: interaction.options.getString('clan') }, { members: interaction.user.id }] });
            if(!clan) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // create embed with clan
            const embed = new EmbedBuilder()
            .setTitle(`👥 Clan ${clan.name} 👥`)
            .setDescription('Voici les informations du clan')
            
            // if clan has a logo
            if(clan.logo) {
                // create attachment
                const attachment = new AttachmentBuilder(clan.logo, 'logo.png');
                // add attachment to embed
                embed.attachFiles(attachment);
                embed.setThumbnail('attachment://logo.png');
            }

            // if clan has a banner
            if(clan.banner) {
                // create attachment
                const attachment = new AttachmentBuilder(clan.banner, 'banner.png');
                // add attachment to embed
                embed.attachFiles(attachment);
                embed.setImage('attachment://banner.png');
            }

            // add fields
            embed.addFields(
                { name: '👥 Membres', value: clan.members.toString(), inline: true },
                { name: '📈 XP', value: clan.xp.toString(), inline: true },
                { name: '📜 Description', value: clan.description.toString(), inline: true },
                { name: '💸 Money', value: `${clan.money}`, inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == 'create') {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get name of the clan
            const name = interaction.options.getString('name');
            if(!name) return interaction.editReply({ content: '> ❌ Veuillez entrer un nom.'});
            // get description of the clan
            const description = interaction.options.getString('description');
            if(!description) return interaction.editReply({ content: '> ❌ Veuillez entrer une description.'});

            // create clan in the database
            const clan = await interaction.client.clansdb.createModel({
                name: name,
                description: description,
                members: [interaction.user.id],
            });
            if(!clan) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // send embed
            await interaction.editReply({ content: `> ✅ Le clan **${clan.name}** a été créé avec succès !` });
        } else if(subcommand == 'join') {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
           
            // get clan in the database (name of the clan)
            const clan = await interaction.client.clansdb.findOne({ name: interaction.options.getString('clan') });
            if(!clan) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // if user is already in a clan
            const userClan = await interaction.client.clansdb.findOne({ members: interaction.user.id });
            if(userClan) return interaction.editReply({ content: '> ❌ Vous êtes déjà dans un clan.'});

            // add user to clan
            clan.members.push(interaction.user.id);

            // update clan in the database
            try {
                await interaction.client.clansdb.bulkWrite([
                    client.bulkutility.pushInArray({
                        name: clan.name
                    }, {
                        members: interaction.user.id
                    })
                ]);
            } catch (error) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // send embed
            await interaction.editReply({ content: `> ✅ Vous avez rejoint le clan **${clan.name}** avec succès !` });
        } else if(subcommand == 'leave') {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get clan in the database (user clan (via members) if he has one)
            const clan = await interaction.client.clansdb.findOne({ members: interaction.user.id });
            if(!clan) return interaction.editReply({ content: '> ❌ Vous n\'êtes dans aucun clan.'});

            // remove user from clan
            clan.members = clan.members.filter(member => member != interaction.user.id);

            // update clan in the database
            try {
                await interaction.client.clansdb.bulkWrite([
                    client.bulkutility.pullInArray({
                        name: clan.name
                    }, {
                        members: interaction.user.id
                    })
                ]);
            } catch (error) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // send embed
            await interaction.editReply({ content: `> ✅ Vous avez quitté le clan **${clan.name}** avec succès !` });

            // if clan has no members
            if(clan.members.length == 0) {
                // delete clan
                await interaction.client.clansdb.deleteOne({ name: clan.name });
            }
        } else if(subcommand == 'invite') {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get clan in the database (user clan (via members) if he has one)
            const clan = await interaction.client.clansdb.findOne({ members: interaction.user.id });
            if(!clan) return interaction.editReply({ content: '> ❌ Vous n\'êtes dans aucun clan.'});

            // get user to invite
            const userToInvite = interaction.options.getUser('user');
            if(!userToInvite) return interaction.editReply({ content: '> ❌ Veuillez mentionner un utilisateur.'});

            // if user to invite is already in a clan
            const userToInviteClan = await interaction.client.clansdb.findOne({ members: userToInvite.id });
            if(userToInviteClan) return interaction.editReply({ content: '> ❌ L\'utilisateur est déjà dans un clan.'});

            // add user to clan
            clan.invites.push(userToInvite.id);

            // update clan in the database
            try {
                await interaction.client.clansdb.bulkWrite([
                    client.bulkutility.pushInArray({
                        name: clan.name
                    }, {
                        invites: userToInvite.id
                    })
                ]);
            } catch (error) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // send embed
            await interaction.editReply({ content: `> ✅ Vous avez invité **${userToInvite.tag}** dans le clan **${clan.name}** avec succès !` });
        } else if(subcommand == 'kick') {
            // 2 things :
            // kick need to be done by a majority of members (50% + 1)
            // we don't need all members to kick from invites

            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get clan in the database (user clan (via members) if he has one)
            const clan = await interaction.client.clansdb.findOne({ members: interaction.user.id });
            if(!clan) return interaction.editReply({ content: '> ❌ Vous n\'êtes dans aucun clan.'});

            // get user to kick
            const userToKick = interaction.options.getUser('user');
            if(!userToKick) return interaction.editReply({ content: '> ❌ Veuillez mentionner un utilisateur.'});

            // check if user to kick is in the clan or in the invites
            if(clan.invites.includes(userToKick.id)) {
                // remove user from clan
                clan.invites = clan.invites.filter(member => member != userToKick.id);

                // update clan in the database
                try {
                    await interaction.client.clansdb.bulkWrite([
                        client.bulkutility.pullInArray({
                            name: clan.name
                        }, {
                            invites: userToKick.id
                        })
                    ]);
                } catch (error) {
                    return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
                }

                // send embed
                await interaction.editReply({ content: `> ✅ Vous avez exclu **${userToKick.tag}** du clan **${clan.name}** avec succès !` });
            } else if(clan.members.includes(userToKick.id)) {
                // wait for 50% + 1 members to vote
                // create select menu
                const selectMenu = new SelectMenuBuilder()
                .setCustomId('kick')
                .setPlaceholder('Veuillez voter')
                .addOptions([
                    {
                        label: 'Oui',
                        description: 'Voter oui',
                        value: 'oui',
                    },
                    {
                        label: 'Non',
                        description: 'Voter non',
                        value: 'non',
                    },
                ]);

                // create action row
                const actionRow = new ActionRowBuilder()
                .addComponents(selectMenu);

                // send embed
                let embed = new EmbedBuilder()
                .setTitle('👥 Vote pour exclure un membre 👥')
                .setDescription(`**${userToKick.tag}** a été proposé pour être exclu du clan **${clan.name}**.\nVeuillez voter pour ou contre.`)
                .setColor('#FF0000');

                // send embed
                let message = await interaction.editReply({ embeds: [embed], components: [actionRow] });

                // create collector
                const collector = message.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 60000 });

                // create variables
                let yes = 0;
                let no = 0;
                let voters = [];

                // on collect
                collector.on('collect', async (interaction) => {
                    // if user already voted
                    if(voters.includes(interaction.user.id)) {
                        // send embed
                        await interaction.reply({ content: '> ❌ Vous avez déjà voté.', ephemeral: true });
                    } else {
                        // add user to voters
                        voters.push(interaction.user.id);

                        // if user voted yes
                        if(interaction.values[0] == 'oui') {
                            // add 1 to yes
                            yes++;
                        } else if(interaction.values[0] == 'non') {
                            // add 1 to no
                            no++;
                        }

                        // if all members voted
                        if(yes + no == clan.members.length) {
                            // stop collector
                            collector.stop();
                        }

                        // send embed
                        await interaction.reply({ content: '> ✅ Votre vote a été pris en compte.', ephemeral: true });
                    }
                });

                // on end
                collector.on('end', async (collected, reason) => {
                    // if reason is time
                    if(reason == 'time') {
                        // send embed
                        await interaction.editReply({ content: '> ❌ Le temps est écoulé.', components: [] });
                    } else {
                        // if yes > no
                        if(yes > no) {
                            // remove user from clan
                            clan.members = clan.members.filter(member => member != userToKick.id);

                            // update clan in the database
                            try {
                                await interaction.client.clansdb.bulkWrite([
                                    client.bulkutility.pullInArray({
                                        name: clan.name
                                    }, {
                                        members: userToKick.id
                                    })
                                ]);
                            } catch (error) {
                                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
                            }

                            // send embed
                            await interaction.editReply({ content: `> ✅ Vous avez exclu **${userToKick.tag}** du clan **${clan.name}** avec succès !`, components: [] });
                        } else {
                            // send embed
                            await interaction.editReply({ content: '> ❌ Le vote n\'a pas été accepté.', components: [] });
                        }
                    }
                });
            } else return interaction.editReply({ content: '> ❌ L\'utilisateur n\'est pas dans le clan.'});
        } else if(subcommand == 'remove') {
            // remove need to be 50% + 1 of members

            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get clan in the database (user clan (via members) if he has one)
            const clan = await interaction.client.clansdb.findOne({ members: interaction.user.id });
            if(!clan) return interaction.editReply({ content: '> ❌ Vous n\'êtes dans aucun clan.'});

            // wait for 50% + 1 members to vote
            // create select menu
            const selectMenu = new SelectMenuBuilder()
            .setCustomId('remove')
            .setPlaceholder('Veuillez voter')
            .addOptions([
                {
                    label: 'Oui',
                    description: 'Voter oui',
                    value: 'oui',
                },
                {
                    label: 'Non',
                    description: 'Voter non',
                    value: 'non',
                },
            ]);

            // create action row
            const actionRow = new ActionRowBuilder()
            .addComponents(selectMenu);

            // send embed
            let embed = new EmbedBuilder()
            .setTitle('👥 Vote pour supprimer un clan 👥')
            .setDescription(`Le clan **${clan.name}** a été proposé pour être supprimé.\nVeuillez voter pour ou contre.`)
            .setColor('#FF0000');

            // send embed
            let message = await interaction.editReply({ embeds: [embed], components: [actionRow] });

            // create collector
            const collector = message.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 60000 });

            // create variables
            let yes = 0;
            let no = 0;
            let voters = [];

            // on collect
            collector.on('collect', async (interaction) => {
                // if user already voted
                if(voters.includes(interaction.user.id)) {
                    // send embed
                    await interaction.reply({ content: '> ❌ Vous avez déjà voté.', ephemeral: true });
                } else {
                    // add user to voters
                    voters.push(interaction.user.id);

                    // if user voted yes
                    if(interaction.values[0] == 'oui') {
                        // add 1 to yes
                        yes++;
                    } else if(interaction.values[0] == 'non') {
                        // add 1 to no
                        no++;
                    }

                    // if all members voted
                    if(yes + no == clan.members.length) {
                        // stop collector
                        collector.stop();
                    }

                    // send embed
                    await interaction.reply({ content: '> ✅ Votre vote a été pris en compte.', ephemeral: true });
                }
            });

            // on end
            collector.on('end', async (collected, reason) => {
                // if reason is time
                if(reason == 'time') {
                    // send embed
                    await interaction.editReply({ content: '> ❌ Le temps est écoulé.', components: [] });
                } else {
                    // if yes > no
                    if(yes > no) {
                        // delete clan
                        await interaction.client.clansdb.deleteOne({ name: clan.name });

                        // send embed
                        await interaction.editReply({ content: `> ✅ Le clan **${clan.name}** a été supprimé avec succès !`, components: [] });
                    } else {
                        // send embed
                        await interaction.editReply({ content: '> ❌ Le vote n\'a pas été accepté.', components: [] });
                    }
                }
            });
        } else return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
    }
}