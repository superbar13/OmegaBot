const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { translate } = require('@vitalets/google-translate-api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Traduit un texte')
        .addStringOption(option => option
            .setName('text')
            .setDescription('Le texte a traduire')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('lang')
            .setDescription('La langue de destination')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('from')
            .setDescription('La langue de départ')
            .setRequired(false)
        ),
    category: 'basic',
    ratelimit: true,
    async execute(interaction){
        await interaction.deferReply();

        // retrouve le texte
        const text = interaction.options.getString('text');
        // retrouve la langue de destination
        const lang = interaction.options.getString('lang');
        // retrouve la langue de départ
        const from = interaction.options.getString('from');

        // traduit le texte
        let translated;
        if(!from) translated = await translate(text, { to: lang });
        else translated = await translate(text, { from: from, to: lang });
        if(!translated || !translated?.text) return await interaction.editReply('> ❌ Une erreur est survenue, vérifiez que la langue est correcte (ex: fr, en, es, ...)');
        translated = translated.text;
        // envoie le résultat
        const embed = new EmbedBuilder()
        .setTitle('Traduction')
        .setDescription(`**Texte:** ${text}\n**Traduction:** ${translated}`)
        .setColor(interaction.client.modules.randomcolor.getRandomColor())
        .setTimestamp()
        .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });
        try{
            await interaction.editReply({ embeds: [embed] });
        } catch(err){
            await interaction.reply('> ❌ Une erreur est survenue');
            console.log(err);
        }
    }
};