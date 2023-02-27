// ping command module to be used in index.js

const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');
var internetradio = require('node-internet-radio');
const { countryCodeEmoji, emojiCountryCode } = require('country-code-emoji');
const {PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Joue la radio de votre choix')
        // add options radio required for the command
        .addSubcommand(subcommand => 
            subcommand.setName('radio')
                .setDescription('Joue la radio de votre choix')
                .addStringOption(option => option.setName('radio').setDescription('Nom de la radio').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('music')
                .setDescription('Joue la musique de votre choix')
                .addStringOption(option => option.setName('music').setDescription('Nom de la musique').setRequired(true))),
    category: 'music',
    async execute(interaction){
        if(!interaction.client.config.modules['radio'].enabled) return interaction.reply({ content: '> ❌ Le module radio est désactivé.'});
        await interaction.deferReply();
        // check in the db if only admin can use the command
        var voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig'); // get the voiceconfig from the database
        voiceconfig = voiceconfig?.voiceconfig;
        if ((voiceconfig?.adminonly || false) == true && !interaction?.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.editReply({ content: '> ❌ Seul un administrateur peut utiliser cette commande.', ephemeral: true });
            return;
        }
        if(!interaction?.member?.voice?.channel?.id){
            await interaction.editReply('> ❌ Vous devez être dans un salon vocal');
            return;
        }
        try{
            const avatar = interaction.client.user.displayAvatarURL();
            const botname = interaction.client.user.username;

            //////////// CHOIX DE LA RADIO ////////////

            // get command radio args
            let radio123 = interaction.options.getString('radio');

            let radio = {};
            // check if the argument is a url
            if(radio123.includes('http')) {
                radio.url = radio123;
                radio.name = 'Radio personnalisée';
                radio.id = 'custom';
                radio.logo = avatar;
                radio.website = radio123;
                radio.description = 'Cette radio est une radio personnalisée, c\'est fou non ?';
                radio.genres = 'Aucun genre';
                radio.country = 'InconnuLand';
                radio.state = 'Perpète-les-Olivettes';
                radio.language = 'Terrien';
                radio.votes = '123456789';
                try{
                    await interaction.client.serversdb.bulkWrite([
                        interaction.client.bulkutility.setField({
                            'id': interaction.guild.id
                        }, {
                            'radio': radio,
                            'voiceconfig.channelId': interaction.member.voice.channel.id,
                            'voiceconfig.guildId': interaction.guild.id
                        })
                    ])
                }catch(err){
                    console.log(err);
                }
            } else {
                // use nodejs to search for the radio via radio.fr api ex : https://www.radio.fr/_next/data/Bhm34Nevnn5cxe6kgyzOA/fr-FR/search.json?q=${QUERY}
                let options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: radio123,
                        limit: 25,
                        order: "clickcount",
                        hidebroken: "true",
                        reverse: "true",
                    })
                }
                let result = await fetch(`https://nl1.api.radio-browser.info/json/stations/search`, options).then(res => res.json());

                // get the first result ex : x.pageProps.data.stations.playables[0].id (id of the radio)
                // check if there are results
                if(result.length > 0){
                    // list of radios to choose from discord list interaction
                    let radios = [];
                    // loop through the results to get the radios name and id
                    result.forEach(radio => {
                        if(radios.length < 25){
                            // get flag of the country
                            let description = `Langue : ${radio?.language} | Votes : ${radio?.votes} | Genres : ${radio?.tags}`;
                            // if description is too long (max 100 characters)
                            if(description.length > 90){
                                description = description.substring(0, 90) + '...';
                            }
                            let label = radio.name + ' -> ' + radio?.country + ` (${radio?.state})`;
                            // if label is too long (max 100 characters)
                            if(label.length > 90){
                                label = label.substring(0, 90) + '...';
                            }
                            // flag unicode with country code
                            let flag;
                            try{
                                flag = countryCodeEmoji(radio?.countrycode);
                            } catch (e) {
                                flag = '🌐';
                            }
                            // if flag is not found
                            if(!flag || flag == undefined || flag.length == 0){
                                flag = '🌐';
                            }

                            radios.push({
                                label: label,
                                description: description,
                                value: radio.stationuuid,
                                emoji: {
                                    name: flag,
                                }
                            })

                        } else {
                            return;
                        }
                    });

                    // create a list of radios to choose from
                    compoment = new SelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Clique ici pour choisir !');
                    
                    for(let i = 0; i < radios.length; i++){
                        try{
                            compoment.addOptions(radios[i]);
                        } catch(e){
                            console.log(e);
                            let corrected = radio[i].emoji = {
                                name: '🌐',
                            }
                            compoment.addOptions(corrected);
                        }
                    }
                    
                    const row = new ActionRowBuilder()
                        .addComponents(
                            compoment
                        );

                    // send the list of radios to choose from
                    await interaction.editReply({ content: '> ✅ Choisissez une radio parmis les résultats pour la recherche : ' + radio123, components: [row] });

                    // wait for the user to choose a radio
                    const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
                    // get the user choice in variable radio and get the radio infos

                    let collectorfinished = false;
                    let resultcollector = null;
                    collector.on('collect', async i => {
                        if (i.customId === 'select') {
                            resultcollector = result.find(radio => radio.stationuuid === i.values[0]);
                            collectorfinished = true;
                            await interaction.editReply({ content: '> ✅ Vous avez choisi la radio ' + resultcollector.name + ', Chargement en cours...', components: [] });
                        }
                    });
                    // if the user doesn't choose a radio in 15 seconds
                    collector.on('end', async collected => {
                        // if the user didn't choose a radio
                        if(!radio.id){
                            // send a message to the user
                            await interaction.editReply({ content: '> ❌ Vous n\'avez pas choisi de radio', components: [] });
                            return;
                        }
                        collectorfinished = true;
                    });
                    
                    // wait until the user choose a radio
                    while(!collectorfinished){
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    // filter the radio infos to get the selected radio infos (collector result)
                    const toTitleCase = (phrase) => {
                        return phrase
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                    };
                    // but in format like 'text'.toTitleCase()
                    String.prototype.toTitleCase = function () {
                        return toTitleCase(this);
                    };
                    radio200 = resultcollector;
                    radio.name = radio200.name;
                    radio.id = radio200.stationuuid;
                    // test radio.logo
                    if(radio200.favicon){
                        radio.logo = radio200.favicon;
                    } else {
                        radio.logo = avatar;
                    }
                    // get radio genres and parse it to a string
                    genres = radio200.tags
                    if(genres && genres.length > 0){
                        radio.genres = genres.split(',').join(', ').toTitleCase();
                    } else {
                        radio.genres = 'Aucun genre';
                    }

                    let result2 = resultcollector;
                    if(result2) {
                        // get the stream url ex : x.pageProps.data.broadcast.streams[0].url
                        radio.url = result2.url_resolved
                        if(radio.website) {
                            radio.website = result2.homepage
                        } else {
                            radio.website = radio.url;
                        }
                        radio.country = result2.country;
                        radio.state = result2.state;
                        radio.language = result2.language.toTitleCase();
                        radio.votes = result2.votes;
                        // save the radio in the database
                        try{
                            await interaction.client.serversdb.bulkWrite([
                                interaction.client.bulkutility.setField({
                                    'id': interaction.guild.id
                                }, {
                                    'radio': radio,
                                    'voiceconfig.channelId': interaction.member.voice.channel.id,
                                    'voiceconfig.guildId': interaction.guild.id,
                                })
                            ])
                        }catch(err){
                            console.log(err);
                        }
                    } else {
                        // if the radio doesn't have a stream url
                        await interaction.editReply({ content: '> ❌ La radio ' + radio.name + ' n\'a pas de flux audio ?!', components: [] });
                        return;
                    }
                } else {
                    // if there are no results
                    await interaction.editReply('> ❌ Aucune radio trouvée');
                    return;
                }
            }

            // guild, info, client
            let info = {
                radio: radio,
            }

            //////////////////////////////// PLAY THE RADIO ////////////////////////////////
            let playing = interaction.client.modules.radio.radioLoad(interaction.guild, info, interaction.client);
            if(!playing){
                if(interaction) await interaction.editReply('> ❌ Une erreur est survenue lors de la lecture de la radio ' + radio.name);
            }
            ///////////////////////////////////////////////////////////////////////////////////

            let embed = new EmbedBuilder()
                .setAuthor({ name: botname, iconURL: avatar })
                .setTitle('📻 ' + radio.name)
                .setURL(radio.website)
                .setDescription(`Radio Lancée !\n[[🎵 Flux](${radio.url})] | [[📻 Site web](${radio.website})]${radio?.description ? ' | ' + radio.description : ''}`)
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
                        if(stationInfo.headers) {
                            if(radio.name == "Radio personnalisée") {
                                console.log('[INFO] Searching for the radio name and the genres in the headers')
                                if(stationInfo.headers['icy-name']) {
                                    radio.name = stationInfo.headers['icy-name'];
                                    console.log(`[INFO] Found the radio name : ${radio.name}`)
                                    embed.setTitle('📻 ' + radio.name);
                                    updated = true;
                                    try{
                                        await interaction.client.serversdb.bulkWrite([
                                            interaction.client.bulkutility.setField({
                                                'id': interaction.guild.id
                                            }, {
                                                'radio.name': radio.name
                                            })
                                        ])
                                    }catch(err){
                                        console.log(err);
                                    }
                                }
                            }
                            if(radio?.genres?.length == 0 || !radio?.genres || radio?.genres == 'Aucun genre') {
                                if(stationInfo.headers['icy-genre']) {
                                    radio.genres = stationInfo.headers['icy-genre'];
                                    console.log(`[INFO] Found the radio genres : ${radio.genres}`)
                                    embed.data.fields[3].value = radio.genres;
                                    updated = true;
                                    try{
                                        await interaction.client.serversdb.bulkWrite([
                                            interaction.client.bulkutility.setField({
                                                'id': interaction.guild.id
                                            }, {
                                                'radio.genres': radio.genres
                                            })
                                        ])
                                    }catch(err){
                                        console.log(err);
                                    }
                                }
                            }
                            if(stationInfo.headers['icy-description']) {
                                radio.description = stationInfo.headers['icy-description'];
                                console.log(`[INFO] Found the radio description : ${radio.description}`)
                                embed.setDescription(`Radio Lancée !\n[[🎵 Flux](${radio.url})] | [[📻 Site web](${radio.website})]${radio?.description ? ' | ' + radio.description : ''}`);
                                updated = true;
                                try{
                                    await interaction.client.serversdb.bulkWrite([
                                        interaction.client.bulkutility.setField({
                                            'id': interaction.guild.id
                                        }, {
                                            'radio.description': radio.description
                                        })
                                    ])
                                }catch(err){
                                    console.log(err);
                                }
                            }
                        }
                        if((!radio1?.title || radio1?.title?.length == 0) && (!radio1?.artist || radio1?.artist?.length == 0)) {
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
                            let id = false;
                            try{
                                console.log('[INFO] Searching for the cover of the song on the radio ' + radio.name)
                                const response = await fetch(`https://musicbrainz.org/ws/2/recording/?query=recording:"${radio1.title}"%20AND%20artist:"${radio1.artist}"%20AND%20status:official&fmt=json&limit=1`, { headers: { 'User-Agent': 'OmegaBot/5.0' } });
                                const data = await response.json();
                                if(data?.recordings?.length > 0){
                                    const recording = data.recordings[0];
                                    if(recording?.releases?.length > 0){
                                        for(const release of recording.releases){
                                            if(release?.title == recording.title){
                                                id = release.id;
                                                console.log('[INFO] ID of the song found on the radio ' + radio.name);
                                                break;
                                            }
                                        }
                                    }
                                }
                            } catch (error){
                                console.log('[ERROR] Impossible to get the cover of the song on the radio ' + radio.name)
                                console.log(error)
                                console.log('--------------------------------')
                            }
                            let cover = false;
                            if(id){
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
        } catch (error){
            //stream.destroy();
            console.log('Audio player is stopped');
            await interaction.editReply('> ❌ Une erreur est survenue, veuillez réessayer');
            console.log(error);
            try{
                await interaction.client.serversdb.bulkWrite([
                    interaction.client.bulkutility.setField({
                        'id': interaction.guild.id
                    }, {
                        'voiceconfig.playing': false,
                        'voiceconfig.type': 'none'
                    })
                ])
            } catch(err) {
                console.log(err);
            }
        }
    }
};