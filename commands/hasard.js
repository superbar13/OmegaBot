const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hasard')
        .setDescription('Pleins de commandes au hasard')
        .addSubcommand(subcommand => subcommand
            .setName('pileouface')
            .setDescription('Pile ou face')
        )
        .addSubcommand(subcommand => subcommand
            .setName('roll')
            .setDescription('Lance un dé')
            .addIntegerOption(option => option
                .setName('faces')
                .setDescription('Nombre de faces du dé')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('ppc')
            .setDescription('Pierre papier ciseaux')
            .addStringOption(option => option
                .setName('choix')
                .setDescription('Choix du joueur')
                .setRequired(true)
            )
        ),
    category: 'fun',
    async execute(interaction){
        await interaction.deferReply();
        // retrouve la sous commande
        const subcommand = interaction.options.getSubcommand();
        // si c'est pile ou face
        if(subcommand === 'pileouface'){
            // génère un nombre aléatoire
            const random = Math.floor(Math.random() * 2);
            // embed
            const embed = new EmbedBuilder()
            .setTitle('Pile ou face')
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            // si c'est 0 c'est pile sinon c'est face
            if(random === 0){
                embed.setDescription('Pile !');
                embed.setImage('https://cdn.discordapp.com/attachments/909475568293138494/1125191404726001714/image.png');
            }else{
                embed.setDescription('Face !');
                embed.setImage('https://cdn.discordapp.com/attachments/909475568293138494/1125191894704590898/image.png');
            }
            // envoie le résultat
            return await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'roll'){
            // retrouve le nombre de faces
            const faces = interaction.options.getInteger('faces');
            // génère un nombre aléatoire
            const random = Math.floor(Math.random() * faces) + 1;
            // envoie le résultat
            return await interaction.editReply('🎲 Le nombre choisi est: ' + random);
        } else if(subcommand === 'ppc'){
            Math.floor(Math.random() * 3);
            // retrouve le choix du joueur
            const choix = interaction.options.getString('choix');
            // génère un nombre aléatoire
            const random = Math.floor(Math.random() * 3);
            // embed
            const embed = new EmbedBuilder()
            .setTitle('Pierre papier ciseaux')
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setThumbnail('https://cdn.discordapp.com/attachments/909475568293138494/1125193217701314691/image.png')
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            // si c'est 0 c'est pierre, 1 c'est papier et 2 c'est ciseaux
            if(random === 0){
                embed.setDescription('Pierre !');
            }else if(random === 1){
                embed.setDescription('Papier !');
            }else{
                embed.setDescription('Ciseaux !');
            }
            // si c'est pierre
            if(choix === 'pierre'){
                // si c'est pierre
                if(random === 0){
                    embed.addFields({ name: 'Résultat', value: 'Égalité !' });
                // si c'est papier
                }else if(random === 1){
                    embed.addFields({ name: 'Résultat', value: 'Perdu !' });
                // si c'est ciseaux
                }else{
                    embed.addFields({ name: 'Résultat', value: 'Gagné !' });
                }
            // si c'est papier
            }else if(choix === 'papier'){
                // si c'est pierre
                if(random === 0){
                    embed.addFields({ name: 'Résultat', value: 'Gagné !' });
                // si c'est papier
                }else if(random === 1){
                    embed.addFields({ name: 'Résultat', value: 'Égalité !' });
                // si c'est ciseaux
                }else{
                    embed.addFields({ name: 'Résultat', value: 'Perdu !' });
                }
            // si c'est ciseaux
            }else if(choix === 'ciseaux'){
                // si c'est pierre
                if(random === 0){
                    embed.addFields({ name: 'Résultat', value: 'Perdu !' });
                // si c'est papier
                }else if(random === 1){
                    embed.addFields({ name: 'Résultat', value: 'Gagné !' });
                // si c'est ciseaux
                }else{
                    embed.addFields({ name: 'Résultat', value: 'Égalité !' });
                }
            } else {
                await interaction.reply('> ❌ Un tricheur a été détecté ! (choix invalide)');
                return;
            }
            // envoie le résultat
            return await interaction.editReply({ embeds: [embed] });
        }
    }
};