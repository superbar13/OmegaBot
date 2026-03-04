// rank command module to be used in index.js (but it's for guilds)
const { EmbedBuilder, ButtonStyle } = require('discord.js');
const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder } = require('@discordjs/builders');

// function to get a random value between min and max
function getRandomValue(pixeltype, client, category, itemName, jobName) {
    const modified = pixeltype?.modifiedRessources?.[category]?.[itemName];
    const defaultValues = client.RPG.resources[category][itemName];

    const min = modified ? modified.min : defaultValues.min;
    let max = modified ? modified.max : defaultValues.max;

    // Métiers : Si le joueur a le métier correspondant, il gagne potentiellement plus de ressources
    if (jobName) {
        jobName = jobName.toLowerCase();
        if (category === 'mining' && jobName.includes('mineur')) max = Math.floor(max * 1.5);
        if (category === 'woodcutting' && jobName.includes('bûcheron')) max = Math.floor(max * 1.5);
        if (category === 'farming' && jobName.includes('agriculteur')) max = Math.floor(max * 1.5);
        if (category === 'fishing' && jobName.includes('pêcheur')) max = Math.floor(max * 1.5);
        if (category === 'hunting' && jobName.includes('chasseur')) max = Math.floor(max * 1.5);
    }

    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Effectue des actions sur le RPG')
        .setContexts(0).setIntegrationTypes(0)
        .addSubcommand(subcommand => subcommand
            .setName('me')
            .setDescription('Affiche les informations sur votre personnage')
        )
        .addSubcommand(subcommand => subcommand
            .setName('user').setDescription('Affiche les informations sur un personnage')
            .addUserOption(option => option.setName('utilisateur').setDescription('Utilisateur dont vous voulez voir les informations sur le personnage'))
        )
        .addSubcommand(subcommand => subcommand
            .setName('inventory')
            .setDescription('Affiche votre inventaire')
            .addNumberOption(option => option.setName('page').setDescription('Page de l\'inventaire'))
        )
        .addSubcommand(subcommand => subcommand
            .setName('ressources')
            .setDescription('Affiche vos ressources')
        )
        .addSubcommand(subcommand => subcommand
            .setName('job')
            .setDescription('Affiche votre métier')
            .addStringOption(option => option.setName('métier').setDescription('Nom du métier'))
        )
        .addSubcommand(subcommand => subcommand
            .setName('work')
            .setDescription('Travaille')
        )
        .addSubcommand(subcommand => subcommand
            .setName('daily')
            .setDescription('Travaille très dur')
        )
        .addSubcommand(subcommand => subcommand
            .setName('farm')
            .setDescription('Fait de l\'agriculture')
        )
        .addSubcommand(subcommand => subcommand
            .setName('fish')
            .setDescription('Pêche')
        )
        .addSubcommand(subcommand => subcommand
            .setName('hunt')
            .setDescription('Chasse')
        )
        .addSubcommand(subcommand => subcommand
            .setName('mine')
            .setDescription('Mine')
        )
        .addSubcommand(subcommand => subcommand
            .setName('woodcut')
            .setDescription('Coupe du bois')
        )
        .addSubcommand(subcommand => subcommand
            .setName('consume')
            .setDescription('Consomme une ressource alimentaire (fishing, hunting, farming)')
            .addStringOption(option => option.setName('ressource').setDescription('Nom de la ressource en anglais (ex: apple, salmon)').setRequired(true))
            .addIntegerOption(option => option.setName('quantité').setDescription('Quantité à manger (1 par défaut)').setRequired(false))
        ),
    category: 'rpg',
    telegram: 'disabled',
    async execute(interaction) {
        if (!interaction?.client?.RPG) return interaction.reply({ content: '> ❌ Le module est en cours de chargement.' });
        if (!interaction?.client?.config?.modules['rpg']?.enabled) return interaction.reply({ content: '> ❌ Le module est désactivé.' });

        // client
        const client = interaction.client;

        // defer reply
        await interaction.deferReply();

        // get subcommand
        const subcommand = interaction.options.getSubcommand();

        // if subcommand is show
        if (subcommand == 'me' || subcommand == 'user') {
            // get user in the database (selected user or interaction user)
            const user = await interaction.client.usersdb
                .findOne({ id: interaction.options.getUser('utilisateur')?.id || interaction.user.id })
                .populate('rpg.equipment.helmet')
                .populate('rpg.equipment.chestplate')
                .populate('rpg.equipment.leggings')
                .populate('rpg.equipment.boots')
                .populate('rpg.equipment.hand')
                .populate('rpg.equipment.otherhand');

            // populate manuellement du rpg.business.job
            if (user.rpg.business.job) {
                user.rpg.business.job = await interaction.client.jobsdb.findOne({ _id: user.rpg.business.job });
                // si y'a pas on prend le job avec le moins de money gagné et 0 d'xpNeeded
                if (!user.rpg.business.job) user.rpg.business.job = await interaction.client.jobsdb.findOne({ xpNeeded: 0 }).sort({ 'money.min': 1 });
                // si toujours pas on met qu'il en a pas
                if (!user.rpg.business.job) user.rpg.business.job = { name: 'Aucun métier', description: 'Vous n\'avez pas de métier', money: { min: 0, max: 0 }, ultramoney: { min: 0, max: 0 }, xp: { min: 0, max: 0 }, xpNeeded: 0 };
            } else {
                // si y'a pas on prend le job avec le moins de money gagné et 0 d'xpNeeded
                user.rpg.business.job = await interaction.client.jobsdb.findOne({ xpNeeded: 0 }).sort({ 'money.min': 1 });
                // si toujours pas on met qu'il en a pas
                if (!user.rpg.business.job) user.rpg.business.job = { name: 'Aucun métier', description: 'Vous n\'avez pas de métier', money: { min: 0, max: 0 }, ultramoney: { min: 0, max: 0 }, xp: { min: 0, max: 0 }, xpNeeded: 0 };
            }

            if (!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.' });

            // create embed
            const embed = new EmbedBuilder()
                .setTitle('🎭 RPG de ' + interaction.user.username + ' 🎭')
                .setDescription('Voici les informations sur votre personnage')
                // money ultramoney, position: x z, xp business: job and xp, health, food, water, slots, clan, equipment: helmet, chestplate, leggings, boots, hand, otherhand
                .addFields(
                    { name: '💸 Monnaie', value: user.rpg.money.toString(), inline: true },
                    { name: '💠 Ultra Monnaie', value: user.rpg.ultramoney.toString(), inline: true },
                    { name: '🌐 Position', value: `X:${user.rpg.position.x} Z:${user.rpg.position.z}`, inline: true },
                    { name: '📈 XP Business', value: `${user.rpg.business.job.name}: ${user.rpg.business.xp}XP`, inline: true },
                    { name: '❤ Santé', value: `${user.rpg.health}HP`, inline: true },
                    { name: '🍗 Nourriture', value: `${user.rpg.food}FP`, inline: true },
                    { name: '💧 Eau', value: `${user.rpg.water}WP`, inline: true },
                    { name: '🎒 Slots', value: `${user.rpg.slots} slots`, inline: true }
                )

            // if user has a clan
            // check in clansdb if user is in a members array
            const clan = await interaction.client.clansdb.findOne({ members: user.id });

            // if user has a clan
            if (clan) embed.addFields({ name: '👥 Clan', value: clan.name, inline: true })

            embed.addFields({
                name: '🎽 Équipement',
                value:
                    `${user.rpg.equipment.helmet ? user.rpg.equipment.helmet.name : 'Aucun'} | `
                    + `${user.rpg.equipment.chestplate ? user.rpg.equipment.chestplate.name : 'Aucun'} | `
                    + `${user.rpg.equipment.leggings ? user.rpg.equipment.leggings.name : 'Aucun'} | `
                    + `${user.rpg.equipment.boots ? user.rpg.equipment.boots.name : 'Aucun'} | `
                    + `${user.rpg.equipment.hand ? user.rpg.equipment.hand.name : 'Aucun'} | `
                    + `${user.rpg.equipment.otherhand ? user.rpg.equipment.otherhand.name : 'Aucun'}`,
                inline: false
            })

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand == 'inventory') {
            // get user in the database (selected user or interaction user)
            const user = await interaction.client.usersdb
                .findOne({ id: interaction.user.id })
                .populate('rpg.inventory.id');
            if (!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.' });

            // create embed with inventory
            const embed = new EmbedBuilder()
                .setTitle('Inventaire de ' + interaction.user.username)
                .setDescription('Voici les informations sur votre inventaire');

            // user.rpg.inventory is an array of objects like : { id: ObjectID, quantity: Number }
            let inventory = user.rpg.inventory;
            // sort by quantity more is first
            inventory.sort((a, b) => b.quantity - a.quantity);

            // get the page
            let page = interaction.options.getInteger('page') || 1;
            // 25 users per page
            let perpage = 10;

            function createList() {
                return (inventory.map((item, index) => {
                    return `${item.quantity}x ${item.id.name}`;
                }).slice((page - 1) * perpage, page * perpage).join('\n')) || 'Aucun';
            }

            if (inventory.length == 0) return interaction.editReply({ content: '> ❌ Votre inventaire est vide.' });

            embed
                .setDescription(createList())
                .setFooter({ text: `Page ${page} / ${Math.ceil(inventory.length / perpage)}` })
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setTimestamp()
                .setImage('https://cdn.discordapp.com/attachments/909475569459163186/1077679404240613396/bluebar.gif')
            try {
                let components = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('top_previous')
                            .setLabel('Précédent')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 1),
                        new ButtonBuilder()
                            .setCustomId('top_next')
                            .setLabel('Suivant')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === Math.ceil(inventory.length / perpage))
                    )
                await interaction.editReply({ embeds: [embed], components: [components] });

                const filter = i => i.customId === 'top_previous' || i.customId === 'top_next';
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async i => {
                    if (i.customId === 'top_previous') {
                        // change page
                        page = page - 1;
                        components = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('top_previous')
                                    .setLabel('Précédent')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(page === 1),
                                new ButtonBuilder()
                                    .setCustomId('top_next')
                                    .setLabel('Suivant')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(page === Math.ceil(inventory.length / perpage))
                            )
                        embed
                            .setDescription(createList())
                            .setFooter({ text: `Page ${page} / ${Math.ceil(inventory.length / perpage)}` })
                        await i.update({ embeds: [embed], components: [components] });
                    } else if (i.customId === 'top_next') {
                        // change page
                        page = page + 1;
                        components = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('top_previous')
                                    .setLabel('Précédent')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(page === 1),
                                new ButtonBuilder()
                                    .setCustomId('top_next')
                                    .setLabel('Suivant')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(page === Math.ceil(inventory.length / perpage))
                            )
                        embed
                            .setDescription(createList())
                            .setFooter({ text: `Page ${page} / ${Math.ceil(inventory.length / perpage)}` })
                        await i.update({ embeds: [embed], components: [components] });
                    }
                });

                collector.on('end', async collected => {
                    components = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('top_previous')
                                .setLabel('Précédent')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('top_next')
                                .setLabel('Suivant')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true)
                        )
                    await interaction.editReply({ embeds: [embed], components: [components] });
                });

            } catch (err) {
                await interaction.editReply('> ❌ Une erreur est survenue');
                console.log(err);
            }
        } else {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if (!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.' });

            if (subcommand == 'ressources') {
                // create embed with ressources :
                const embed = new EmbedBuilder()
                    .setTitle('🎭 RPG de ' + interaction.user.username + ' 🎭')
                    .setDescription('Voici les informations sur vos ressources')
                    .addFields(
                        { name: '⛏ Minage', value: Object.entries(user.rpg.ressources.mining).map(([key, value]) => `${client.RPG.resources.mining[key].emoji} ${client.RPG.resources.mining[key].name} : ${value}`).join('\n'), inline: true },
                        { name: '🪓 Bûcheronnage', value: Object.entries(user.rpg.ressources.woodcutting).map(([key, value]) => `${client.RPG.resources.woodcutting[key].emoji} ${client.RPG.resources.woodcutting[key].name} : ${value}`).join('\n'), inline: true },
                        { name: '🌾 Agriculture', value: Object.entries(user.rpg.ressources.farming).map(([key, value]) => `${client.RPG.resources.farming[key].emoji} ${client.RPG.resources.farming[key].name} : ${value}`).join('\n'), inline: true },
                        { name: '🎣 Pêche', value: Object.entries(user.rpg.ressources.fishing).map(([key, value]) => `${client.RPG.resources.fishing[key].emoji} ${client.RPG.resources.fishing[key].name} : ${value}`).join('\n'), inline: true },
                        { name: '🏹 Chasse', value: Object.entries(user.rpg.ressources.hunting).map(([key, value]) => `${client.RPG.resources.hunting[key].emoji} ${client.RPG.resources.hunting[key].name} : ${value}`).join('\n'), inline: true },
                    )

                // send embed
                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand == 'job') {
                // get job in the database (user job if he has one or name of the job)
                let jobQuery = {};
                if (interaction.options.getString('métier')) {
                    jobQuery = { name: interaction.options.getString('métier') };
                } else if (user.rpg.business.job) {
                    jobQuery = { _id: user.rpg.business.job };
                }
                const job = await interaction.client.jobsdb.findOne(jobQuery);
                if (!job) return interaction.editReply({ content: '> ❌ Une erreur est survenue (métier introuvable).' });

                // create embed with job
                const embed = new EmbedBuilder()
                    .setTitle('🎭 RPG de ' + interaction.user.username + ' 🎭')
                    .setDescription('Voici les informations sur votre métier')

                // xp if it is user job
                if (!interaction.options.getString('métier')) embed.addFields({ name: '📈 XP', value: user.rpg.business.xp.toString(), inline: true });

                // add fields
                // description, tranche de gain money, tranche de gain ultramoney, tranche de gain xp
                // xp nécessaire pour l'obtenir
                embed.addFields(
                    { name: '📜 ' + job.name.toString(), value: job.description.toString(), inline: true },
                    { name: '💸 Gain money', value: `${job.money.min} - ${job.money.max}`, inline: true },
                    { name: '💠 Gain ultramoney', value: `${job.ultramoney.min} - ${job.ultramoney.max}`, inline: true },
                    { name: '📈 Gain XP', value: `${job.xp.min} - ${job.xp.max}`, inline: true },
                    { name: '📈 XP nécessaire', value: job.xpNeeded.toString(), inline: true },
                )

                // send embed
                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand == 'work' || subcommand == 'daily') {
                // get job in the database (user job if he has one)
                if (!user.rpg.business.job) return interaction.editReply({ content: '> ❌ Vous n\'avez pas de métier.' });
                if (user.rpg.health <= 0) return interaction.editReply({ content: '> 💀 Vous êtes mort ! Vous devez vous soigner avant de pouvoir travailler.' });
                const job = await interaction.client.jobsdb.findOne({ _id: user.rpg.business.job });
                if (!job) return interaction.editReply({ content: '> ❌ Une erreur est survenue (métier introuvable).' });

                // get random number between min and max
                const money = Math.floor(Math.random() * (job.money.max - job.money.min + 1) + job.money.min);
                const ultramoney = Math.floor(Math.random() * (job.ultramoney.max - job.ultramoney.min + 1) + job.ultramoney.min);
                const xp = Math.floor(Math.random() * (job.xp.max - job.xp.min + 1) + job.xp.min);

                // update user
                user.rpg.money += (subcommand == 'daily') ? money * 10 : money;
                user.rpg.ultramoney += (subcommand == 'daily') ? ultramoney * 10 : ultramoney;
                user.rpg.business.xp += (subcommand == 'daily') ? xp * 10 : xp;

                let foodCost = (subcommand == 'daily') ? 40 : 10;
                let waterCost = (subcommand == 'daily') ? 40 : 10;
                let healthLost = 0;

                user.rpg.food -= foodCost;
                user.rpg.water -= waterCost;
                if (user.rpg.food < 0) { healthLost += Math.abs(user.rpg.food); user.rpg.food = 0; }
                if (user.rpg.water < 0) { healthLost += Math.abs(user.rpg.water); user.rpg.water = 0; }
                if (healthLost > 0) { user.rpg.health -= healthLost; if (user.rpg.health < 0) user.rpg.health = 0; }

                // update user in the database
                try {
                    await interaction.client.usersdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': interaction.user.id
                        }, {
                            'rpg.money': user.rpg.money,
                            'rpg.ultramoney': user.rpg.ultramoney,
                            'rpg.business.xp': user.rpg.business.xp,
                            'rpg.food': user.rpg.food,
                            'rpg.water': user.rpg.water,
                            'rpg.health': user.rpg.health
                        })
                    ])
                } catch (err) {
                    return interaction.editReply({ content: '> ❌ Une erreur est survenue.' });
                }

                // create embed with work
                const embed = new EmbedBuilder()
                    .setTitle('🎭 RPG de ' + interaction.user.username + ' 🎭')
                    .setDescription(healthLost > 0 ? `Vous avez travaillé !\n⚠️ Vous étiez affamé ou assoiffé et avez perdu **${healthLost} HP** !` : 'Vous avez travaillé !')
                    .addFields(
                        { name: '💸 Money', value: money.toString(), inline: true },
                        { name: '💠 Ultra Money', value: ultramoney.toString(), inline: true },
                        { name: '📈 XP', value: xp.toString(), inline: true },
                        { name: '❤ Santé', value: user.rpg.health.toString() + ' HP', inline: true },
                        { name: '🍗 Nourriture', value: user.rpg.food.toString() + ' FP', inline: true },
                        { name: '💧 Eau', value: user.rpg.water.toString() + ' WP', inline: true }
                    )

                // send embed
                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand == 'consume') {
                const ressourceName = interaction.options.getString('ressource').toLowerCase();
                const quantity = interaction.options.getInteger('quantité') || 1;

                if (quantity <= 0) return interaction.editReply({ content: '> ❌ La quantité doit être supérieure à 0.' });

                let foundCategory = null;
                let ressourceData = null;

                for (const category in client.RPG.resources) {
                    if (client.RPG.resources[category] && client.RPG.resources[category][ressourceName]) {
                        foundCategory = category;
                        ressourceData = client.RPG.resources[category][ressourceName];
                        break;
                    }
                }

                if (!foundCategory) return interaction.editReply({ content: '> ❌ Ressource introuvable. Utilisez un nom système valide (ex: apple, potato, salmon...).' });

                if (!user.rpg.ressources[foundCategory] || user.rpg.ressources[foundCategory][ressourceName] < quantity) {
                    return interaction.editReply({ content: `> ❌ Vous n'avez pas assez de **${ressourceData.name}** (Vous en possédez ${user.rpg.ressources[foundCategory]?.[ressourceName] || 0}).` });
                }

                if (['mining', 'woodcutting'].includes(foundCategory)) {
                    // Troll effect : gastro
                    let foodLoss = 10 * quantity;
                    let waterLoss = 10 * quantity;
                    let healthLoss = 5 * quantity;

                    user.rpg.ressources[foundCategory][ressourceName] -= quantity;
                    user.rpg.food -= foodLoss;
                    user.rpg.water -= waterLoss;
                    user.rpg.health -= healthLoss;

                    if (user.rpg.food < 0) {
                        user.rpg.health += user.rpg.food; // decrease health further for negative food
                        user.rpg.food = 0;
                    }
                    if (user.rpg.water < 0) {
                        user.rpg.health += user.rpg.water; // decrease health further for negative water
                        user.rpg.water = 0;
                    }
                    if (user.rpg.health < 0) user.rpg.health = 0;

                    try {
                        await interaction.client.usersdb.bulkWrite([
                            client.bulkutility.setField({
                                'id': interaction.user.id
                            }, {
                                [`rpg.ressources.${foundCategory}`]: user.rpg.ressources[foundCategory],
                                'rpg.food': user.rpg.food,
                                'rpg.water': user.rpg.water,
                                'rpg.health': user.rpg.health
                            })
                        ]);
                    } catch (e) {
                        return interaction.editReply({ content: '> ❌ Erreur lors de la sauvegarde.' });
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('🤢 Intoxication Alimentaire !')
                        .setDescription(`Vous avez tenté de manger **${quantity}x ${ressourceData.name} ${ressourceData.emoji}** !\nÇa vous a donné une gastro terrible. Vous perdez la ressource, de la faim, de la soif, et de la vie !`)
                        .addFields(
                            { name: '❤ Santé', value: user.rpg.health.toString() + ' HP', inline: true },
                            { name: '🍗 Nourriture', value: user.rpg.food.toString() + ' FP', inline: true },
                            { name: '💧 Eau', value: user.rpg.water.toString() + ' WP', inline: true }
                        )
                        .setColor('#ff0000');

                    return interaction.editReply({ embeds: [embed] });
                }

                let foodGain = 10 * quantity;
                let waterGain = 5 * quantity;
                let healthGain = 5 * quantity;

                if (user.rpg.health < 100 || user.rpg.food < 100 || user.rpg.water < 100) {
                    user.rpg.ressources[foundCategory][ressourceName] -= quantity;
                    user.rpg.food += foodGain;
                    user.rpg.water += waterGain;
                    user.rpg.health += healthGain;

                    if (user.rpg.food > 100) user.rpg.food = 100;
                    if (user.rpg.water > 100) user.rpg.water = 100;
                    if (user.rpg.health > 100) user.rpg.health = 100;

                    try {
                        await interaction.client.usersdb.bulkWrite([
                            client.bulkutility.setField({
                                'id': interaction.user.id
                            }, {
                                [`rpg.ressources.${foundCategory}`]: user.rpg.ressources[foundCategory],
                                'rpg.food': user.rpg.food,
                                'rpg.water': user.rpg.water,
                                'rpg.health': user.rpg.health
                            })
                        ]);
                    } catch (e) {
                        return interaction.editReply({ content: '> ❌ Erreur lors de la sauvegarde.' });
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('🍽️ Consommation')
                        .setDescription(`Vous avez consommé **${quantity}x ${ressourceData.name} ${ressourceData.emoji}** !`)
                        .addFields(
                            { name: '❤ Santé', value: user.rpg.health.toString() + ' HP', inline: true },
                            { name: '🍗 Nourriture', value: user.rpg.food.toString() + ' FP', inline: true },
                            { name: '💧 Eau', value: user.rpg.water.toString() + ' WP', inline: true }
                        )
                        .setColor(interaction.client.modules.randomcolor.getRandomColor());

                    return interaction.editReply({ embeds: [embed] });
                } else {
                    return interaction.editReply({ content: '> ❌ Vous n\'avez pas faim ni soif, et votre santé est au maximum.' });
                }
            } else {
                const playerpos = await interaction.client.RPG.getPlayerPosition(interaction.user.id);
                if (!playerpos) return interaction.editReply({ content: '> ❌ Vous n\'êtes pas dans le RPG.' });
                const pixeltype = await interaction.client.RPG.getPixelType(playerpos.pixel.type);
                if (!pixeltype) return interaction.editReply({ content: '> ❌ Une erreur est survenue.' });

                if (user.rpg.health <= 0) return interaction.editReply({ content: '> 💀 Vous êtes mort ! Vous devez vous soigner avant de pouvoir travailler.' });

                const embed = new EmbedBuilder()
                    .setDescription('Vous avez travaillé !');

                let category;
                if (subcommand == "farm") {
                    category = "farming";
                    // create embed with work
                    embed.setTitle('🌾 Récolte faite par ' + interaction.user.username + ' 🌾')
                    // check if disabledRessources contains farming
                    if (pixeltype.disabledRessources?.includes(category)) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir faire de l\'agriculture ici ?' });
                } else if (subcommand == "fish") {
                    category = "fishing";
                    // create embed with work
                    embed.setTitle('🎣 Pêche faite par ' + interaction.user.username + ' 🎣')
                    // check if disabledRessources contains fishing
                    if (pixeltype.disabledRessources?.includes(category)) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir pêcher ici ?' });
                } else if (subcommand == "hunt") {
                    category = "hunting";
                    // create embed with work
                    embed.setTitle('🏹 Chasse faite par ' + interaction.user.username + ' 🏹')
                    // check if disabledRessources contains hunting
                    if (pixeltype.disabledRessources?.includes(category)) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir chasser ici ?' });
                } else if (subcommand == "mine") {
                    category = "mining";
                    // create embed with work
                    embed.setTitle('⛏ Minage fait par ' + interaction.user.username + ' ⛏')
                    // check if disabledRessources contains mining
                    if (pixeltype.disabledRessources?.includes(category)) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir miner ici ?' });
                } else if (subcommand == "woodcut") {
                    category = "woodcutting";
                    // create embed with work
                    embed.setTitle('🪓 Bûcheronnage fait par ' + interaction.user.username + ' 🪓')
                    // check if disabledRessources contains woodcutting
                    if (pixeltype.disabledRessources?.includes(category)) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir couper du bois ici ?' });
                } else return interaction.editReply({ content: '> ❌ Commande inconnue.' });

                // Generate data for each farming resource
                const data = {};
                let userJobName = user.rpg.business.job ? user.rpg.business.job.name : '';

                Object.keys(client.RPG.resources[category]).forEach(itemName => {
                    data[itemName] = getRandomValue(pixeltype, client, category, itemName, userJobName);
                });

                // Update user's resource counts
                Object.keys(data).forEach(itemName => {
                    user.rpg.ressources[category][itemName] += data[itemName];
                });

                let foodCost = Math.round(15 * (pixeltype.foodMultiplier || 1));
                let waterCost = Math.round(15 * (pixeltype.waterMultiplier || 1));
                let healthLost = 0;
                let accidentMessage = null;
                let isAffinityJob = false;

                // Riduction du cout d'energie selon le métier
                if (userJobName) {
                    let jName = userJobName.toLowerCase();
                    if (category === 'mining' && jName.includes('mineur')) { isAffinityJob = true; }
                    if (category === 'woodcutting' && jName.includes('bûcheron')) { isAffinityJob = true; }
                    if (category === 'farming' && jName.includes('agriculteur')) { isAffinityJob = true; }
                    if (category === 'fishing' && jName.includes('pêcheur')) { isAffinityJob = true; }
                    if (category === 'hunting' && jName.includes('chasseur')) { isAffinityJob = true; }

                    if (isAffinityJob) {
                        foodCost = Math.floor(foodCost * 0.6);
                        waterCost = Math.floor(waterCost * 0.6);
                    }
                }

                if (!isAffinityJob && Math.random() < 0.15) { // 15% de chance d'accident
                    const accidentDamage = Math.floor(Math.random() * 10) + 5; // 5 à 15 dégâts
                    healthLost += accidentDamage;

                    const accidentMessages = {
                        mining: [
                            "Un rocher s'est détaché et vous est tombé sur l'orteil",
                            "Vous avez confondu votre pioche avec votre main",
                            "Un coup de grisou inattendu a grillé vos sourcils"
                        ],
                        woodcutting: [
                            "L'arbre est tombé dans le mauvais sens... sur vous",
                            "Vous avez marché sur la hache. Pas futé",
                            "Une écharde de la taille d'une lance s'est plantée dans votre main"
                        ],
                        farming: [
                            "Une patate mutante vous a mordu la main",
                            "Vous avez trébuché sur votre propre râteau, classique",
                            "Un épouvantail agressif vous a mis une claque"
                        ],
                        fishing: [
                            "Un crabe est monté sur votre botte pour vous pincer le mollet",
                            "L'hameçon s'est accroché à votre narine",
                            "Une carpe vous a giflé avec sa nageoire"
                        ],
                        hunting: [
                            "Le lapin a gagné le duel à mains nues",
                            "Vous vous êtes coincé le pied dans votre propre piège",
                            "Un cochon sauvage vous a chargé par derrière"
                        ]
                    };

                    const categoryMessages = accidentMessages[category] || ["Vous vous êtes blessé par maladresse"];
                    accidentMessage = categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
                }

                user.rpg.food -= foodCost;
                user.rpg.water -= waterCost;
                if (user.rpg.food < 0) { healthLost += Math.abs(user.rpg.food); user.rpg.food = 0; }
                if (user.rpg.water < 0) { healthLost += Math.abs(user.rpg.water); user.rpg.water = 0; }
                if (healthLost > 0) { user.rpg.health -= healthLost; if (user.rpg.health < 0) user.rpg.health = 0; }

                // update user in the database
                try {
                    // Bulk write updated user data to the database
                    await interaction.client.usersdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': interaction.user.id
                        }, {
                            [`rpg.ressources.${category}`]: user.rpg.ressources[category],
                            'rpg.food': user.rpg.food,
                            'rpg.water': user.rpg.water,
                            'rpg.health': user.rpg.health
                        })
                    ]);
                } catch (err) {
                    console.error('Error updating user in database:', err);
                    return interaction.editReply({ content: '> ❌ Une erreur est survenue lors de la mise à jour des données utilisateur.' });
                }

                if (accidentMessage) {
                    embed.setDescription(`Vous avez travaillé !\n💥 **Aïe !** ${accidentMessage} et vous avez perdu **${healthLost} HP** !`);
                } else if (healthLost > 0) {
                    embed.setDescription(`Vous avez travaillé !\n⚠️ Vous étiez affamé ou assoiffé et avez perdu **${healthLost} HP** !`);
                }

                embed.addFields(
                    // from obj data get name and emoji
                    Object.entries(data).map(([key, value]) => ({
                        name: client.RPG.resources[category][key].emoji + ' ' + client.RPG.resources[category][key].name,
                        value: value.toString(),
                        inline: true
                    }))
                );

                embed.addFields(
                    { name: '❤ Santé', value: user.rpg.health.toString() + ' HP', inline: true },
                    { name: '🍗 Nourriture', value: user.rpg.food.toString() + ' FP', inline: true },
                    { name: '💧 Eau', value: user.rpg.water.toString() + ' WP', inline: true }
                );

                // send embed
                await interaction.editReply({ embeds: [embed] });
            }
        }
    }
}