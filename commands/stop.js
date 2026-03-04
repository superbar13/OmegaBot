const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Arrête la lecture et vide la file d\'attente')
        .setContexts(0).setIntegrationTypes(0),
    category: 'music',
    async execute(interaction) {
        if (!interaction.client.config.modules['music'].enabled) return interaction.reply({ content: '> ❌ Le module musique est désactivé.' });
        await interaction.deferReply();

        let voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig queue music');

        // Clear queue and currently playing
        await interaction.client.serversdb.bulkWrite([
            interaction.client.bulkutility.setField({ id: interaction.guild.id }, {
                'queue': [],
                'music': null,
                'voiceconfig.playing': false,
                'voiceconfig.type': 'none'
            })
        ]);

        let player = interaction.client.players.get(interaction.guild.id);
        if (player) {
            player.removeAllListeners();
            player.stop();
            interaction.client.players.delete(interaction.guild.id);
        }

        let response = interaction.client.responses.get(interaction.guild.id);
        if (response) {
            if (typeof response.abort === 'function') response.abort();
            else if (typeof response.kill === 'function') response.kill();
            interaction.client.responses.delete(interaction.guild.id);
        }

        await interaction.editReply('> ⏹️ **Musique arrêtée et file d\'attente vidée.**');
    }
};
