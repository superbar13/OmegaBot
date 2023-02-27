// ping command module to be used in index.js

const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const {PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adminonly')
        .setDescription('Activer/Désactiver la commande adminonly')
        // add options radio required for the command
        .addBooleanOption(option => option.setName('adminonly').setDescription('Activer/Désactiver la commande adminonly').setRequired(true)),
        category: 'config',
    async execute(interaction){
        await interaction.deferReply();
        // check if the user is admin
        if(interaction?.member?.permissions.has(PermissionsBitField.Flags.Administrator)){
            // get the option value
            const adminonly = interaction.options.getBoolean('adminonly');
            // save the option value in the database
            // using mongo
            try{
                await interaction.client.serversdb.bulkWrite([
                    interaction.client.bulkutility.setField({
                        'id': guild.id
                    }, {
                        'voiceconfig.adminonly': adminonly
                    })
                ])
            }catch(err){
                console.log(err);
            }
            // create embed
            const embed = new EmbedBuilder()
                .setTitle('Commande adminonly')
                .setDescription('La commande adminonly a été ' + (adminonly ? 'activée' : 'désactivée'))
                .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply('> ❌ Vous devez être administrateur pour utiliser cette commande');
        }
    }
};