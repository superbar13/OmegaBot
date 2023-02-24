// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    category: 'basic',
    async execute(interaction){
        await interaction.deferReply();
        // get the ping
        await interaction.editReply({ embeds: [
            new EmbedBuilder()
            .setTitle('🏓 Pong !')
            .setDescription(
                '> 🤖 Bot / Discord : **' + interaction.client.ws.ping + 'ms**\n' +
                '> 📡 Database / Données : **' + await interaction.client.serversdb.ping() + 'ms**'
            )
            .setThumbnail('https://media.discordapp.net/attachments/909475569459163186/1077673171077046312/ping.png')
            .setColor(Math.floor(Math.random()*16777215).toString(16))
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp()
        ]})
    }
};