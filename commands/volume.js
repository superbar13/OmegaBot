const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Modifier le volume de la lecture')
        .addIntegerOption(option =>
            option.setName('niveau')
                .setDescription('Niveau du volume (1 à 200)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(200)
        )
        .setContexts(0).setIntegrationTypes(0),
    category: 'music',
    async execute(interaction) {
        if (!interaction.client.config.modules['music'].enabled && !interaction.client.config.modules['radio'].enabled) {
            return interaction.reply({ content: '> ❌ Les modules de lecture sont désactivés.' });
        }
        await interaction.deferReply();

        let player = interaction.client.players.get(interaction.guild.id);
        if (!player) return interaction.editReply('> ❌ Aucun lecteur actif dans ce serveur.');

        let volume = interaction.options.getInteger('niveau');

        // Update DB
        await interaction.client.serversdb.bulkWrite([
            interaction.client.bulkutility.setField({ id: interaction.guild.id }, {
                'voiceconfig.volume': volume
            })
        ]);

        // Attempt to set volume on current resource if any
        if (player.state.status === 'playing' || player.state.status === 'paused' || player.state.status === 'buffering') {
            let resource = player.state.resource;
            // if inlineVolume was enabled globally
            if (resource && resource.volume) {
                resource.volume.setVolume(volume / 100);
            }
        }

        await interaction.editReply(`> 🔊 **Volume défini sur ${volume}%**`);
    }
};
