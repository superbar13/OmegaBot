const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Affiche la file d\'attente musicale')
        .setDMPermission(false),
    category: 'music',
    async execute(interaction) {
        if (!interaction.client.config.modules['music'].enabled) return interaction.reply({ content: '> ❌ Le module musique est désactivé.' });
        await interaction.deferReply();

        let voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig queue music');
        let queue = voiceconfig?.queue || [];
        let currentMusic = voiceconfig?.music;

        if (!currentMusic?.url && queue.length === 0) {
            return interaction.editReply('> ❌ Aucune musique dans la file d\'attente.');
        }

        let description = '';
        if (currentMusic?.url) {
            description += `**En cours de lecture:**\n▶️ [${currentMusic.title}](${currentMusic.url}) - Demandé par ${currentMusic.requester}\n\n`;
        }

        if (queue.length > 0) {
            description += `**À suivre:**\n`;
            for (let i = 0; i < Math.min(queue.length, 10); i++) {
                description += `\`${i + 1}.\` [${queue[i].title}](${queue[i].url}) - Demandé par ${queue[i].requester}\n`;
            }
            if (queue.length > 10) {
                description += `\n*...et ${queue.length - 10} autres.*`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🎶 File d\'attente')
            .setDescription(description)
            .setColor(interaction.client.modules.randomcolor.getRandomColor());

        await interaction.editReply({ embeds: [embed] });
    }
};
