// rank command module to be used in index.js (but it's for guilds)
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Effectue des actions sur le RPG')
        .setDMPermission(false)
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
            
        // if subcommand is show
        if(subcommand == 'me' || subcommand == 'user') {
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
            if(user.rpg.business.job) {
                user.rpg.business.job = await interaction.client.jobsdb.findOne({ _id: user.rpg.business.job });
                // si y'a pas on prend le job avec le moins de money gagné et 0 d'xpNeeded
                if(!user.rpg.business.job) user.rpg.business.job = await interaction.client.jobsdb.findOne({ xpNeeded: 0 }).sort({ 'money.min': 1 });
                // si toujours pas on met qu'il en a pas
                if(!user.rpg.business.job) user.rpg.business.job = { name: 'Aucun métier', description: 'Vous n\'avez pas de métier', money: { min: 0, max: 0 }, ultramoney: { min: 0, max: 0 }, xp: { min: 0, max: 0 }, xpNeeded: 0 };
            } else {
                // si y'a pas on prend le job avec le moins de money gagné et 0 d'xpNeeded
                user.rpg.business.job = await interaction.client.jobsdb.findOne({ xpNeeded: 0 }).sort({ 'money.min': 1 });
                // si toujours pas on met qu'il en a pas
                if(!user.rpg.business.job) user.rpg.business.job = { name: 'Aucun métier', description: 'Vous n\'avez pas de métier', money: { min: 0, max: 0 }, ultramoney: { min: 0, max: 0 }, xp: { min: 0, max: 0 }, xpNeeded: 0 };
            }
            
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

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
                { name: '🍗 Nourriture', value:`${user.rpg.food}FP`, inline: true },
                { name: '💧 Eau', value: `${user.rpg.water}WP`, inline: true },
                { name: '🎒 Slots', value: `${user.rpg.slots} slots`, inline: true }
            )

            // if user has a clan
            // check in clansdb if user is in a members array
            const clan = await interaction.client.clansdb.findOne({ members: user.id });

            // if user has a clan
            if(clan) {
                // add clan field
                embed.addFields(
                    { name: '👥 Clan', value: clan.name, inline: true }
                )
            }

            embed.addFields(
                { name: '🎽 Équipement', value: `${user.rpg.equipment.helmet ? user.rpg.equipment.helmet.name : 'Aucun'} | ${user.rpg.equipment.chestplate ? user.rpg.equipment.chestplate.name : 'Aucun'} | ${user.rpg.equipment.leggings ? user.rpg.equipment.leggings.name : 'Aucun'} | ${user.rpg.equipment.boots ? user.rpg.equipment.boots.name : 'Aucun'} | ${user.rpg.equipment.hand ? user.rpg.equipment.hand.name : 'Aucun'} | ${user.rpg.equipment.otherhand ? user.rpg.equipment.otherhand.name : 'Aucun'}`, inline: false }
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == 'inventory') {
            // get user in the database (selected user or interaction user)
            const user = await interaction.client.usersdb
                .findOne({ id: interaction.options.getUser('utilisateur')?.id || interaction.user.id })
                .populate('rpg.inventory.id');
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // create embed with inventory
            const embed = new EmbedBuilder()
            .setTitle('Inventaire de ' + interaction.user.username)
            .setDescription('Voici les informations sur votre inventaire');

            // user.rpg.inventory is an array of objects like : { id: ObjectID, quantity: Number }
            let Inventory = user.rpg.inventory;
            // sort by quantity more is first
            Inventory.sort((a, b) => b.quantity - a.quantity);

            // get the page
            let page = interaction.options.getInteger('page') || 1;
            // 25 users per page
            let perpage = 10;

            function createList() {
                return Inventory.map((item, index) => {
                    return `${item.quantity} - ${item.id.name} - ${item.quantity}`;
                }).slice((page - 1) * perpage, page * perpage).join('\n')
            }

            embed
                .setDescription(createList())
                .setFooter({ text: `Page ${page} / ${Math.ceil(Inventory.length / perpage)}` })
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setTimestamp()
                .setImage('https://cdn.discordapp.com/attachments/909475569459163186/1077679404240613396/bluebar.gif')
            try{
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
                    .setDisabled(page === Math.ceil(Inventory.length / perpage))
                )
                await interaction.editReply({ embeds: [embed], components: [components] });

                const filter = i => i.customId === 'top_previous' || i.customId === 'top_next'; 
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async i => {
                    if(i.customId === 'top_previous'){
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
                            .setDisabled(page === Math.ceil(Inventory.length / perpage))
                        )
                        embed
                        .setDescription(createList())
                        .setFooter({ text: `Page ${page} / ${Math.ceil(Inventory.length / perpage)}` })
                        await i.update({ embeds: [embed], components: [components] });
                    }else if(i.customId === 'top_next'){
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
                            .setDisabled(page === Math.ceil(Inventory.length / perpage))
                        )
                        embed
                        .setDescription(createList())
                        .setFooter({ text: `Page ${page} / ${Math.ceil(Inventory.length / perpage)}` })
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

            }catch(err){
                await interaction.reply('> ❌ Une erreur est survenue');
                console.log(err);
            }
        } else if(subcommand == 'ressources') {
            // get user in the database (selected user or interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.options.getUser('utilisateur')?.id || interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // create embed with ressources :
            // mining: coal, iron, gold, diamond, emerald, ruby, sapphire, amethyst, uranium
            // woodcutting: oak, spruce, birch, jungle, acacia, darkoak, fir, pine
            // farming: wheat, potato, carrot, strawberry, tomato, radish, apple, orange, pear, banana
            // fishing: salmon, sea_beam
            // hunting: rabbit, chicken, cow, pig, sheep, beef
            const embed = new EmbedBuilder()
            .setTitle('🎭 RPG de ' + interaction.user.username + ' 🎭')
            .setDescription('Voici les informations sur vos ressources')
            .addFields(
                { name: '⛏ Minage', value: `Charbon: ${user.rpg.ressources.mining.coal} | Fer: ${user.rpg.ressources.mining.iron} | Or: ${user.rpg.ressources.mining.gold} | Diamant: ${user.rpg.ressources.mining.diamond} | Émeraude: ${user.rpg.ressources.mining.emerald} | Rubis: ${user.rpg.ressources.mining.ruby} | Saphir: ${user.rpg.ressources.mining.sapphire} | Améthyste: ${user.rpg.ressources.mining.amethyst} | Uranium: ${user.rpg.ressources.mining.uranium}`, inline: true },
                { name: '🪓 Bûcheronnage', value: `Chêne: ${user.rpg.ressources.woodcutting.oak} | Sapin: ${user.rpg.ressources.woodcutting.spruce} | Bouleau: ${user.rpg.ressources.woodcutting.birch} | Jungle: ${user.rpg.ressources.woodcutting.jungle} | Acacia: ${user.rpg.ressources.woodcutting.acacia} | Chêne noir: ${user.rpg.ressources.woodcutting.darkoak} | Sapin de Douglas: ${user.rpg.ressources.woodcutting.fir} | Pin: ${user.rpg.ressources.woodcutting.pine}`, inline: true },
                { name: '🌾 Agriculture', value: `Blé: ${user.rpg.ressources.farming.wheat} | Pomme de terre: ${user.rpg.ressources.farming.potato} | Carotte: ${user.rpg.ressources.farming.carrot} | Fraise: ${user.rpg.ressources.farming.strawberry} | Tomate: ${user.rpg.ressources.farming.tomato} | Radis: ${user.rpg.ressources.farming.radish} | Pomme: ${user.rpg.ressources.farming.apple} | Orange: ${user.rpg.ressources.farming.orange} | Poire: ${user.rpg.ressources.farming.pear} | Banane: ${user.rpg.ressources.farming.banana}`, inline: true },
                { name: '🎣 Pêche', value: `Saumon: ${user.rpg.ressources.fishing.salmon} | Raie: ${user.rpg.ressources.fishing.sea_beam}`, inline: true },
                { name: '🏹 Chasse', value: `Lapin: ${user.rpg.ressources.hunting.rabbit} | Poulet: ${user.rpg.ressources.hunting.chicken} | Cochon: ${user.rpg.ressources.hunting.pig} | Mouton: ${user.rpg.ressources.hunting.sheep} | Bœuf: ${user.rpg.ressources.hunting.beef}`, inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == 'job') {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            // get job in the database (user job if he has one or name of the job)
            const job = await interaction.client.jobsdb.findOne({ id: interaction.options.getString('métier') || user.rpg.business.job });
            if(!job) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // create embed with job
            const embed = new EmbedBuilder()
            .setTitle('🎭 RPG de ' + interaction.user.username + ' 🎭')
            .setDescription('Voici les informations sur votre métier')

            // xp if it is user job
            if(interaction.options.getString('métier')) embed.addFields({ name: '📈 XP', value: user.rpg.business.xp.toString(), inline: true});
            
            // add fields
            // description, tranche de gain money, tranche de gain ultramoney, tranche de gain xp
            // xp nécessaire pour l'obtenir
            embed.addFields(
                { name: '📜 Description', value: user.rpg.business.job.description.toString(), inline: true },
                { name: '💸 Gain money', value: `${job.money.min} - ${job.money.max}`, inline: true },
                { name: '💠 Gain ultramoney', value: `${job.ultramoney.min} - ${job.ultramoney.max}`, inline: true },
                { name: '📈 Gain XP', value: `${job.xp.min} - ${job.xp.max}`, inline: true },
                { name: '📈 XP nécessaire', value: job.xpNeeded.toString(), inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == 'work' || subcommand == 'daily') {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get job in the database (user job if he has one)
            const job = await interaction.client.jobsdb.findOne({ id: user.rpg.business.job });
            if(!job) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get random number between min and max
            const money = Math.floor(Math.random() * (job.money.max - job.money.min + 1) + job.money.min);
            const ultramoney = Math.floor(Math.random() * (job.ultramoney.max - job.ultramoney.min + 1) + job.ultramoney.min);
            const xp = Math.floor(Math.random() * (job.xp.max - job.xp.min + 1) + job.xp.min);

            // update user
            user.rpg.money += (subcommand == 'daily') ? money * 10 : money;
            user.rpg.ultramoney += (subcommand == 'daily') ? ultramoney * 10 : ultramoney;
            user.rpg.business.xp += (subcommand == 'daily') ? xp * 10 : xp;
            
            // update user in the database
            try {
                await interaction.client.usersdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': interaction.user.id
                    }, {
                        'rpg.money': user.rpg.money,
                        'rpg.ultramoney': user.rpg.ultramoney,
                        'rpg.business.xp': user.rpg.business.xp
                    })
                ])
            } catch(err) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // create embed with work
            const embed = new EmbedBuilder()
            .setTitle('🎭 RPG de ' + interaction.user.username + ' 🎭')
            .setDescription('Vous avez travaillé !')
            .addFields(
                { name: '💸 Money', value: money.toString(), inline: true },
                { name: '💠 Ultra Money', value: ultramoney.toString(), inline: true },
                { name: '📈 XP', value: xp.toString(), inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == "farm") {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get random number between min and max
            // view on client.RPG.ressouces.farming
            // wheat, potato, carrot, strawberry, tomato, radish, apple, orange, pear, banana
            // .min, .max with a random
            // check with biome where the user is if
            // there is disabledRessources and modifiedRessources in pixeltype
            const playerpos = await interaction.client.RPG.getPlayerPosition(interaction.user.id);
            if(!playerpos) return interaction.editReply({ content: '> ❌ Vous n\'êtes pas dans le RPG.'});
            const pixeltype = await interaction.client.RPG.getPixelType(playerpos.pixel.type);
            if(!pixeltype) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // check if disabledRessources contains farming
            if(pixeltype.disabledRessources?.includes('farming')) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir faire de l\'agriculture ici ?'});

            let data = {
                wheat: pixeltype?.modifiedRessources?.farming?.wheat ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.wheat.max - pixeltype.modifiedRessources.farming.wheat.min + 1) + pixeltype.modifiedRessources.farming.wheat.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.wheat.max - client.RPG.ressources.farming.wheat.min + 1) + client.RPG.ressources.farming.wheat.min),
                potato: pixeltype?.modifiedRessources?.farming?.potato ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.potato.max - pixeltype.modifiedRessources.farming.potato.min + 1) + pixeltype.modifiedRessources.farming.potato.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.potato.max - client.RPG.ressources.farming.potato.min + 1) + client.RPG.ressources.farming.potato.min),
                carrot: pixeltype?.modifiedRessources?.farming?.carrot ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.carrot.max - pixeltype.modifiedRessources.farming.carrot.min + 1) + pixeltype.modifiedRessources.farming.carrot.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.carrot.max - client.RPG.ressources.farming.carrot.min + 1) + client.RPG.ressources.farming.carrot.min),
                strawberry: pixeltype?.modifiedRessources?.farming?.strawberry ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.strawberry.max - pixeltype.modifiedRessources.farming.strawberry.min + 1) + pixeltype.modifiedRessources.farming.strawberry.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.strawberry.max - client.RPG.ressources.farming.strawberry.min + 1) + client.RPG.ressources.farming.strawberry.min),
                tomato: pixeltype?.modifiedRessources?.farming?.tomato ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.tomato.max - pixeltype.modifiedRessources.farming.tomato.min + 1) + pixeltype.modifiedRessources.farming.tomato.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.tomato.max - client.RPG.ressources.farming.tomato.min + 1) + client.RPG.ressources.farming.tomato.min),
                radish: pixeltype?.modifiedRessources?.farming?.radish ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.radish.max - pixeltype.modifiedRessources.farming.radish.min + 1) + pixeltype.modifiedRessources.farming.radish.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.radish.max - client.RPG.ressources.farming.radish.min + 1) + client.RPG.ressources.farming.radish.min),
                apple: pixeltype?.modifiedRessources?.farming?.apple ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.apple.max - pixeltype.modifiedRessources.farming.apple.min + 1) + pixeltype.modifiedRessources.farming.apple.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.apple.max - client.RPG.ressources.farming.apple.min + 1) + client.RPG.ressources.farming.apple.min),
                orange: pixeltype?.modifiedRessources?.farming?.orange ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.orange.max - pixeltype.modifiedRessources.farming.orange.min + 1) + pixeltype.modifiedRessources.farming.orange.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.orange.max - client.RPG.ressources.farming.orange.min + 1) + client.RPG.ressources.farming.orange.min),
                pear: pixeltype?.modifiedRessources?.farming?.pear ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.pear.max - pixeltype.modifiedRessources.farming.pear.min + 1) + pixeltype.modifiedRessources.farming.pear.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.pear.max - client.RPG.ressources.farming.pear.min + 1) + client.RPG.ressources.farming.pear.min),
                banana: pixeltype?.modifiedRessources?.farming?.banana ? Math.floor(Math.random() * (pixeltype.modifiedRessources.farming.banana.max - pixeltype.modifiedRessources.farming.banana.min + 1) + pixeltype.modifiedRessources.farming.banana.min) : Math.floor(Math.random() * (client.RPG.ressources.farming.banana.max - client.RPG.ressources.farming.banana.min + 1) + client.RPG.ressources.farming.banana.min),
            }

            // update user
            user.rpg.ressources.farming.wheat += data.wheat;
            user.rpg.ressources.farming.potato += data.potato;
            user.rpg.ressources.farming.carrot += data.carrot;
            user.rpg.ressources.farming.strawberry += data.strawberry;
            user.rpg.ressources.farming.tomato += data.tomato;
            user.rpg.ressources.farming.radish += data.radish;
            user.rpg.ressources.farming.apple += data.apple;
            user.rpg.ressources.farming.orange += data.orange;
            user.rpg.ressources.farming.pear += data.pear;
            user.rpg.ressources.farming.banana += data.banana;

            // update user in the database
            try {
                await interaction.client.usersdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': interaction.user.id
                    }, {
                        'rpg.ressources.farming.wheat': user.rpg.ressources.farming.wheat,
                        'rpg.ressources.farming.potato': user.rpg.ressources.farming.potato,
                        'rpg.ressources.farming.carrot': user.rpg.ressources.farming.carrot,
                        'rpg.ressources.farming.strawberry': user.rpg.ressources.farming.strawberry,
                        'rpg.ressources.farming.tomato': user.rpg.ressources.farming.tomato,
                        'rpg.ressources.farming.radish': user.rpg.ressources.farming.radish,
                        'rpg.ressources.farming.apple': user.rpg.ressources.farming.apple,
                        'rpg.ressources.farming.orange': user.rpg.ressources.farming.orange,
                        'rpg.ressources.farming.pear': user.rpg.ressources.farming.pear,
                        'rpg.ressources.farming.banana': user.rpg.ressources.farming.banana,
                    })
                ])
            } catch(err) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // create embed with work
            const embed = new EmbedBuilder()
            .setTitle('🌾 Agriculture faite par ' + interaction.user.username + ' 🌾')
            .setDescription('Vous avez travaillé !')
            .addFields(
                { name: '🌾 Blé', value: data.wheat.toString(), inline: true },
                { name: '🥔 Patate', value: data.potato.toString(), inline: true },
                { name: '🥕 Carotte', value: data.carrot.toString(), inline: true },
                { name: '🍓 Fraise', value: data.strawberry.toString(), inline: true },
                { name: '🍅 Tomate', value: data.tomato.toString(), inline: true },
                { name: '🍀 Radis', value: data.radish.toString(), inline: true },
                { name: '🍎 Pomme', value: data.apple.toString(), inline: true },
                { name: '🍊 Orange', value: data.orange.toString(), inline: true },
                { name: '🍐 Poire', value: data.pear.toString(), inline: true },
                { name: '🍌 Banane', value: data.banana.toString(), inline: true }
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == "fish") {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get random number between min and max
            // view on client.RPG.ressouces.fishing
            // salmon, sea_beam
            // .min, .max with a random
            // check with biome where the user is if
            // there is disabledRessources and modifiedRessources in pixeltype
            const playerpos = await interaction.client.RPG.getPlayerPosition(interaction.user.id);
            if(!playerpos) return interaction.editReply({ content: '> ❌ Vous n\'êtes pas dans le RPG.'});
            const pixeltype = await interaction.client.RPG.getPixelType(playerpos.pixel.type);
            if(!pixeltype) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // check if disabledRessources contains fishing
            if(pixeltype.disabledRessources?.includes('fishing')) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir pêcher ici ?'});

            let data = {
                salmon: pixeltype?.modifiedRessources?.fishing?.salmon ? Math.floor(Math.random() * (pixeltype.modifiedRessources.fishing.salmon.max - pixeltype.modifiedRessources.fishing.salmon.min + 1) + pixeltype.modifiedRessources.fishing.salmon.min) : Math.floor(Math.random() * (client.RPG.ressources.fishing.salmon.max - client.RPG.ressources.fishing.salmon.min + 1) + client.RPG.ressources.fishing.salmon.min),
                sea_beam: pixeltype?.modifiedRessources?.fishing?.sea_beam ? Math.floor(Math.random() * (pixeltype.modifiedRessources.fishing.sea_beam.max - pixeltype.modifiedRessources.fishing.sea_beam.min + 1) + pixeltype.modifiedRessources.fishing.sea_beam.min) : Math.floor(Math.random() * (client.RPG.ressources.fishing.sea_beam.max - client.RPG.ressources.fishing.sea_beam.min + 1) + client.RPG.ressources.fishing.sea_beam.min),
            }

            // update user
            user.rpg.ressources.fishing.salmon += data.salmon;
            user.rpg.ressources.fishing.sea_beam += data.sea_beam;

            // update user in the database
            try {
                await interaction.client.usersdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': interaction.user.id
                    }, {
                        'rpg.ressources.fishing.salmon': user.rpg.ressources.fishing.salmon,
                        'rpg.ressources.fishing.sea_beam': user.rpg.ressources.fishing.sea_beam,
                    })
                ])
            } catch(err) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // create embed with work
            const embed = new EmbedBuilder()
            .setTitle('🎣 Pêche faite par ' + interaction.user.username + ' 🎣')
            .setDescription('Vous avez travaillé !')
            .addFields(
                { name: '🐟 Saumon', value: data.salmon.toString(), inline: true },
                { name: '🐡 Raie', value: data.sea_beam.toString(), inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == "hunt") {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get random number between min and max
            // view on client.RPG.ressouces.hunting
            // rabbit, chicken, cow, pig, sheep, beef
            // .min, .max with a random
            // check with biome where the user is if
            // there is disabledRessources and modifiedRessources in pixeltype
            const playerpos = await interaction.client.RPG.getPlayerPosition(interaction.user.id);
            if(!playerpos) return interaction.editReply({ content: '> ❌ Vous n\'êtes pas dans le RPG.'});
            const pixeltype = await interaction.client.RPG.getPixelType(playerpos.pixel.type);
            if(!pixeltype) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // check if disabledRessources contains hunting
            if(pixeltype.disabledRessources?.includes('hunting')) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir chasser ici ?'});

            let data = {
                rabbit: pixeltype?.modifiedRessources?.hunting?.rabbit ? Math.floor(Math.random() * (pixeltype.modifiedRessources.hunting.rabbit.max - pixeltype.modifiedRessources.hunting.rabbit.min + 1) + pixeltype.modifiedRessources.hunting.rabbit.min) : Math.floor(Math.random() * (client.RPG.ressources.hunting.rabbit.max - client.RPG.ressources.hunting.rabbit.min + 1) + client.RPG.ressources.hunting.rabbit.min),
                chicken: pixeltype?.modifiedRessources?.hunting?.chicken ? Math.floor(Math.random() * (pixeltype.modifiedRessources.hunting.chicken.max - pixeltype.modifiedRessources.hunting.chicken.min + 1) + pixeltype.modifiedRessources.hunting.chicken.min) : Math.floor(Math.random() * (client.RPG.ressources.hunting.chicken.max - client.RPG.ressources.hunting.chicken.min + 1) + client.RPG.ressources.hunting.chicken.min),
                cow: pixeltype?.modifiedRessources?.hunting?.cow ? Math.floor(Math.random() * (pixeltype.modifiedRessources.hunting.cow.max - pixeltype.modifiedRessources.hunting.cow.min + 1) + pixeltype.modifiedRessources.hunting.cow.min) : Math.floor(Math.random() * (client.RPG.ressources.hunting.cow.max - client.RPG.ressources.hunting.cow.min + 1) + client.RPG.ressources.hunting.cow.min),
                pig: pixeltype?.modifiedRessources?.hunting?.pig ? Math.floor(Math.random() * (pixeltype.modifiedRessources.hunting.pig.max - pixeltype.modifiedRessources.hunting.pig.min + 1) + pixeltype.modifiedRessources.hunting.pig.min) : Math.floor(Math.random() * (client.RPG.ressources.hunting.pig.max - client.RPG.ressources.hunting.pig.min + 1) + client.RPG.ressources.hunting.pig.min),
                sheep: pixeltype?.modifiedRessources?.hunting?.sheep ? Math.floor(Math.random() * (pixeltype.modifiedRessources.hunting.sheep.max - pixeltype.modifiedRessources.hunting.sheep.min + 1) + pixeltype.modifiedRessources.hunting.sheep.min) : Math.floor(Math.random() * (client.RPG.ressources.hunting.sheep.max - client.RPG.ressources.hunting.sheep.min + 1) + client.RPG.ressources.hunting.sheep.min),
                beef: pixeltype?.modifiedRessources?.hunting?.beef ? Math.floor(Math.random() * (pixeltype.modifiedRessources.hunting.beef.max - pixeltype.modifiedRessources.hunting.beef.min + 1) + pixeltype.modifiedRessources.hunting.beef.min) : Math.floor(Math.random() * (client.RPG.ressources.hunting.beef.max - client.RPG.ressources.hunting.beef.min + 1) + client.RPG.ressources.hunting.beef.min),
            }

            // update user
            user.rpg.ressources.hunting.rabbit += data.rabbit;
            user.rpg.ressources.hunting.chicken += data.chicken;
            user.rpg.ressources.hunting.cow += data.cow;
            user.rpg.ressources.hunting.pig += data.pig;
            user.rpg.ressources.hunting.sheep += data.sheep;
            user.rpg.ressources.hunting.beef += data.beef;

            // update user in the database
            try {
                await interaction.client.usersdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': interaction.user.id
                    }, {
                        'rpg.ressources.hunting.rabbit': user.rpg.ressources.hunting.rabbit,
                        'rpg.ressources.hunting.chicken': user.rpg.ressources.hunting.chicken,
                        'rpg.ressources.hunting.cow': user.rpg.ressources.hunting.cow,
                        'rpg.ressources.hunting.pig': user.rpg.ressources.hunting.pig,
                        'rpg.ressources.hunting.sheep': user.rpg.ressources.hunting.sheep,
                        'rpg.ressources.hunting.beef': user.rpg.ressources.hunting.beef,
                    })
                ])
            } catch(err) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // create embed with work
            const embed = new EmbedBuilder()
            .setTitle('🏹 Chasse faite par ' + interaction.user.username + ' 🏹')
            .setDescription('Vous avez travaillé !')
            .addFields(
                { name: '🐰 Lapin', value: data.rabbit.toString(), inline: true },
                { name: '🐔 Poulet', value: data.chicken.toString(), inline: true },
                { name: '🐮 Vache', value: data.cow.toString(), inline: true },
                { name: '🐷 Cochon', value: data.pig.toString(), inline: true },
                { name: '🐑 Mouton', value: data.sheep.toString(), inline: true },
                { name: '🥩 Bœuf', value: data.beef.toString(), inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == "mine") {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get random number between min and max
            // view on client.RPG.ressouces.mining
            // coal, iron, gold, diamond, emerald, ruby, sapphire, amethyst, uranium
            // .min, .max with a random
            // check with biome where the user is if
            // there is disabledRessources and modifiedRessources in pixeltype
            const playerpos = await interaction.client.RPG.getPlayerPosition(interaction.user.id);
            if(!playerpos) return interaction.editReply({ content: '> ❌ Vous n\'êtes pas dans le RPG.'});
            const pixeltype = await interaction.client.RPG.getPixelType(playerpos.pixel.type);
            if(!pixeltype) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // check if disabledRessources contains mining
            if(pixeltype.disabledRessources?.includes('mining')) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir miner ici ?'});

            let data = {
                coal: pixeltype?.modifiedRessources?.mining?.coal ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.coal.max - pixeltype.modifiedRessources.mining.coal.min + 1) + pixeltype.modifiedRessources.mining.coal.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.coal.max - client.RPG.ressources.mining.coal.min + 1) + client.RPG.ressources.mining.coal.min),
                iron: pixeltype?.modifiedRessources?.mining?.iron ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.iron.max - pixeltype.modifiedRessources.mining.iron.min + 1) + pixeltype.modifiedRessources.mining.iron.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.iron.max - client.RPG.ressources.mining.iron.min + 1) + client.RPG.ressources.mining.iron.min),
                gold: pixeltype?.modifiedRessources?.mining?.gold ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.gold.max - pixeltype.modifiedRessources.mining.gold.min + 1) + pixeltype.modifiedRessources.mining.gold.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.gold.max - client.RPG.ressources.mining.gold.min + 1) + client.RPG.ressources.mining.gold.min),
                diamond: pixeltype?.modifiedRessources?.mining?.diamond ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.diamond.max - pixeltype.modifiedRessources.mining.diamond.min + 1) + pixeltype.modifiedRessources.mining.diamond.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.diamond.max - client.RPG.ressources.mining.diamond.min + 1) + client.RPG.ressources.mining.diamond.min),
                emerald: pixeltype?.modifiedRessources?.mining?.emerald ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.emerald.max - pixeltype.modifiedRessources.mining.emerald.min + 1) + pixeltype.modifiedRessources.mining.emerald.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.emerald.max - client.RPG.ressources.mining.emerald.min + 1) + client.RPG.ressources.mining.emerald.min),
                ruby: pixeltype?.modifiedRessources?.mining?.ruby ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.ruby.max - pixeltype.modifiedRessources.mining.ruby.min + 1) + pixeltype.modifiedRessources.mining.ruby.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.ruby.max - client.RPG.ressources.mining.ruby.min + 1) + client.RPG.ressources.mining.ruby.min),
                sapphire: pixeltype?.modifiedRessources?.mining?.sapphire ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.sapphire.max - pixeltype.modifiedRessources.mining.sapphire.min + 1) + pixeltype.modifiedRessources.mining.sapphire.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.sapphire.max - client.RPG.ressources.mining.sapphire.min + 1) + client.RPG.ressources.mining.sapphire.min),
                amethyst: pixeltype?.modifiedRessources?.mining?.amethyst ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.amethyst.max - pixeltype.modifiedRessources.mining.amethyst.min + 1) + pixeltype.modifiedRessources.mining.amethyst.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.amethyst.max - client.RPG.ressources.mining.amethyst.min + 1) + client.RPG.ressources.mining.amethyst.min),
                uranium: pixeltype?.modifiedRessources?.mining?.uranium ? Math.floor(Math.random() * (pixeltype.modifiedRessources.mining.uranium.max - pixeltype.modifiedRessources.mining.uranium.min + 1) + pixeltype.modifiedRessources.mining.uranium.min) : Math.floor(Math.random() * (client.RPG.ressources.mining.uranium.max - client.RPG.ressources.mining.uranium.min + 1) + client.RPG.ressources.mining.uranium.min),
            }

            // update user
            user.rpg.ressources.mining.coal += data.coal;
            user.rpg.ressources.mining.iron += data.iron;
            user.rpg.ressources.mining.gold += data.gold;
            user.rpg.ressources.mining.diamond += data.diamond;
            user.rpg.ressources.mining.emerald += data.emerald;
            user.rpg.ressources.mining.ruby += data.ruby;
            user.rpg.ressources.mining.sapphire += data.sapphire;
            user.rpg.ressources.mining.amethyst += data.amethyst;
            user.rpg.ressources.mining.uranium += data.uranium;
            
            // update user in the database
            try {
                await interaction.client.usersdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': interaction.user.id
                    }, {
                        'rpg.ressources.mining.coal': user.rpg.ressources.mining.coal,
                        'rpg.ressources.mining.iron': user.rpg.ressources.mining.iron,
                        'rpg.ressources.mining.gold': user.rpg.ressources.mining.gold,
                        'rpg.ressources.mining.diamond': user.rpg.ressources.mining.diamond,
                        'rpg.ressources.mining.emerald': user.rpg.ressources.mining.emerald,
                        'rpg.ressources.mining.ruby': user.rpg.ressources.mining.ruby,
                        'rpg.ressources.mining.sapphire': user.rpg.ressources.mining.sapphire,
                        'rpg.ressources.mining.amethyst': user.rpg.ressources.mining.amethyst,
                        'rpg.ressources.mining.uranium': user.rpg.ressources.mining.uranium,
                    })
                ])
            } catch(err) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // create embed with work
            const embed = new EmbedBuilder()
            .setTitle('⛏ Minage fait par ' + interaction.user.username + ' ⛏')
            .setDescription('Vous avez travaillé !')
            .addFields(
                { name: '🪨 Charbon', value: data.coal.toString(), inline: true },
                { name: '🪨 Fer', value: data.iron.toString(), inline: true },
                { name: '🪨 Or', value: data.gold.toString(), inline: true },
                { name: '💎 Diamant', value: data.diamond.toString(), inline: true },
                { name: '🪨 Émeraude', value: data.emerald.toString(), inline: true },
                { name: '🪨 Rubis', value: data.ruby.toString(), inline: true },
                { name: '🪨 Saphir', value: data.sapphire.toString(), inline: true },
                { name: '🪨 Améthyste', value: data.amethyst.toString(), inline: true },
                { name: '🪨 Uranium', value: data.uranium.toString(), inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand == "woodcut") {
            // get user in the database (interaction user)
            const user = await interaction.client.usersdb.findOne({ id: interaction.user.id });
            if(!user) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // get random number between min and max
            // view on client.RPG.ressouces.woodcutting
            // oak, spruce, birch, jungle, acacia, darkoak, fir, pine
            // .min, .max with a random
            // check with biome where the user is if
            // there is disabledRessources and modifiedRessources in pixeltype
            const playerpos = await interaction.client.RPG.getPlayerPosition(interaction.user.id);
            if(!playerpos) return interaction.editReply({ content: '> ❌ Vous n\'êtes pas dans le RPG.'});
            const pixeltype = await interaction.client.RPG.getPixelType(playerpos.pixel.type);
            if(!pixeltype) return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});

            // check if disabledRessources contains woodcutting
            if(pixeltype.disabledRessources?.includes('woodcutting')) return interaction.editReply({ content: '> ❌ Vous pensez vraiment pouvoir couper du bois ici ?'});

            let data = {
                oak: pixeltype?.modifiedRessources?.woodcutting?.oak ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.oak.max - pixeltype.modifiedRessources.woodcutting.oak.min + 1) + pixeltype.modifiedRessources.woodcutting.oak.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.oak.max - client.RPG.ressources.woodcutting.oak.min + 1) + client.RPG.ressources.woodcutting.oak.min),
                spruce: pixeltype?.modifiedRessources?.woodcutting?.spruce ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.spruce.max - pixeltype.modifiedRessources.woodcutting.spruce.min + 1) + pixeltype.modifiedRessources.woodcutting.spruce.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.spruce.max - client.RPG.ressources.woodcutting.spruce.min + 1) + client.RPG.ressources.woodcutting.spruce.min),
                birch: pixeltype?.modifiedRessources?.woodcutting?.birch ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.birch.max - pixeltype.modifiedRessources.woodcutting.birch.min + 1) + pixeltype.modifiedRessources.woodcutting.birch.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.birch.max - client.RPG.ressources.woodcutting.birch.min + 1) + client.RPG.ressources.woodcutting.birch.min),
                jungle: pixeltype?.modifiedRessources?.woodcutting?.jungle ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.jungle.max - pixeltype.modifiedRessources.woodcutting.jungle.min + 1) + pixeltype.modifiedRessources.woodcutting.jungle.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.jungle.max - client.RPG.ressources.woodcutting.jungle.min + 1) + client.RPG.ressources.woodcutting.jungle.min),
                acacia: pixeltype?.modifiedRessources?.woodcutting?.acacia ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.acacia.max - pixeltype.modifiedRessources.woodcutting.acacia.min + 1) + pixeltype.modifiedRessources.woodcutting.acacia.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.acacia.max - client.RPG.ressources.woodcutting.acacia.min + 1) + client.RPG.ressources.woodcutting.acacia.min),
                darkoak: pixeltype?.modifiedRessources?.woodcutting?.darkoak ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.darkoak.max - pixeltype.modifiedRessources.woodcutting.darkoak.min + 1) + pixeltype.modifiedRessources.woodcutting.darkoak.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.darkoak.max - client.RPG.ressources.woodcutting.darkoak.min + 1) + client.RPG.ressources.woodcutting.darkoak.min),
                fir: pixeltype?.modifiedRessources?.woodcutting?.fir ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.fir.max - pixeltype.modifiedRessources.woodcutting.fir.min + 1) + pixeltype.modifiedRessources.woodcutting.fir.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.fir.max - client.RPG.ressources.woodcutting.fir.min + 1) + client.RPG.ressources.woodcutting.fir.min),
                pine: pixeltype?.modifiedRessources?.woodcutting?.pine ? Math.floor(Math.random() * (pixeltype.modifiedRessources.woodcutting.pine.max - pixeltype.modifiedRessources.woodcutting.pine.min + 1) + pixeltype.modifiedRessources.woodcutting.pine.min) : Math.floor(Math.random() * (client.RPG.ressources.woodcutting.pine.max - client.RPG.ressources.woodcutting.pine.min + 1) + client.RPG.ressources.woodcutting.pine.min),
            }

            // update user
            user.rpg.ressources.woodcutting.oak += data.oak;
            user.rpg.ressources.woodcutting.spruce += data.spruce;
            user.rpg.ressources.woodcutting.birch += data.birch;
            user.rpg.ressources.woodcutting.jungle += data.jungle;
            user.rpg.ressources.woodcutting.acacia += data.acacia;
            user.rpg.ressources.woodcutting.darkoak += data.darkoak;
            user.rpg.ressources.woodcutting.fir += data.fir;
            user.rpg.ressources.woodcutting.pine += data.pine;
            
            // update user in the database
            try {
                await interaction.client.usersdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': interaction.user.id
                    }, {
                        'rpg.ressources.woodcutting.oak': user.rpg.ressources.woodcutting.oak,
                        'rpg.ressources.woodcutting.spruce': user.rpg.ressources.woodcutting.spruce,
                        'rpg.ressources.woodcutting.birch': user.rpg.ressources.woodcutting.birch,
                        'rpg.ressources.woodcutting.jungle': user.rpg.ressources.woodcutting.jungle,
                        'rpg.ressources.woodcutting.acacia': user.rpg.ressources.woodcutting.acacia,
                        'rpg.ressources.woodcutting.darkoak': user.rpg.ressources.woodcutting.darkoak,
                        'rpg.ressources.woodcutting.fir': user.rpg.ressources.woodcutting.fir,
                        'rpg.ressources.woodcutting.pine': user.rpg.ressources.woodcutting.pine,
                    })
                ])
            } catch(err) {
                return interaction.editReply({ content: '> ❌ Une erreur est survenue.'});
            }

            // create embed with work
            const embed = new EmbedBuilder()
            .setTitle('🪓 Bûcheronnage fait par ' + interaction.user.username + ' 🪓')
            .setDescription('Vous avez travaillé !')
            .addFields(
                { name: '🪵 Chêne', value: data.oak.toString(), inline: true },
                { name: '🪵 Sapin', value: data.spruce.toString(), inline: true },
                { name: '🪵 Bouleau', value: data.birch.toString(), inline: true },
                { name: '🪵 Jungle', value: data.jungle.toString(), inline: true },
                { name: '🪵 Acacia', value: data.acacia.toString(), inline: true },
                { name: '🪵 Chêne noir', value: data.darkoak.toString(), inline: true },
                { name: '🪵 Sapin de Douglas', value: data.fir.toString(), inline: true },
                { name: '🪵 Pin', value: data.pine.toString(), inline: true },
            )

            // send embed
            await interaction.editReply({ embeds: [embed] });
        }
    }
}