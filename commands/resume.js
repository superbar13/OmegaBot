const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reprendre la lecture')
        .setContexts(0).setIntegrationTypes(0),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();
        let player = interaction.client.players.get(interaction.guild.id);
        if (!player) return interaction.editReply('> ❌ Aucun lecteur actif.');
        player.unpause();
        await interaction.editReply('> ▶️ **Lecture reprise.**');
    }
};
