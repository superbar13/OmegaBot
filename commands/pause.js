const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Met en pause la lecture')
        .setContexts(0).setIntegrationTypes(0),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();
        let player = interaction.client.players.get(interaction.guild.id);
        if (!player) return interaction.editReply('> ❌ Aucun lecteur actif.');
        player.pause();
        await interaction.editReply('> ⏸️ **Lecture mise en pause.**');
    }
};
