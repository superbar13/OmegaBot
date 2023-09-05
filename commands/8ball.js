const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Pose une question a la boule magique')
        .addStringOption(option => option
            .setName('question')
            .setDescription('La question que vous voulez poser')
            .setRequired(true)
        ),
    category: 'fun',
    async execute(interaction){
        await interaction.deferReply();
        // retrouve la question
        const question = interaction.options.getString('question');
        // liste des réponses
        const responses = [
            'peut-être',
            'peut-être pas',
            'oui',
            'non',
            'probablement',
            'probablement pas',
            'absolument',
            'absolument pas',
            'clairement',
            'clairement pas',
            'pas du tout',
            'sans aucun doute',
            'sûrement',
            'sûrement pas',
            'Evidemment',
            'Evidemment pas',
            'certainement',
            'certainement pas',
            'je ne sais pas',
            'je ne sais pas du tout',
            'en réalité je répond a cette question depuis les toilettes',
            'en réalité je répond au hasard, j\'en sais rien peu importe la question',
            'eh bien, je ne sais pas quoi répondre',
            'tu te fous de moi ?',
            'Euuuuu... flemme de répondre, tu crois que j\'ai que ça a faire ?',
            'Si tu veux une réponse, demande a quelqu\'un d\'autre que moi',
            'Je suis choqué que tu me poses cette question, choqué je te dis',
            'Eh bien, tu en as des questions toi',
        ];
        // choisi une réponse au hasard
        const response = responses[Math.floor(Math.random() * responses.length)];
        // envoie la réponse dans un embed
        const embed = new EmbedBuilder()
        .setTitle('🎱 8ball 🎱')
        .setDescription(`**Question:** ${question}\n**Réponse:** ${response}`)
        .setColor(interaction.client.modules.randomcolor.getRandomColor())
        .setTimestamp()
        .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
        .setThumbnail('https://cdn.discordapp.com/attachments/909475569459163186/1125178922301128734/480px-Magic_eight_ball.png');
        try{
            await interaction.editReply({ embeds: [embed] });
        }catch(err){
            await interaction.editReply('> ❌ Une erreur est survenue');
            console.log(err);
        }
    }
};