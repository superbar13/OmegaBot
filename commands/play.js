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
        await interaction.deferReply();
        // check in the db if only admin can use the command
        var voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig'); // get the voiceconfig from the database
        voiceconfig = voiceconfig?.voiceconfig;
        if ((voiceconfig?.adminonly || false) == true && !interaction?.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.editReply({ content: 'Seul un administrateur peut utiliser cette commande.', ephemeral: true });
            return;
        } else {
            if(interaction?.member?.voice?.channel?.id){
                try{
                    let connectioninfo = {
                        channelId: interaction?.member?.voice?.channel?.id,
                        guildId: interaction?.guild?.id,
                        adapterCreator: interaction?.guild?.voiceAdapterCreator
                    }

                    const avatar = interaction.client.user.displayAvatarURL();
                    const botname = interaction.client.user.username;

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
                        radio.description = 'Cette radio est une radio personnalisée';
                        radio.genres = 'Autre';
                        radio.country = 'Inconnu';
                        radio.state = 'Inconnu';
                        radio.language = 'Inconnu';
                        radio.votes = '0';
                        try{
							await interaction.client.serversdb.bulkWrite([
								client.bulkutility.setField({
									'id': interaction.guild.id
								}, {
									'radio': radio
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
                            await interaction.editReply({ content: 'Choisissez une radio parmis les résultats pour la recherche : ' + radio123, components: [row] });

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
                                    await interaction.editReply({ content: 'Vous avez choisi la radio ' + resultcollector.name, components: [] });
                                }
                            });
                            // if the user doesn't choose a radio in 15 seconds
                            collector.on('end', async collected => {
                                // if the user didn't choose a radio
                                if(!radio.id){
                                    // send a message to the user
                                    await interaction.editReply({ content: 'Vous n\'avez pas choisi de radio', components: [] });
                                    return;
                                }
                                collectorfinished = true;
                            });
                            
                            // wait until the user choose a radio
                            while(!collectorfinished){
                                await new Promise(resolve => setTimeout(resolve, 100));
                            }
                            // filter the radio infos to get the selected radio infos (collector result)
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
                                radio.genres = genres;
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
                                radio.language = result2.language;
                                radio.votes = result2.votes;
                                // save the radio in the database
                                try{
                                    await interaction.client.serversdb.bulkWrite([
                                        interaction.client.bulkutility.setField({
                                            'id': interaction.guild.id
                                        }, {
                                            'radio': radio
                                        })
                                    ])
                                }catch(err){
                                    console.log(err);
                                }
                            } else {
                                // if the radio doesn't have a stream url
                                await interaction.editReply({ content: 'La radio ' + radio.name + ' n\'a pas de flux audio', components: [] });
                                return;
                            }
                        } else {
                            // if there are no results
                            await interaction.editReply('Aucune radio trouvée');
                            return;
                        }
                    }

                    let player = interaction.client.players.get(interaction.guild.id);
                    if(player){
                        player.stop();
                        // delete player from the players map
                        interaction.client.players.delete(interaction.guild.id);
                    }
                    player = createAudioPlayer();
                    // save player in the players map
                    interaction.client.players.set(interaction.guild.id, player);
                    async function cr(readableStream) {
                        return createAudioResource(readableStream, {
                            inputType: StreamType.WebmOpus,
                            inlineVolume: true,
                        });
                    }
                    let resource;
                    let streamerror = false;
                    await startplaying();
                    async function startplaying() {
                        response = await fetch(radio.url, {
                            method: 'GET'
                        }).catch(err => {
                            console.log('[ERROR] Cannot fetch the stream')
                            console.log(err)
                            console.log('--------------------------------')
                            streamerror = true;
                        });
                        if(streamerror == false) {
                            // get response music stream and send it to the resource
                            resource = await cr(response.body);
                            player.play(resource);
                            console.log('[INFO] Bot connecté ou reconnecté à la radio ' + radio.name)
                        }
                    }

                    if(streamerror == true){
                        await interaction.editReply('Une erreur est survenue lors de la lecture de la radio');
                        console.log('[ERROR] Une erreur est survenue lors de la lecture de la radio ' + radio.name)
                        try{
							await interaction.client.serversdb.bulkWrite([
								client.bulkutility.setField({
									'id': interaction.guild.id
								}, {
									'radio': radio,
                                    'voiceconfig.playing': false,
                                    'voiceconfig.type': 'none'
								})
							])
						}catch(err){
							console.log(err);
						}
                        player.stop();
                        return;
                    } else {

                        player.on(AudioPlayerStatus.Idle, async () => {
                            // wait 5 seconds
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            await startplaying();
                        });

                        let connection = getVoiceConnection(interaction?.guild?.id);
                        // get connection channel
                        if(!connection){
                            connection = joinVoiceChannel(connectioninfo);
                            connection = getVoiceConnection(interaction.guild.id);
                            try{
                                await interaction.client.serversdb.bulkWrite([
                                    interaction.client.bulkutility.setField({
                                        'id': interaction.guild.id
                                    }, {
                                        'voiceconfig.playing': true,
                                        'voiceconfig.guildId': connectioninfo.guildId,
                                        'voiceconfig.channelId': connectioninfo.channelId,
                                        'voiceconfig.type': 'radio',
                                    })
                                ])
                            }catch(err){
                                console.log(err);
                            }
                            // save that the music is playing
                            console.log('Audio player is playing on the server ' + interaction.guild.name + ' in the channel ' + interaction.member.voice.channel.name);
                            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                                try {
                                    await Promise.race([
                                        entersState(connection, VoiceConnectionStatus.Signalling, 10_000),
                                        entersState(connection, VoiceConnectionStatus.Connecting, 10_000),
                                    ]);
                                    // Seems to be reconnecting to a new channel - ignore disconnect
                                } catch (error) {
                                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                                    connection.destroy();
                                    try{
                                        await interaction.client.serversdb.bulkWrite([
                                            client.bulkutility.setField({
                                                'id': interaction.guild.id
                                            }, {
                                                'voiceconfig.playing': false,
                                                'voiceconfig.type': 'none'
                                            })
                                        ])
                                    }catch(err){
                                        console.log(err);
                                    }
                                    console.log('[INFO] The bot has been disconnected from the server ' + interaction.guild.name);
                                }
                            });
                            connection.on(VoiceConnectionStatus.Ready, async (oldState, newState) => {
                                // save that the music is playing
                                try{
                                    await interaction.client.serversdb.bulkWrite([
                                        interaction.client.bulkutility.setField({
                                            'id': interaction.guild.id
                                        }, {
                                            'voiceconfig.playing': true,
                                            'voiceconfig.type': 'radio'
                                        })
                                    ])
                                }catch(err){
                                    console.log(err);
                                }
                                // get channel
                                newchannel = connection.joinConfig.channelId
                                // SAVE CHANNEL
                                try{
                                    await interaction.client.serversdb.bulkWrite([
                                        interaction.client.bulkutility.setField({
                                            'id': interaction.guild.id
                                        }, {
                                            'voiceconfig.channelId': newchannel,
                                            'voiceconfig.guildId': interaction.guild.id,
                                        })
                                    ])
                                }catch(err){
                                    console.log(err);
                                }
                                console.log('[INFO] The bot has been re-connected to the server ' + interaction.guild.name);
                            });
                        }
                        // subscribe the player to the connection
                        connection.subscribe(player);
                        try{
                            await interaction.client.serversdb.bulkWrite([
                                interaction.client.bulkutility.setField({
                                    'id': interaction.guild.id
                                }, {
                                    'voiceconfig.playing': true,
                                    'voiceconfig.type': 'radio'
                                })
                            ])
                        }catch(err){
                            console.log(err);
                        }

                        let messagesended = false;

                        var radio1 = {};
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
                            
                        // search title artist and cover of the song

                        // wait 2 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        if(messagesended == false) {
                            // show in a embed message that the bot is playing
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
                    }

                } catch (error){
                    //stream.destroy();
                    console.log('Audio player is stopped');
                    await interaction.editReply('Une erreur est survenue, veuillez réessayer');
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
                    }catch(err){
                        console.log(err);
                    }
                }
            } else {
                await interaction.editReply('Vous devez être dans un salon vocal');
            }
        }
    }
};