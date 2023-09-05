// rank command module to be used in index.js (but it's for guilds)
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Affiche le niveau sur le serveur d\'un utilisateur')
        .addUserOption(option => option.setName('utilisateur').setDescription('Utilisateur dont vous voulez voir le niveau sur le serveur'))
        .setDMPermission(false),
    category: 'level',
    telegram: 'disabled',
    async execute(interaction){
        if(!interaction.client.config.modules['levels'].enabled) return interaction.reply({ content: '> ❌ Le module est désactivé.'});
        
        const createbar = interaction.client.modules.createBar.createBar;

        let base = interaction.client.config.modules['levels'].addedconfig.base;
        let xpPerMessage = interaction.client.config.modules['levels'].addedconfig.xpPerMessage;
        let goalMultiplier = interaction.client.config.modules['levels'].addedconfig.goalMultiplier;

        // get the user
        let user = interaction.options.getUser('utilisateur');
        if(!user){
            user = interaction.user;
        }
        // get the server model
        const serverModel = await interaction.client.serversdb.findOne({ id: interaction.guild.id });
        if(!serverModel){
            await interaction.reply('> ❌ Une erreur est survenue');
            return;
        }
        // find the user in the server model
        const userInServer = serverModel.users.find(userInServer => userInServer.id === user.id);
        if(!userInServer){
            await interaction.reply('> ❌ Une erreur est survenue');
            return;
        }
        const avatar = interaction.client.user.displayAvatarURL();
        const botname = interaction.client.user.username;
        // create embed
        let XPtoNextLevel = Math.floor(goalMultiplier * Math.pow(base, userInServer.levels.level));
        const embed = new EmbedBuilder()
        .setTitle('🤩 Rank sur ' + interaction.guild.name + ' de ' + user.username + ' 🤩')
        .setDescription(createbar({value: userInServer.levels.xp, max: XPtoNextLevel}))
        .addFields(
            { name: '🔰 Niveau', value: userInServer.levels.level.toString(), inline: true },
            { name: '💫 XP', value: (userInServer.levels.xp + '/' + XPtoNextLevel).toString(), inline: true },
        )
        .setFooter({ text: botname, iconURL: avatar })
        .setColor(interaction.client.modules.randomcolor.getRandomColor())
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