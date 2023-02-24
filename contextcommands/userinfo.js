// ping command module to be used in index.js
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('User Info')
        .setType(ApplicationCommandType.User),
    async execute(interaction){
        // get the option value
        const user = interaction.user;
        // create embed
        const embed = new EmbedBuilder()
        .setTitle('😁 ' + user?.tag)
        .setDescription(user.toString())
        .addFields(
            { name: '🖋 Tag', value: user?.tag.toString(), inline: true },
            { name: '📌 Nickname', value: interaction.guild?.members.cache.find(member => member.id === user?.id)?.nickname?.toString() || 'Aucun', inline: true },
            { name: '🔎 ID', value: user?.id.toString(), inline: true },
            { name: '❓ Activité', value: user?.presence?.activities || 'Aucune', inline: true },
            { name: '🎯 Statut', value: user?.presence?.status?.toString() || 'Aucun', inline: true },
            { name: '🔰 Création', value: moment(user?.createdAt).format('DD/MM/YYYY à HH:mm:ss').toString(), inline: true },
            { name: '🤖 Bot', value: user?.bot ? 'Oui' : 'Non', inline: true },
            { name: '🪐 Avatar', value: `[Lien](${user?.displayAvatarURL({ dynamic: true, size: 4096 })})`, inline: true },
            { name: '🌟 Nitro', value: user?.premiumSince ? 'Oui' : 'Non', inline: true },
            { name: '🎈 Roles', value: interaction.guild?.members.cache.find(member => member.id === user?.id)?.roles.cache.size.toString() || 'Aucun', inline: true },
            { name: '🧭 Flags', value: user?.flags?.toArray().length > 0 ? user?.flags?.toArray().join(', ') : 'Aucun', inline: false },
        )
        .setThumbnail(user?.displayAvatarURL())
        .setColor(Math.floor(Math.random()*16777215).toString(16))
        .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
};