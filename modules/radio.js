const { VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');
const { ActivityType } = require('discord.js');

module.exports = {
    name: 'radio',
    addedconfig: {
        status: {
            enabled: true,
            delay: 20000,
            type: ActivityType.Listening,
        }
    },
    dependencies: ['voice.js'],
    async radioLoad(guild,info,client) {
        // get the radio
        var radio = info.radio;

        //////////////////////////////// PLAY THE RADIO ////////////////////////////////

        let player = client.players.get(guild.id);
        let response = client.responses.get(guild.id);
        try{
            if(player){
                console.log(`[RADIO] A player was found, stopping it...`.brightRed);
                player.stop();
                client.players.delete(guild.id);
            }
        }catch(err){console.log((err).red);}
        try{
            if(response){
                console.log(`[RADIO] A response was found, destroying it...`.brightRed);
                response.destroy();
                client.responses.delete(guild.id);
            }
        }catch(err){console.log((err).red);}

        // create a new player

        player = createAudioPlayer();

        client.players.set(guild.id, player);
        async function cr(readableStream) {
            return createAudioResource(readableStream, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true,
            });
        }

        let alreadyplaying = false;
        let streamerror = false;
        async function startplaying() {
            response = await fetch(radio.url, {
                method: 'GET'
            }).catch(err => {
                console.log('[ERROR] Cannot fetch the stream'.red);
                console.log((err).red);
                console.log('--------------------------------'.red);
                streamerror = true;
                console.log(`[RADIO] ${guild.name} The stream is not available, stopping the radio ${radio.name}`.brightRed);
            });
            if(streamerror == false) {
                // get response music stream and send it to the resource
                let resource = await cr(response.body);
                player.play(resource);
                console.log(`[RADIO] ${guild.name} ${alreadyplaying ? 're' : ''}connected to the stream ${radio.name}`.brightBlue);
            }
        }
        await startplaying();
        if(streamerror == true) {
            console.log(`[ERROR] ${guild.name} Une erreur est survenue lors de la lecture de la radio ${radio.name}`.red);
            try{
                await client.serversdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': guild.id
                    }, {
                        'voiceconfig.playing': false,
                        'voiceconfig.type': 'none'
                    })
                ])
            }catch(err){console.log((err).red)}
            try{
                if(player) {
                    console.log(`[RADIO] ${guild.name} A player was found, stopping it...`.brightRed);
                    player.stop();
                    client.players.delete(guild.id);
                }
            }catch(err){console.log((err).red)}
            try{
                if(response) {
                    console.log(`[RADIO] ${guild.name} A response was found, destroying it...`.brightRed);
                    response.destroy();
                    client.responses.delete(guild.id);
                }
            }catch(err){console.log((err).red)}
            let connection = getVoiceConnection(guild.id);
            try{
                if(connection) connection.destroy();
            }catch(err){console.log((err).red)}
            return false;
        }

        // if the stream is ok
        let errorcount = 0;
        player.on(AudioPlayerStatus.Idle, async () => {
            if(player !== client.players.get(guild.id)) return;
            if(errorcount >= 5) {
                console.log(`[ERROR] PLAYER ${guild.name} Too many errors, stopping the radio ${radio.name}`.brightRed);
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.playing': false,
                            'voiceconfig.type': 'none'
                        })
                    ])}catch(err){console.log((err).red)}
                try{
                    if(player) {
                        console.log(`[RADIO] ${guild.name} A player was found, stopping it...`.brightRed);
                        player.stop();
                        client.players.delete(guild.id);
                    }
                }catch(err){console.log((err).red)}
                try{
                    if(response) {
                        console.log(`[RADIO] ${guild.name} A response was found, destroying it...`.brightRed);
                        response.destroy();
                        client.responses.delete(guild.id);
                    }
                }catch(err){console.log((err).red)}
                // leave the voice channel
                let connection = getVoiceConnection(guild.id);
                try{
                    if(connection) connection.destroy();
                }catch(err){console.log((err).red)}
                return false;
            }
            // wait 5 seconds
            errorcount++;
            console.log(`[RADIO] ${guild.name} Error ${errorcount}, Waiting 2 seconds before reconnecting to the radio ${radio.name}`.brightYellow);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await startplaying();
        });
        // on playing
        player.on(AudioPlayerStatus.Playing, async () => {
            console.log(`[RADIO] (PLAYER) ${guild.name} The bot is playing ${alreadyplaying ? 'again ' : ''}the radio ${radio.name}`.brightGreen);
            alreadyplaying = true;
            errorcount = 0;
        });
        // on autopaused
        player.on(AudioPlayerStatus.AutoPaused, async () => {
            console.log(`[RADIO] (PLAYER) ${guild.name} The bot is auto paused on the radio ${radio.name}`.brightGreen);
        });
        // on paused
        player.on(AudioPlayerStatus.Paused, async () => {
            console.log(`[RADIO] (PLAYER) ${guild.name} The bot is paused on the radio ${radio.name}`.brightGreen);
        });
        // on buffering
        player.on(AudioPlayerStatus.Buffering, async () => {
            console.log(`[RADIO] (PLAYER) ${guild.name} The bot is buffering on the radio ${radio.name}`.brightYellow);
        });

        let connection = getVoiceConnection(guild.id);

        // check if connection exists
        if(!connection){

            ///////////////////////////////// SET CONNECTIONINFO /////////////////////////////////

            // get connectioninfo using mongo
            let connectioninfo1 = await client.serversdb.findOne({ id: guild.id }).select('voiceconfig'); connectioninfo1 = connectioninfo1?.voiceconfig;

            // set the connectioninfo variable
            let connectioninfo = {
                channelId: connectioninfo1.channelId,
                guildId: connectioninfo1.guildId,
                adapterCreator: guild.voiceAdapterCreator,
            }

            ///////////////////////////////// SET CONNECTIONINFO /////////////////////////////////

            //////////////////////////////// PLAY THE RADIO ////////////////////////////////
            //                                    yeah                                    //
            //////////////////////////////// PLAY THE RADIO ////////////////////////////////

            connection = joinVoiceChannel(connectioninfo);
            connection = getVoiceConnection(guild.id);
            
            // set the connectioninfo variable
            try{
                await client.serversdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': guild.id
                    }, {
                        'voiceconfig.playing': true,
                        'voiceconfig.type': 'radio'
                    })
                ])
            }catch(err){console.log(err);}

            console.log((`[RADIO] ${guild.name} Audio player is playing the radio ${radio.name}`).brightBlue);

            try {
                connection.on('stateChange', (oldState, newState) => {
                    const oldNetworking = Reflect.get(oldState, 'networking');
                    const newNetworking = Reflect.get(newState, 'networking');
                  
                    const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
                      const newUdp = Reflect.get(newNetworkState, 'udp');
                      clearInterval(newUdp?.keepAliveInterval);
                    }
                  
                    oldNetworking?.off('stateChange', networkStateChangeHandler);
                    newNetworking?.on('stateChange', networkStateChangeHandler);
                });
                // ON DISCONNECT
                connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 10_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 10_000),
                        ]);
                        // Seems to be reconnecting to a new channel - ignore disconnect
                        console.log((`[RADIO] (VOICE) ${guild.name} The bot is reconnecting to the channel`).brightBlue);
                    } catch (error) {
                        // Seems to be a real disconnect which SHOULDN'T be recovered from
                        connection.destroy();
                        try{
                            await client.serversdb.bulkWrite([
                                client.bulkutility.setField({
                                    'id': guild.id
                                }, {
                                    'voiceconfig.playing': false,
                                    'voiceconfig.type': 'none'
                                })
                            ])
                        }catch(err){console.log(err);}
                        console.log((`[RADIO] (VOICE) ${guild.name} The bot has been disconnected`).brightBlue);
                        // remove the player
                        try{
                            if(player) {
                                console.log(`[RADIO] (VOICE) ${guild.name} A player was found, stopping it...`.brightRed);
                                player.stop();
                                client.players.delete(guild.id);
                            }
                        }catch(err){console.log(err);}
                        try{
                            if(response) {
                                console.log(`[RADIO] (VOICE) ${guild.name} A response was found, destroying it...`.brightRed);
                                response.destroy();
                                client.responses.delete(guild.id);
                            }
                        }catch(err){console.log(err);}
                        let connection = getVoiceConnection(guild.id);
                        try{
                            if(connection) connection.destroy();
                        }catch(err){console.log(err);}
                        return false;
                    }
                });
                // ON READY
                let alreadyconnected = false;
                connection.on(VoiceConnectionStatus.Ready, async (oldState, newState) => {
                    // save that the music is playing
                    try{
                        await client.serversdb.bulkWrite([
                            client.bulkutility.setField({
                                'id': guild.id
                            }, {
                                'voiceconfig.playing': true,
                                'voiceconfig.type': 'radio'
                            })
                        ])
                    }catch(err){console.log(err);}
                    // get channel
                    console.log(`[RADIO] (VOICE) ${guild.name} The bot is ready and ${alreadyconnected ? 'reconnected' : 'connected'}`.brightBlue);
                    alreadyconnected = true;
                });
                // ON CONNECTING
                connection.on(VoiceConnectionStatus.Connecting, async (oldState, newState) => {
                    console.log(`[RADIO] (VOICE) ${guild.name} The bot is connecting to the channel`.brightBlue);
                });
                // ON SIGNALLING
                connection.on(VoiceConnectionStatus.Signalling, async (oldState, newState) => {
                    console.log(`[RADIO] (VOICE) ${guild.name} The bot is signalling to the channel`.brightYellow);
                });
                // ON DESTROYED
                connection.on(VoiceConnectionStatus.Destroyed, async (oldState, newState) => {
                    console.log(`[RADIO] (VOICE) ${guild.name} The bot has been destroyed`.brightBlue);
                    // remove the player
                    try{
                        if(player) {
                            console.log(`[RADIO] (VOICE) ${guild.name} A player was found, stopping it...`.brightRed);
                            player.stop();
                            client.players.delete(guild.id);
                        }
                    }catch(err){console.log(err);}
                    try{
                        if(response) {
                            console.log(`[RADIO] (VOICE) ${guild.name} A response was found, destroying it...`.brightRed);
                            response.destroy();
                            client.responses.delete(guild.id);
                        }
                    }catch(err){console.log(err);}
                    // leave the voice channel
                    let connection = getVoiceConnection(guild.id);
                    try{
                        if(connection) connection.destroy();
                    }catch(err){console.log(err);}
                });
            } catch (error) {
                console.log(`[RADIO] ${guild.name} Error while connecting to the server due to ${error}`.brightRed);
                // remove the player
                try{
                    if(player) {
                        console.log(`[RADIO] ${guild.name} A player was found, stopping it...`.brightRed);
                        player.stop();
                        client.players.delete(guild.id);
                    }
                }catch(err){console.log(err);}
                try{
                    if(response) {
                        console.log(`[RADIO] ${guild.name} A response was found, destroying it...`.brightRed);
                        response.destroy();
                        client.responses.delete(guild.id);
                    }
                }catch(err){console.log(err);}
                // leave the voice channel
                let connection = getVoiceConnection(guild.id);
                try{
                    if(connection) connection.destroy();
                }catch(err){console.log(err);}
                // update the database
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.playing': false,
                            'voiceconfig.type': 'none'
                        })
                    ])
                }catch(err){console.log(err);}
                console.log(`[RADIO] Database updated for this error`.brightRed);
                return false;
            }
        }

        // subscribe the player to the connection
        connection.subscribe(player);

        try{
            await client.serversdb.bulkWrite([
                client.bulkutility.setField({
                    'id': guild.id
                }, {
                    'voiceconfig.playing': true,
                    'voiceconfig.type': 'radio'
                })
            ])
        }catch(err){console.log(err);}

        return true;

        ///////////////////////////////// FINALLY /////////////////////////////////
    },
    run: async(client) => {
        if(client.config.modules['radio'].addedconfig.status.enabled == true){
            console.log('[RADIO] Le mode status est activé'.brightGreen);
            // STATUS //
            client.user.setActivity(`${client.prefix}play`, { type: ActivityType.Listening });
            
            let iserver = 0;
            async function changestatus() {
                // get the number of servers
                var servers = client.guilds.cache.size;
                iserver++;
                if(iserver <= servers){
                    // get the radio playing on a random server
                    var server = client.guilds.cache.random();
                    // check if the server exists
                    if(server){
                        // get the radio playing on the server
                        // using mongo
                        var radio = await client.serversdb.findOne({ id: server.id }).select('radio'); // get the radio
                        radio = radio?.radio; // get the radio
                        // check if the radio exists
                        if(radio){
                            // get the radio name
                            var name = radio?.name
                            // check if the radio name exists
                            if(name){
                                // set the activity
                                client.user.setActivity(`${name} se joue sur un serveur... | ${client.prefix}play`, { type: ActivityType.Listening });
                            } else {
                                changestatus();
                            }
                        } else {
                            changestatus();
                        }
                    }
                } else {
                    // set the activity
                    client.user.setActivity(`${client.prefix}play`, { type: client.config.modules['radio'].addedconfig.status.type });
                }
            }

            // toues les 20 secondes, changer le status du bot
            setInterval(function(){
                iserver = 0;
                changestatus();
            }, client.config.modules['radio'].addedconfig.status.delay);
        } else {
            console.log('[RADIO] Le mode status est désactivé'.yellow);
        }
    }
}