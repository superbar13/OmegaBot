// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    category: 'basic',
    async execute(interaction){
        await interaction.deferReply();
        // get the ping
        await interaction.editReply('Pong!\nBot ping : ' + interaction.client.ws.ping + 'ms\n' + 'Database ping : ' + await interaction.client.serversdb.ping() + 'ms');
    }
};