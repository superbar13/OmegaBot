// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime un nombre de messages')
    .addIntegerOption(option => option.setName('nombre').setDescription('Nombre de messages a supprimer').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
    category: 'moderation',
    telegram: 'enabled',
    async execute(interaction){
        // check if bot has permission
        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)){
            await interaction.reply('> ❌ Je n\'ai pas la permission de supprimer des messages');
            return;
        }
        // fetch the messages
        let messages;
        try{
            messages = await interaction.channel.messages.fetch({ limit: 100 });
        }catch(err){
            await interaction.reply('> ❌ Une erreur est survenue');
            console.log(err);
            return;
        }
        // get the option value
        const number = interaction.options.getInteger('nombre');
        // check if there are enough messages
        if(messages.size < number){
            number = messages.size;
        }
        // check if the number is between 1 and 100
        if(number < 1 || number > 100){
            await interaction.reply('> ❌ Le nombre doit être compris entre 1 et 100');
            return;
        }
        await interaction.deleteToReply();
        // delete the messages
        try{
            await interaction.channel.bulkDelete(number);
            // create embed
            const embed = new EmbedBuilder()
            .setTitle('🪄 ' + number + ' messages supprimés')
            .setDescription('Dans le salon <#' + interaction.channel.id + '>\nPar <@' + interaction.user.id + '>`\nCe message sera supprimé dans 5 secondes')
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setImage('https://cdn.discordapp.com/attachments/909475569459163186/1077679404240613396/bluebar.gif')
            .setThumbnail('https://media.discordapp.net/attachments/909475569459163186/1077678827842572299/soap.png');
            try{
                await interaction.reply({ embeds: [embed] }).then(async msg => {
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 5000);
                });
            }catch(err){
                await interaction.reply('> ❌ Une erreur est survenue');
                console.log(err);
                return;
            }
        }catch(err){
            await interaction.reply('> ❌ Une erreur est survenue');
            console.log(err);
            return;
        }
    }
};