const fetch = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trumptweet')
        .setDescription('Fait un tweet de Trump')
        .addStringOption(option => option
            .setName('text')
            .setDescription('Le texte du tweet')
            .setRequired(true)
        ),
    category: 'fun',
    ratelimit: true,
    async execute(interaction){
        await interaction.deferReply();

        // retrouve le texte du tweet
        const text = interaction.options.getString('text');

        // fetch the image
        const response = await fetch(`https://nekobot.xyz/api/imagegen?type=trumptweet&text=${text}`);
        const json = await response.json();
        const image = json.message;

        // envoie le tweet dans un embed
        const embed = new EmbedBuilder()
        .setTitle('🐦 Tweet de Trump 🐦')
        .setDescription(`**Texte:** ${text}`)
        .setColor(interaction.client.modules.randomcolor.getRandomColor())
        .setTimestamp()
        .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
        .setImage(image);
        try{
            await interaction.editReply({ embeds: [embed] });
        } catch(err){
            await interaction.reply('> ❌ Une erreur est survenue');
            console.log(err);
        }
    }
};