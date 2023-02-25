// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Afficher l\'aide')
        .addStringOption(option => option.setName('category').setDescription('Afficher les commandes d\'une catégorie'))
        .addNumberOption(option => option.setName('page').setDescription('Numéro de la page à afficher')),
        category: 'basic',
    async execute(interaction){
        await interaction.deferReply();
        // show in a embed message commands
        const avatar = interaction.client.user.displayAvatarURL();
        const botname = interaction.client.user.username;
        const commands1 = interaction.client.commands;
        const commands = new Map();
        commands1.forEach((command, key) => {
            if(command.type == "slash") commands.set(key, command);
        });
        const discordcommands = interaction.client.discordcommands;

        // get the category option
        const category = interaction.options.getString('category');
        if(category){
            if(category != "all") {
                // filter commands by category
                commands.forEach((command, key) => {
                    if(command.category != category) commands.delete(key);
                });
                if(commands.size == 0) return interaction.editReply('> ❌ Cette catégorie n\'existe pas');
            }
        } else {
            let embed = new EmbedBuilder()
                .setTitle('Catégories de commandes')
                .setDescription('📜 Liste des catégories 📜')
                .setFooter({ text: botname, iconURL: avatar })
                .setColor(Math.floor(Math.random()*16777215).toString(16))
                .setAuthor({ name: botname, iconURL: avatar })
                .setTimestamp();
            // add categories to embed
            let categories = [];
            commands.forEach(command => {
                if(!categories.includes(command.category)) categories.push(command.category);
            });
            categories.forEach(category => {
                let commandscategory = [];
                commands.forEach(command => {
                    if(command.category === category) commandscategory.push(command.data.name);
                });
                embed.addFields({ name: category, value: '```' + commandscategory.join(', ') + '```' });
            });
            return interaction.editReply({ embeds: [embed] });
        }

        // calculer a combien de page on a besoin
        let commandsperpage = 24;
        let numberofpages = Math.ceil(commands.size / commandsperpage);

        // quelle page on veut afficher
        let page = interaction.options.getNumber('page');
        if(!page) page = 1;
        if(page > numberofpages) page = numberofpages;
        if(page < 1) page = 1;

        // create embed
            const embed = new EmbedBuilder()
            .setAuthor({ name: botname, iconURL: avatar })
            .setTitle('Commandes de la catégorie ' + category)
            .setDescription('📜 Liste des commandes 📜')
            .setFooter({ text: botname, iconURL: avatar })
            .setColor(Math.floor(Math.random()*16777215).toString(16))
            .setTimestamp();

        // add commands to embed
        await addCommandsToEmbed();

        interaction.editReply({ embeds: [embed], components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(page == 1),
                new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(page == numberofpages)
            )
        ] });

        // create collector
        const collector = interaction.channel.createMessageComponentCollector({ filter:(i) => i.user.id === interaction.user.id, time: 60000 });
        collector.on('collect', async i => {
            // if next button
            if(i.customId === 'next'){
                page++;
                await addCommandsToEmbed();
                // edit embed
                await i.update({ embeds: [embed], components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary)
                    )
                ] });
            }
            // if previous button
            else if(i.customId === 'previous'){
                page--;
                await addCommandsToEmbed();
                // edit embed
                await i.update({ embeds: [embed], components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary)
                    )
                ] });
            }
        });
        collector.on('end', collected => {
            interaction.editReply({ embeds: [embed], components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('previous').setLabel('Précédent').setStyle(ButtonStyle.Primary).setDisabled(true),
                    new ButtonBuilder().setCustomId('next').setLabel('Suivant').setStyle(ButtonStyle.Primary).setDisabled(true)
                )
            ] });
        });

        async function addCommandsToEmbed(){
            embed.data.fields = [];
            // add fields to embed
            for(let i = 0; i < commandsperpage; i++){
                // command is a collection map, it is very important to not disturb it with an array because it will not work
                let command = null;
                for(let [key, value] of commands){
                    // we want to get the command at the right page
                    if(i + (page - 1) * commandsperpage == 0){
                        command = value;
                        break;
                    }
                    i++;
                }
                if(!command) break;
                // get command options
                let commandOptions = command?.data?.options;
                if(!commandOptions) commandOptions = [];
                // create a string with all options
                var options = '';
                commandOptions.forEach(option => {
                    if(option.options && option.options.length > 0){
                        // if it is the first
                        if(options == '') options += `> - ${option.name} `;
                        else options += `\n> - ${option.name} `;
                        for(let suboption of option.options){
                            if(suboption.options && suboption.options.length > 0){
                                options += `\n> -> ${suboption.name} `;
                                for(let subsuboption of suboption.options){
                                    if(subsuboption.required){
                                        options += `<${subsuboption.name}> `;
                                    } else {
                                        options += `[${subsuboption.name}] `;
                                    }
                                }
                            } else {
                                if(suboption.required){
                                    options += `<${suboption.name}> `;
                                } else {
                                    options += `[${suboption.name}] `;
                                }
                            }
                        }
                    } else {
                        // check if option is required
                        if(option.required){
                            options += `<${option.name}> `;
                        } else {
                            options += `[${option.name}] `;
                        }
                    }
                });
                // get the command from discordcommands Collection Map (valueofcollection.name == command name)
                let discordcommand = discordcommands.reduce((acc, val) => val.name == command?.data?.name ? val : acc, null);
                embed.addFields({ name: `${discordcommand ? ('</' + discordcommand.name + ':' + discordcommand.id + '>') : ('/'+command?.data?.name)}`, value: `${command?.data?.description}\n${options}`, inline: false });
            };
            embed.addFields({ name: `Page n°${page}/${numberofpages}`, value: `Pour voir les autres pages, utilisez les boutons ci-dessous.`, inline: false });
        }
    }
}