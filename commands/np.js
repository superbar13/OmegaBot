// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
var internetradio = require('node-internet-radio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Quelle chanson est en cours de lecture ?'),
        category: 'music',
    async execute(interaction){
        await interaction.deferReply();
        // search title artist and cover of the song

        const avatar = interaction.client.user.displayAvatarURL();
        const botname = interaction.client.user.username;

        const connection = getVoiceConnection(interaction.guild.id);
        if(!connection){
            await interaction.editReply('Je ne suis pas dans un salon vocal');
        } else {
            // show in a embed message that the bot is playing
            var radio = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('radio'); // get the radio from the database
            radio = radio?.radio;
            var radio1 = {};
            
            let messagesended = false;
            if(radio?.url) {
                try{
                    // get the stream metadata with the stream url
                    console.log('[INFO] Searching for metadata on the radio ' + radio.name)
                    internetradio.getStationInfo(radio.url, async function(err, stationInfo) {
                        if(err) {
                            console.log('[ERROR] Cannot get the stream metadata')
                            console.log(err)
                            console.log('--------------------------------')
                        } else {
                            // get the title
                            responseString = stationInfo.title;
                            // log the title to the console
                            // separate the title and the artist
                            radio1.title = responseString.split(' - ')[1]
                            radio1.artist = responseString.split(' - ')[0]
                            
                            console.log('[INFO] Now playing on ' + radio.name + ' : ' + radio1.title + ' by ' + radio1.artist);

                            if(!radio1?.title || radio1?.title == undefined || radio1?.title == null || radio1?.title?.length == 0){
                                radio1.title = 'Inconnu';
                            } else {
                                if(!radio1?.artist || radio1?.artist == undefined || radio1?.artist == null || radio1?.artist?.length == 0){
                                    radio1.artist = 'Inconnu';
                                } else {
                            
                                    // show in a embed message that the bot is playing
                                    const embed = new EmbedBuilder()
                                        .setAuthor({ name: botname, iconURL: avatar })
                                        .setTitle(radio.name)
                                        .setURL(radio.website)
                                        .setDescription(radio.name + ' est en train de jouer' + '\n' + `Ces genres sont disponibles : ${radio.genres}` + '\n' + `Pays : ${radio?.country} (${radio?.state})` + '\n' + `Langue : ${radio?.language} | Votes : ${radio?.votes}`)
                                        .addFields(
                                            { name: '🎵 Titre', value: radio1.title, inline: true },
                                            { name: '😀 Artiste', value: radio1.artist, inline: true },
                                        )
                                        .setThumbnail(radio.logo)
                                        .setTimestamp()
                                        .setColor(interaction.client.embedcolor)
                                        .setFooter({ text: botname, iconURL: avatar });
                                    await interaction.editReply({ embeds: [embed] });

                                    messagesended = true;
                                }
                            }
                        }
                    });
                } catch (error){
                    console.log('[INFO] Impossible de se connecter au flux radio pour récupérer les informations de la radio.')
                    console.log(error)
                }

                // wait 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));
                if(messagesended == false) {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: botname, iconURL: avatar })
                        .setTitle(radio.name)
                        .setURL(radio.website)
                        .setDescription(radio.name + ' est en train de jouer' + '\n' + `Ces genres sont disponibles : ${radio.genres}` + '\n' + `Pays : ${radio?.country} (${radio?.state})` + '\n' + `Langue : ${radio?.language} | Votes : ${radio?.votes}`)
                        .setThumbnail(radio.logo)
                        .setTimestamp()
                        .setColor(interaction.client.embedcolor)
                        .setFooter({ text: botname, iconURL: avatar });
                    await interaction.editReply({ embeds: [embed] });
                    messagesended = true;
                }
            } else {
                await interaction.editReply('Aucune radio n\'est en cours de lecture.');
            }
        }
    }
};