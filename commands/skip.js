const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Passer à la musique suivante')
        .setContexts(0).setIntegrationTypes(0),
    category: 'music',
    async execute(interaction) {
        if (!interaction.client.config.modules['music'].enabled) return interaction.reply({ content: '> ❌ Le module musique est désactivé.' });
        await interaction.deferReply();

        let voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig');
        if (voiceconfig?.voiceconfig?.type !== 'music') {
            return interaction.editReply('> ❌ Aucune musique en cours de lecture.');
        }

        let player = interaction.client.players.get(interaction.guild.id);
        if (!player) {
            return interaction.editReply('> ❌ Le lecteur vocal est introuvable.');
        }

        player.stop();
        await interaction.editReply('> ⏭️ **Musique passée!**');
    }
};
