// rank command module to be used in index.js (but it's for guilds)
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Affiche la carte du RPG')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand.setName('show')
            .setDescription('Affiche la carte du RPG'))
        .addSubcommand(subcommand => subcommand.setName('travel')
            .setDescription('Voyage vers une autre zone')
            .addStringOption(option => option
                .setName('x')
                .setDescription('Coordonnée X de la zone vers laquelle vous voulez voyager')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('y')
                .setDescription('Coordonnée Y de la zone vers laquelle vous voulez voyager')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand.setName('info')
            .setDescription('Affiche les informations sur une zone')
            .addStringOption(option => option
                .setName('x')
                .setDescription('Coordonnée X de la zone dont vous voulez les informations')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('y')
                .setDescription('Coordonnée Y de la zone dont vous voulez les informations')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand.setName('spawn')
            .setDescription('Spawn sur une zone au hasard')
        )
        .addSubcommand(subcommand => subcommand.setName('player')
            .setDescription('Affiche les informations sur un joueur')
            .addUserOption(option => option
                .setName('user')
                .setDescription('Joueur dont vous voulez les informations')
                .setRequired(false)
            )
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
        if(subcommand === 'show'){
            // get map in png format
            const map = await interaction.client.RPG.runRender();

            // create attachment
            const attachment = new AttachmentBuilder(map, { name: 'map.png' });

            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🗺️ Carte du RPG 🗺️')
            .setDescription('Voici la carte du RPG')
            .setImage('attachment://map.png')
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            const playerpos = await interaction.client.RPG.getPlayerPosition(interaction.user.id);
            if(playerpos){
                embed.addFields({
                    name: '📍 Votre position 📍',
                    value: `Vous êtes actuellement sur le chunk ${playerpos.chunk.x} ${playerpos.chunk.z} et dans la zone ${playerpos.pixel.x} ${playerpos.pixel.z}`
                    + `\nVous êtes dans une zone de type ${interaction.client.RPG.getPixelType(playerpos.pixel.type).name} ${interaction.client.RPG.getPixelType(playerpos.pixel.type).emoji}`
                })
            } else {
                embed.addFields({
                    name: '📍 Votre position 📍',
                    value: `Vous n'avez pas encore spawn !`
                })
            }

            // send embed
            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } else if(subcommand === 'travel'){
            // get x and y
            const x = interaction.options.getString('x');
            const y = interaction.options.getString('y');

            const embed = new EmbedBuilder()
            .setTitle('🗺️ Voyage 🗺️')
            .setDescription(`Vous allez voyager vers la zone ${x} ${y} !`)
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            // send embed
            await interaction.editReply({ embeds: [embed] });

            // callback
            async function callback(path, percent) {
                const embed = new EmbedBuilder()
                    .setTitle('🗺️ Voyage 🗺️')
                    .setDescription(`Voyage en cours... Actuellement à la zone ${path.x} ${path.z} (${percent}%)`)
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setTimestamp()
                    .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

                await interaction.editReply({ embeds: [embed] });
            }

            async function callback2(travel){
                // create embed
                const embed1 = new EmbedBuilder()
                    .setTitle('🗺️ Voyage 🗺️')
                    .setDescription(`Vous avez voyagé vers la zone ${x} ${y}. Zone de type ${travel?.type?.name}.`
                    + `\nDurant ce voyage vous avez perdu ${travel?.eated} points de faim et ${travel?.watered} points de soif.`)
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setTimestamp()
                    .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });
                // send embed
                await interaction.editReply({ embeds: [embed1] });
            }

            // travel
            const travel = await interaction.client.RPG.travel(interaction.user.id, x, y, callback, callback2);

            // if travel is false
            if(!travel) return interaction.editReply({ content: '> ❌ Vous ne pouvez pas voyager vers cette zone.' });

            // if travel.finished is false
            /*
            if(!finished) {
                // create embed
                const embed = new EmbedBuilder()
                .setTitle('🗺️ Voyage 🗺️')
                .setDescription(`Vous avez entrepris de voyager vers la zone ${x} ${y}, mais malheureusement vous avez été arrêté par ${travel.reason}.`
                + `\nVous vous êtes donc arrêté à la zone ${travel.x} ${travel.y}. Vous êtes donc dans une zone de type ${interaction.client.RPG.getPixelType(travel.pixel.type).name} ${interaction.client.RPG.getPixelType(travel.pixel.type).emoji}.`)
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setTimestamp()
                .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

                // send embed
                return await interaction.editReply({ embeds: [embed] });
            }
            */
        } else if(subcommand === 'info'){
            let x = interaction.options.getString('x');
            let y = interaction.options.getString('y');

            // get pixel
            const pixelAndChunk = interaction.client.RPG.chunkManager.getCoordPixelAndChunk(x, y);
            console.log(pixelAndChunk);
            const pixel = pixelAndChunk.pixel;
            console.log(pixel);
            const chunk = pixelAndChunk.chunk;
            console.log(chunk);
            const pixelType = interaction.client.RPG.getPixelType(pixel.type);
            console.log(pixelType);

            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🗺️ Zone 🗺️')
            .setDescription(`Voici les informations sur la zone ${x} ${y}`)
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            embed.addFields({
                name: '📍 Position 📍',
                value: `Cette zone est de type ${pixelType.name} ${pixelType.emoji}`
                + `\nIl y a actuellement ${pixel.players} joueur(s) sur cette zone`
                + `\nIl y a actuellement ${pixel.monsters} monstre(s) sur cette zone`
            });

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'spawn'){
            // spawn
            const spawn = await interaction.client.RPG.spawn(interaction.user.id);
            if(!spawn) return interaction.editReply({ content: '> ❌ Vous avez déjà spawn !' });

            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🗺️ Spawn 🗺️')
            .setDescription(`Jeune aventurier, vous avez spawn de façon aléatoire sur la zone ${spawn.x} ${spawn.z}, bonne chance !`)
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            // send embed
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'player') {
            // get user
            const user = interaction.options.getUser('user') || interaction.user;

            // get player
            const player = await interaction.client.RPG.getPlayerPosition(user.id);

            // if player is false
            if(!player) return interaction.editReply({ content: '> ❌ Ce joueur n\'a pas encore spawn !' });

            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🗺️ Joueur 🗺️')
            .setDescription(`Voici les informations de position sur le joueur ${user.username}`)
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            embed.addFields({
                name: '📍 Position 📍',
                value: `Ce joueur est actuellement dans le chunk ${player.chunk.x} ${player.chunk.z} et dans la zone ${player.pixel.x} ${player.pixel.z}`
                + `\nIl est dans une zone de type ${interaction.client.RPG.getPixelType(player.pixel.type).name} ${interaction.client.RPG.getPixelType(player.pixel.type).emoji}`
            });

            // send embed
            await interaction.editReply({ embeds: [embed] });
        }
    }
}