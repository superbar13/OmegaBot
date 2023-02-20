// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Afficher l\'aide')
        .addNumberOption(option => option.setName('page').setDescription('Numéro de la page à afficher'))
        .addStringOption(option => option.setName('category').setDescription('Afficher les commandes d\'une catégorie')),
        category: 'basic',
    async execute(interaction){
        await interaction.deferReply();
        // show in a embed message commands
        const avatar = interaction.client.user.displayAvatarURL();
        const botname = interaction.client.user.username;
        const commands = interaction.client.commands;

        // calculer a combien de page on a besoin
        let numberofpages = Math.ceil(commands.size / 24);
        // quelle page on veut afficher
        let page = interaction.options.getNumber('page');
        if(!page) page = 1;
        if(page > numberofpages) page = numberofpages;
        if(page < 1) page = 1;
        let firstcommand = (page - 1) * 24;
        let lastcommand = page * 24;

        infos = await createembed(page, numberofpages, firstcommand, lastcommand, commands, avatar, botname, interaction);
        interaction.editReply(infos);

        // create collector
        const filter = i => i.customId === 'previous' || i.customId === 'next';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async i => {
            // check if button is pressed by the same user
            if(i.user.id !== interaction.user.id) return;
            
            // check if button is pressed in the same interaction
            if(i.message.interaction.id !== interaction.id) return;

            // check if button is next
            if(i.customId === 'next'){
                page++;
                firstcommand = (page - 1) * 24;
                lastcommand = page * 24;
                await i.deferUpdate();
                let infos = await createembed(page, numberofpages, firstcommand, lastcommand, commands, avatar, botname, interaction);
                i.editReply(infos);
            }
            // check if button is previous
            if(i.customId === 'previous'){
                page--;
                firstcommand = (page - 1) * 24;
                lastcommand = page * 24;
                await i.deferUpdate();
                let infos = await createembed(page, numberofpages, firstcommand, lastcommand, commands, avatar, botname, interaction);
                i.editReply(infos);
            }
        });
    }
};

async function createembed(page, numberofpages, firstcommand, lastcommand, commands, avatar, botname, interaction){
    // create embed
        const embed = new EmbedBuilder()
        .setAuthor({ name: botname, iconURL: avatar })
        .setTitle('Aide')
        .setDescription('📜 Liste des commandes 📜')
        .setFooter({ text: botname, iconURL: avatar })
        .setTimestamp();

    // add fields to embed
    let i = 0;
    for(let command of commands){
        command = command[1];
        i++;
        if(i <= lastcommand && i > firstcommand){
            // get command options
            let commandOptions = command?.data?.options;
            if(!commandOptions) commandOptions = [];
            // create a string with all options
            var options = '';
            commandOptions.forEach(option => {
                // check if option is required
                if(option.required){
                    options += `<${option.name}> `;
                } else {
                    options += `[${option.name}] `;
                }
            });
            options = ' -> /' + command?.data?.name + ' ' + options;
            embed.addFields({ name: `/${command?.data?.name}`, value: `${command?.data?.description}${options}`, inline: false });
        }
    };
    embed.addFields({ name: `Page n°${page}/${numberofpages}`, value: `Pour voir les autres pages, utilisez les boutons ci-dessous.`, inline: false });

    // create buttons
    const buttons = [];

    // create previous button
    if(page > 1){
        const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Précédent')
            .setStyle(ButtonStyle.Primary);
        buttons.push(previousButton);
    } else {
        const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Précédent')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
        buttons.push(previousButton);
    }

    // create next button
    if(page < numberofpages){
        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Suivant')
            .setStyle(ButtonStyle.Primary);
        buttons.push(nextButton);
    } else {
        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Suivant')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
        buttons.push(nextButton);
    }
    
    // create action row
    const actionRow = new ActionRowBuilder()
        .addComponents(buttons);

    return { embeds: [embed], components: [actionRow] };
}