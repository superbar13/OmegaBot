const { VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');

module.exports = {
    name: 'radio',
    async changeRadio(newState,client) {
        // if the bot is not in a voice channel, connect to the user's voice channel
        let player = client.players.get(newState.guild.id);
        if(!player){
            let guild = newState.guild
            var info = await client.serversdb.findOne({ id: guild.id }).select('radio voiceconfig');
            var radio = info.radio;
            console.log('[RADIO] Connecting to '+guild.name+' because a user joined the voice channel because it was not connected, and has to be in.'.brightBlue);
            player = createAudioPlayer();
            // add the player to the players map
            client.players.set(guild.id, player);
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
                    console.log('[ERROR] Cannot fetch the stream'.red)
                    console.log((err).red)
                    console.log('--------------------------------'.red)
                    streamerror = true;
                });
                if(streamerror == false) {
                    // get response music stream and send it to the resource
                    resource = await cr(response.body);
                    player.play(resource);
                    console.log(('[RADIO] Bot connecté ou reconnecté à la radio ' + radio.name).brightGreen);
                }
            }
            if(streamerror == true) {
                console.log('[ERROR] Cannot play the stream'.red)
                // save using mongo
                // update
                console.log('[RADIO] Updating database...'.brightBlue)
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.playing': false,
                        })
                    ])
                }catch(err){
                    console.log((err).red)
                }
                console.log('--------------------------------'.red)
                return;
            } else {

                player.on(AudioPlayerStatus.Idle, async () => {
                    // wait 5 seconds
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    await startplaying();
                });

                console.log(`[RADIO] ${guild.name} : La musique était en train de jouer, je la relance !`.brightBlue);
                let connection = getVoiceConnection(guild.id);
                // get connectioninfo using mongo
                var connectioninfo1 = await client.serversdb.findOne({ id: guild.id }).select('voiceconfig');
                connectioninfo1 = connectioninfo1?.voiceconfig;
                // use connectioninfo to connect to the voice channel
                const connectioninfo = {
                    channelId: connectioninfo1.channelId,
                    guildId: connectioninfo1.guildId,
                    adapterCreator: guild.voiceAdapterCreator,
                }
                // check if connection exists
                if(!connection){
                    connection = joinVoiceChannel(connectioninfo);
                    console.log('[RADIO] Bot connecté au salon vocal'.brightGreen)
                } else {
                    console.log('[RADIO] Bot déjà connecté au salon vocal'.brightBlue)
                }

                connection = getVoiceConnection(guild.id);

                // play the music
                connection.subscribe(player);
                console.log(('[RADIO] Musique en cours de lecture sur le serveur '+guild.name).brightGreen);
                // set the playing variable to true
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.playing': true,
                        })
                    ])
                }catch(err){
                    console.log((err).red)
                }
                // set the connectioninfo variable
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.channelId': connectioninfo.channelId,
                            'voiceconfig.guildId': connectioninfo.guildId,
                        })
                    ])
                }catch(err){
                    console.log((err).red)
                }
                console.log('[RADIO] Variables enregistrées')
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
                            await client.serversdb.bulkWrite([
                                client.bulkutility.setField({
                                    'id': guild.id
                                }, {
                                    'voiceconfig.playing': false,
                                })
                            ])
                        }catch(err){
                            console.log((err).red)
                        }
                        console.log(('[RADIO] The bot has been disconnected from the server ' + guild.name).brightBlue);
                    }
                });
                connection.on(VoiceConnectionStatus.Ready, async (oldState, newState) => {
                    // save that the music is playing
                    try{
                        await client.serversdb.bulkWrite([
                            client.bulkutility.setField({
                                'id': guild.id
                            }, {
                                'voiceconfig.playing': true,
                            })
                        ])
                    }catch(err){
                        console.log(err);
                    }
                    // get channel
                    newchannel = connection.joinConfig.channelId;
                    // SAVE CHANNEL
                    // using mongo
                    try{
                        await client.serversdb.bulkWrite([
                            client.bulkutility.setField({
                                'id': guild.id
                            }, {
                                'voiceconfig.channelId': newchannel,
                                'voiceconfig.guildId': guild.id,
                            })
                        ])
                    }catch(err){
                        console.log(err);
                    }
                    console.log(('[RADIO] The bot has been re-connected to the server ' + guild.name).brightGreen);
                });
            }
        }
    },
    async radioLoad(guild,info,client) {
        console.log(('[RADIO] Checking if music was playing on '+guild.name).brightBlue);
        var radio = info.radio;
        var voiceconfig = info.voiceconfig;
        if(voiceconfig?.playing == true){
            console.log(('[RADIO] Music was playing on '+guild.name).brightBlue);
            player = createAudioPlayer();
            // add the player to the players map
            client.players.set(guild.id, player);
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
                    console.log('[ERROR] Cannot fetch the stream'.red);
                    console.log((err).red);
                    console.log('--------------------------------'.red);
                    streamerror = true;
                });
                if(streamerror == false) {
                    // get response music stream and send it to the resource
                    resource = await cr(response.body);
                    player.play(resource);
                    console.log(('[RADIO] Bot connecté ou reconnecté à la radio ' + radio.name).brightGreen);
                }
            }
            if(streamerror == true) {
                console.log('[ERROR] Cannot play the stream'.red)
                // save using mongo
                console.log('[RADIO] Saving the playing variable'.brightBlue)
                // update
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.playing': false,
                        })
                    ])
                }catch(err){
                    console.log((err).red)
                }
                console.log('--------------------------------'.red)
                return;
            } else {

                player.on(AudioPlayerStatus.Idle, async () => {
                    // wait 5 seconds
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    await startplaying();
                });

                console.log(`[RADIO] ${guild.name} : La musique était en train de jouer, je la relance !`.brightBlue);
                let connection = getVoiceConnection(guild.id);
                // get connectioninfo using mongo
                var connectioninfo1 = await client.serversdb.findOne({ id: guild.id }).select('voiceconfig');
                connectioninfo1 = connectioninfo1?.voiceconfig;
                // use connectioninfo to connect to the voice channel
                const connectioninfo = {
                    channelId: connectioninfo1.channelId,
                    guildId: connectioninfo1.guildId,
                    adapterCreator: guild.voiceAdapterCreator,
                }
                // check if connection exists
                if(!connection){
                    connection = joinVoiceChannel(connectioninfo);
                    console.log('[RADIO] Bot connecté au salon vocal'.brightGreen)
                } else {
                    console.log('[RADIO] Bot déjà connecté au salon vocal'.brightBlue)
                }

                connection = getVoiceConnection(guild.id);

                // play the music
                connection.subscribe(player);
                console.log(('[RADIO] Musique en cours de lecture sur le serveur '+guild.name).brightBlue);
                // set the playing variable to true
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.playing': true,
                        })
                    ])
                }catch(err){
                    console.log(err);
                }
                // set the connectioninfo variable
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.channelId': connectioninfo.channelId,
                            'voiceconfig.guildId': connectioninfo.guildId,
                        })
                    ])
                }catch(err){
                    console.log(err);
                }
                console.log('[RADIO] Variables enregistrées'.brightGreen)
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
                            await client.serversdb.bulkWrite([
                                client.bulkutility.setField({
                                    'id': guild.id
                                }, {
                                    'voiceconfig.playing': false,
                                })
                            ])
                        }catch(err){
                            console.log(err);
                        }
                        console.log(('[RADIO] The bot has been disconnected from the server ' + guild.name).brightBlue);
                    }
                });
                connection.on(VoiceConnectionStatus.Ready, async (oldState, newState) => {
                    // save that the music is playing
                    try{
                        await client.serversdb.bulkWrite([
                            client.bulkutility.setField({
                                'id': guild.id
                            }, {
                                'voiceconfig.playing': true,
                            })
                        ])
                    }catch(err){
                        console.log(err);
                    }
                    // get channel
                    newchannel = connection.joinConfig.channelId;
                    // SAVE CHANNEL
                    // using mongo
                    try{
                        await client.serversdb.bulkWrite([
                            client.bulkutility.setField({
                                'id': guild.id
                            }, {
                                'voiceconfig.channelId': newchannel,
                                'voiceconfig.guildId': guild.id,
                            })
                        ])
                    }catch(err){
                        console.log(err);
                    }
                    console.log(('[RADIO] The bot has been re-connected to the server ' + guild.name).brightGreen);
                });
            }
        } else {
            console.log('[RADIO] La musique n\'est pas en train de jouer, je ne fais rien sur le serveur '+guild.name+ ' !'.brightBlue);
        }
    }
}