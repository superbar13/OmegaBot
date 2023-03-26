// level command module to be used in index.js
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Affiche le niveau global d\'un utilisateur')
    .addUserOption(option => option.setName('utilisateur').setDescription('Utilisateur dont vous voulez voir le niveau')),
    category: 'level',
    async execute(interaction){
        const createbar = interaction.client.modules.createBar.createBar;

        let base = interaction.client.config.modules['levels'].addedconfig.base;
        let xpPerMessage = interaction.client.config.modules['levels'].addedconfig.xpPerMessage;
        let goalMultiplier = interaction.client.config.modules['levels'].addedconfig.goalMultiplier;

        // get the user
        let user = interaction.options.getUser('utilisateur');
        if(!user){
            user = interaction.user;
        }
        // get the user model
        const userModel = await interaction.client.usersdb.findOne({ id: user.id });
        if(!userModel){
            await interaction.reply('> ❌ Une erreur est survenue');
            return;
        }
        const avatar = interaction.client.user.displayAvatarURL();
        const botname = interaction.client.user.username;
        // create embed
        let XPtoNextLevel = Math.floor(goalMultiplier * Math.pow(base, userModel.levels.level));
        const embed = new EmbedBuilder()
        .setTitle('🤩 Niveau Global de ' + user.username + ' 🤩')
        .setDescription(createbar({value: userModel.levels.xp, max: XPtoNextLevel}))
        .addFields(
            { name: '🔰 Niveau', value: userModel.levels.level.toString(), inline: true },
            { name: '💫 XP', value: (userModel.levels.xp + '/' + XPtoNextLevel).toString(), inline: true },
        )
        .setFooter({ text: botname, iconURL: avatar })
        .setColor(Math.floor(Math.random()*16777215).toString(16))
        .setTimestamp()
        .setImage('https://cdn.discordapp.com/attachments/909475569459163186/1077679404240613396/bluebar.gif')
        // user avatar (and in full 4K and gif)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        try{
            await interaction.reply({ embeds: [embed] });
        }catch(err){
            await interaction.reply('> ❌ Une erreur est survenue');
            console.log(err);
        }
    }
}