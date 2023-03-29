// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
var internetradio = require('node-internet-radio');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Quelle chanson est en cours de lecture ?'),
        category: 'music',
    async execute(interaction){
        if(!interaction.client.config.modules['radio'].enabled) return interaction.reply({ content: '> ❌ Le module radio est désactivé.'});
        await interaction.deferReply();
        // search title artist and cover of the song

        const avatar = interaction.client.user.displayAvatarURL();
        const botname = interaction.client.user.username;

        const connection = getVoiceConnection(interaction.guild.id);
        if(!connection){
            await interaction.editReply('> Je ne suis pas dans un salon vocal');
        } else {
            // show in a embed message that the bot is playing
            var radio = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('radio'); // get the radio from the database
            radio = radio?.radio;
            
            if(radio?.url) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: botname, iconURL: avatar })
                    .setTitle('📻 ' + radio.name)
                    .setURL(radio.website)
                    .setDescription(`[[🎵 Flux](${radio.url})] | [[📻 Site web](${radio.website})]${radio?.description ? ' | ' + radio.description : ''}`)
                    .addFields(
                        { name: '🌍 Pays', value: `${radio.country}${radio.state ? ` (${radio.state})` : ''}`, inline: true },
                        { name: '🗣️ Langue', value: radio.language, inline: true },
                        { name: '👍 Votes', value: radio.votes.toString(), inline: true },
                        { name: '🎶 Genres', value: radio.genres, inline: true }
                    )
                    .setThumbnail(radio.logo)
                    .setTimestamp()
                    .setColor(Math.floor(Math.random()*16777215).toString(16))
                    .setFooter({ text: botname, iconURL: avatar });
                // show in a embed message that the bot is playing
                await interaction.editReply({ embeds: [embed] });
                try{
                    // get the stream metadata with the stream url
                    console.log('[INFO] Searching for metadata on the radio ' + radio.name)
                    internetradio.getStationInfo(radio.url, async function(err, stationInfo) {
                        if(err) {
                            console.log('[ERROR] Impossible to get the title and the artist of the song on the radio ' + radio.name)
                            console.log(err)
                            console.log('--------------------------------')
                        } else {
                            console.log(stationInfo);
                            var radio1 = {};
                            // get the title and separate the title and the artist
                            if(stationInfo?.title) {
                                if(stationInfo?.title?.includes(' - ')) {
                                    radio1.title = stationInfo?.title.split(' - ')[1];
                                    radio1.artist = stationInfo?.title.split(' - ')[0];
                                } else {
                                    radio1.title = stationInfo?.title;
                                    radio1.artist = 'Inconnu';
                                }
                            }
                            let updated = false;
                            if((!radio1?.title || radio1?.title?.length == 0) && (!radio1?.artist || radio1?.artist?.length == 0)){
                                console.log('[INFO] Impossible to get the title and the artist of the song on the radio ' + radio.name)
                            } else {
                                if(!radio1?.title || radio1?.title?.length == 0) radio1.title = 'Inconnu';
                                if(!radio1?.artist || radio1?.artist?.length == 0) radio1.artist = 'Inconnu';

                                console.log(`[INFO] Now playing on ${radio.name} : ${radio1.title} by ${radio1.artist}`);
                                // Modify the embed message to show the title and the artist
                                embed
                                    .addFields(
                                        { name: '🎵 Titre', value: radio1.title, inline: true },
                                        { name: '😀 Artiste', value: radio1.artist, inline: true },
                                    );
                                updated = true;
                            }
                            if(updated) await interaction.editReply({ embeds: [embed] });
                            if(radio1?.title != "Inconnu" && radio1?.artist != "Inconnu"){
                                // search the cover of the song
                                // `https://musicbrainz.org/ws/2/recording/?query=recording:"${radio1.title}"%20AND%20artist:"${radio1.artist}"%20AND%20status:official&fmt=json&limit=1`
                                // with headers : { 'User-Agent': 'OmegaBot/5.0' }
                                let ids = [];
                                try{
                                    console.log('[INFO] Searching for the cover of the song on the radio ' + radio.name)
                                    const response = await fetch(`https://musicbrainz.org/ws/2/recording/?query=recording:"${radio1.title}"%20AND%20artist:"${radio1.artist}"%20AND%20status:official&fmt=json`, { headers: { 'User-Agent': 'OmegaBot/5.0' } });
                                    const data = await response.json();
                                    if(data?.recordings?.length > 0){
                                        for(const recording of data?.recordings){
                                            if(recording?.releases?.length > 0){
                                                for(const release of recording.releases){
                                                    if(release?.title == recording.title){
                                                        ids.push(release.id);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } catch (error){
                                    console.log('[ERROR] Impossible to get the cover of the song on the radio ' + radio.name)
                                    console.log(error)
                                    console.log('--------------------------------')
                                }
                                if(ids.length > 0) console.log('[INFO] Found ' + ids.length + ' id(s) to get the cover of the song on the radio ' + radio.name)
                                else console.log('[INFO] No id found to get the cover of the song on the radio ' + radio.name);
                                let cover = false;
                                if(ids.length > 0){
                                    for(const id of ids){
                                        try{
                                            console.log('[INFO] Searching for the cover of the song on the radio ' + radio.name)
                                            // https://coverartarchive.org/release/${id}
                                            const response = await fetch(`https://coverartarchive.org/release/${id}`);
                                            const data = await response.json();
                                            if(data?.images?.length > 0){
                                                const image = data.images[0];
                                                if(image?.thumbnails?.large){
                                                    cover = image.thumbnails.large;
                                                } else if(image?.thumbnails?.small){
                                                    cover = image.thumbnails.small;
                                                }
                                            }
                                        } catch (error){
                                            console.log('[ERROR] Impossible to get the cover of the song on the radio ' + radio.name)
                                            console.log(error)
                                            console.log('--------------------------------')
                                        }
                                        if(cover) break;
                                    }
                                }
                                if(cover){
                                    console.log('[INFO] Cover of the song found on the radio ' + radio.name);
                                    embed
                                    .setThumbnail(cover)
                                    .setAuthor({ name: botname, iconURL: radio.logo })
                                    await interaction.editReply({ embeds: [embed] });
                                }
                                if(!cover){
                                    console.log('[INFO] Impossible to get the cover of the song on the radio ' + radio.name)
                                }
                            }
                        }
                    });
                } catch (error){
                    console.log('[INFO] Impossible to get the title and the artist of the song on the radio ' + radio.name)
                    console.log(error)
                    console.log('--------------------------------')
                }
            } else {
                await interaction.editReply("> ❌ Aucune radio n'est en cours de lecture.");
            }
        }
    }
};