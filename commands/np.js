// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
var internetradio = require('node-internet-radio');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Quelle chanson est en cours de lecture ?')
        .setContexts(0).setIntegrationTypes(0),
    category: 'music',
    ratelimit: true,
    async execute(interaction) {
        await interaction.deferReply();
        // search title artist and cover of the song

        const avatar = interaction.client.user.displayAvatarURL();
        const botname = interaction.client.user.username;

        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            await interaction.editReply('> ❌ Je ne suis pas dans un salon vocal');
            return;
        }

        var voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig radio music');

        let type = voiceconfig?.voiceconfig?.type || 'none';

        if (type === 'music') {
            if (!interaction.client.config.modules['music'].enabled) return interaction.editReply({ content: '> ❌ Le module musique est désactivé.' });

            let currentMusic = voiceconfig.music;
            if (!currentMusic || !currentMusic.url) return interaction.editReply({ content: '> ❌ Aucune musique en cours.' });

            const embed = new EmbedBuilder()
                .setAuthor({ name: botname, iconURL: avatar })
                .setTitle('🎶 ' + currentMusic.title)
                .setURL(currentMusic.url)
                .setDescription(`Demandé par **${currentMusic.requester}**`)
                .setTimestamp()
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setFooter({ text: botname, iconURL: avatar });

            if (currentMusic.thumbnail) embed.setThumbnail(currentMusic.thumbnail);

            await interaction.editReply({ embeds: [embed] });

        } else if (type === 'radio') {
            if (!interaction.client.config.modules['radio'].enabled) return interaction.reply({ content: '> ❌ Le module radio est désactivé.' });

            var radio = voiceconfig?.radio;
            if (radio?.url) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: botname, iconURL: avatar })
                    .setTitle('📻 ' + radio.name)
                    .setURL(radio.website)
                    .setDescription(`[[🎵 Flux](${radio.url})] | [[📻 Site web](${radio.website})]${radio?.description ? ' | ' + radio.description : ''}`)
                    .addFields(
                        { name: '🌍 Pays', value: `${radio.country}${radio.state ? ` (${radio.state})` : ''}`, inline: true },
                        { name: '🗣️ Langue', value: (radio.language.length > 0) ? radio.language : "Pas de langue", inline: true },
                        { name: '👍 Votes', value: radio.votes.toString(), inline: true },
                        { name: '🎶 Genres', value: radio.genres, inline: true }
                    )
                    .setThumbnail(radio.logo)
                    .setTimestamp()
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setFooter({ text: botname, iconURL: avatar });

                await interaction.editReply({ embeds: [embed] });

                try {
                    internetradio.getStationInfo(radio.url, async function (err, stationInfo) {
                        if (err) return;
                        var radio1 = {};
                        if (stationInfo?.title) {
                            if (stationInfo?.title?.includes(' - ')) {
                                radio1.title = stationInfo?.title.split(' - ')[1];
                                radio1.artist = stationInfo?.title.split(' - ')[0];
                            } else {
                                radio1.title = stationInfo?.title;
                                radio1.artist = 'Inconnu';
                            }
                        }

                        let updated = false;
                        if ((!radio1?.title || radio1?.title?.length == 0) && (!radio1?.artist || radio1?.artist?.length == 0)) {
                            // ignored
                        } else {
                            if (!radio1?.title || radio1?.title?.length == 0) radio1.title = 'Inconnu';
                            if (!radio1?.artist || radio1?.artist?.length == 0) radio1.artist = 'Inconnu';

                            embed.addFields(
                                { name: '🎵 Titre', value: radio1.title, inline: true },
                                { name: '😀 Artiste', value: radio1.artist, inline: true },
                            );
                            updated = true;
                        }

                        if (updated) await interaction.editReply({ embeds: [embed] });
                    });
                } catch (e) { console.log(e); }
            } else {
                await interaction.editReply("> ❌ Aucune radio n'est en cours de lecture.");
            }
        } else {
            await interaction.editReply("> ❌ Rien n'est en cours de lecture.");
        }
    }
};