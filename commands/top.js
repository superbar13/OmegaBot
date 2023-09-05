// rank command module to be used in index.js (but it's for guilds)
const { EmbedBuilder, ButtonStyle } = require('discord.js');
const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Affiche le top serveur ou global')
    // subcommands
    .addSubcommand(subcommand => subcommand
        .setName('serveur')
        .setDescription('Affiche le top serveur')
        .addIntegerOption(option => option.setName('page').setDescription('Page du top serveur').setRequired(false))
    )
    .addSubcommand(subcommand => subcommand
        .setName('global')
        .setDescription('Affiche le top global')
        .addIntegerOption(option => option.setName('page').setDescription('Page du top global').setRequired(false))
    ),
    category: 'level',
    async execute(interaction){
        if(!interaction.client.config.modules['levels'].enabled) return interaction.reply({ content: '> ❌ Le module est désactivé.'});

        const createbar = interaction.client.modules.createBar.createBar;

        let base = interaction.client.config.modules['levels'].addedconfig.base;
        let xpPerMessage = interaction.client.config.modules['levels'].addedconfig.xpPerMessage;
        let goalMultiplier = interaction.client.config.modules['levels'].addedconfig.goalMultiplier;

        // get the subcommand
        const subcommand = interaction.options.getSubcommand();
        let embed;
        let sortedUsers;
        if(subcommand === 'serveur'){
            // check if we are in DMs
            if(interaction.channel.type === 'DM') return interaction.reply('> ❌ Vous ne pouvez pas utiliser cette commande en DMs');
            // get the server model
            const serverModel = await interaction.client.serversdb.findOne({ id: interaction.guild.id });
            if(!serverModel) return interaction.reply('> ❌ Une erreur est survenue');
            // sort the users xp and by level + to -
            sortedUsers = serverModel.users.sort((a, b) => b.levels.xp - a.levels.xp).sort((a, b) => b.levels.level - a.levels.level);
            // create embed
            embed = new EmbedBuilder()
            .setTitle('🤩 Top serveur de ' + interaction.guild.name + ' 🤩')
        }else if(subcommand === 'global'){
            // get the users model
            const usersModel = await interaction.client.usersdb.find();
            if(!usersModel) return interaction.reply('> ❌ Une erreur est survenue');
            // sort the users xp and by level + to -
            sortedUsers = usersModel.sort((a, b) => b.levels.xp - a.levels.xp).sort((a, b) => b.levels.level - a.levels.level);
            // remove users with no xp and level
            sortedUsers = sortedUsers.filter(user => !(user.levels.xp === 0 && user.levels.level === 0));
            // create embed
            embed = new EmbedBuilder()
            .setTitle('🤩 Top global 🤩')
        }
        // get the page
        let page = interaction.options.getInteger('page') || 1;
        // 25 users per page
        let perpage = 10;

        function createTop() {
            return sortedUsers.map((user, index) => {
                let xpToNextLevel = Math.floor(goalMultiplier * Math.pow(base, user.levels.level));
                let xp = user.levels.xp;
                let level = user.levels.level;
                let user1; if(interaction.telegram) user1 = client.users.cache.get(user.id);
                return `**${(index + 1) == 1 ? '🥇' : (index + 1) == 2 ? '🥈' : (index + 1) == 3 ? '🥉' : (index + 1)}• ${interaction.telegram ? (user1?.username || '<@'+user.id+'>+') : '<@'+user.id+'>+'}** - Niveau ${level}`
                + (user.id === interaction.user.id ? ' (vous)' : '')
                + `\n ${interaction?.telegram ? createbar({value: xp, max: xpToNextLevel, startchar: '▭', middlechar: '▭', endchar: '▭', pointerchar: '🔘', startcharfilled: '▬', middlecharfilled: '▬', endcharfilled: '▬'}) : createbar({value: xp, max: xpToNextLevel})} ${xp} / ${xpToNextLevel} XP`;
            }).slice((page - 1) * perpage, page * perpage).join('\n')
        }

        embed
            .setDescription(createTop())
            .setFooter({ text: `Page ${page} / ${Math.ceil(sortedUsers.length / perpage)}` })
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setImage('https://cdn.discordapp.com/attachments/909475569459163186/1077679404240613396/bluebar.gif')
        try{
            let components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('top_previous')
                .setLabel('Précédent')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),
                new ButtonBuilder()
                .setCustomId('top_next')
                .setLabel('Suivant')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === Math.ceil(sortedUsers.length / perpage))
            )
            await interaction.reply({ embeds: [embed], components: [components] });

            const filter = i => i.customId === 'top_previous' || i.customId === 'top_next'; 
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if(i.customId === 'top_previous'){
                    // change page
                    page = page - 1;
                    components = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('top_previous')
                        .setLabel('Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                        new ButtonBuilder()
                        .setCustomId('top_next')
                        .setLabel('Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === Math.ceil(sortedUsers.length / perpage))
                    )
                    embed
                    .setDescription(createTop())
                    .setFooter({ text: `Page ${page} / ${Math.ceil(sortedUsers.length / perpage)}` })
                    await i.update({ embeds: [embed], components: [components] });
                }else if(i.customId === 'top_next'){
                    // change page
                    page = page + 1;
                    components = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('top_previous')
                        .setLabel('Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                        new ButtonBuilder()
                        .setCustomId('top_next')
                        .setLabel('Suivant')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === Math.ceil(sortedUsers.length / perpage))
                    )
                    embed
                    .setDescription(createTop())
                    .setFooter({ text: `Page ${page} / ${Math.ceil(sortedUsers.length / perpage)}` })
                    await i.update({ embeds: [embed], components: [components] });
                }
            });

            collector.on('end', async collected => {
                components = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('top_previous')
                    .setLabel('Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                    new ButtonBuilder()
                    .setCustomId('top_next')
                    .setLabel('Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
                )
                await interaction.editReply({ embeds: [embed], components: [components] });
            });

        }catch(err){
            await interaction.reply('> ❌ Une erreur est survenue');
            console.log(err);
        }
    }
}