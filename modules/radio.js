const { VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');
const { ActivityType } = require('discord.js');
const isOnline = require('is-online');

module.exports = {
    name: 'radio',
    showname: 'Radio',
    addedconfig: {
        status: {
            enabled: true,
            delay: 20000,
            type: ActivityType.Listening,
        }
    },
    guildSchemaAddition: {
        radio: {
            name: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            },
            website: {
                type: String,
                required: false
            },
            logo: {
                type: String,
                required: false
            },
            country: {
                type: String,
                required: false
            },
            state: {
                type: String,
                required: false
            },
            language: {
                type: String,
                required: false
            },
            votes: {
                type: Number,
                required: false
            },
            genres: {
                type: String,
                required: false
            },
            id: {
                type: String,
                required: false
            },
            description: {
                type: String,
                required: false
            },
        },
    },
    dependencies: ['voice.js'],
    async radioLoad(guild,info) {
        client = module.exports.client;

        // get the radio
        var radio = info.radio;

        //////////////////////////////// PLAY THE RADIO ////////////////////////////////

        let player = client.players.get(guild.id);
        let response = client.responses.get(guild.id);
        try{
            if(player){
                console.log(`[RADIO] A player was found, stopping it...`.brightRed);
                player.removeAllListeners();
                player.stop();
                client.players.delete(guild.id);
            }
        }catch(err){console.log((err).red);}
        try{
            if(response){
                console.log(`[RADIO] A response was found, destroying it...`.brightRed);
                response.abort();
                client.responses.delete(guild.id);
            }
        }catch(err){console.log((err).red);}

        // create a new player

        player = createAudioPlayer();

        client.players.set(guild.id, player);
        async function cr(readableStream) {
            const { stream, type } = await demuxProbe(readableStream);
            return createAudioResource(
                stream,
                {
                    inputType: type,
                    inlineVolume: false,
                }
            );
        }

        let alreadyplaying = false;
        let streamerror = false;
        async function startplaying() {
            console.log(`[RADIO] ${guild.name} Connecting to the stream ${radio.name}`.brightBlue);
            streamerror = false;
            const controller = new AbortController();
            let response1 = await fetch(radio.url, {
                method: 'GET',
                signal: controller.signal,
            }).catch(err => {
                console.log('[ERROR] Cannot fetch the stream'.red);
                console.log((err).red);
                console.log('--------------------------------'.red);
                streamerror = true;
                console.log(`[RADIO] ${guild.name} The stream is not available... ${radio.name}`.brightRed);
            });
            if(streamerror == false) {
                // get response music stream and send it to the resource
                let resource = await cr(response1.body);
                player.play(resource);
                console.log(`[RADIO] ${guild.name} ${alreadyplaying ? 're' : ''}connected to the stream ${radio.name}`.brightBlue);
            }
            client.responses.set(guild.id, controller);
            response = controller;
        }
        await startplaying();
        if(streamerror == true) {
            console.log(`[ERROR] ${guild.name} Une erreur est survenue lors de la lecture de la radio ${radio.name}, nous allons la stopper`.red);
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
                    player.removeAllListeners();
                    player.stop();
                    client.players.delete(guild.id);
                }
            }catch(err){console.log((err).red)}
            try{
                if(response) {
                    console.log(`[RADIO] ${guild.name} A response was found, destroying it...`.brightRed);
                    response.abort();
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
        if(!player.listenerCount(AudioPlayerStatus.Idle)) {
            player.on(AudioPlayerStatus.Idle, async () => {
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
                            player.removeAllListeners();
                            player.stop();
                            client.players.delete(guild.id);
                        }
                    }catch(err){console.log((err).red)}
                    try{
                        if(response) {
                            console.log(`[RADIO] ${guild.name} A response was found, destroying it...`.brightRed);
                            response.abort();
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
                console.log(`[RADIO] ${guild.name} Error ${errorcount}, Waiting ${(2000*errorcount)/1000} seconds before reconnecting to the radio ${radio.name}`.brightYellow);
                await new Promise(resolve => setTimeout(resolve, 2000*errorcount));
                await startplaying();
            });
        }
        // on playing
        if(!player.listenerCount(AudioPlayerStatus.Playing)) {
            player.on(AudioPlayerStatus.Playing, async () => {
                console.log(`[RADIO] (PLAYER) ${guild.name} The bot is playing ${alreadyplaying ? 'again ' : ''}the radio ${radio.name}`.brightGreen);
                alreadyplaying = true;
                errorcount = 0;
            });
        }
        // on autopaused
        if(!player.listenerCount(AudioPlayerStatus.AutoPaused)) {
            player.on(AudioPlayerStatus.AutoPaused, async () => {
                console.log(`[RADIO] (PLAYER) ${guild.name} The bot is auto paused on the radio ${radio.name}`.brightGreen);
            });
        }
        // on paused
        if(!player.listenerCount(AudioPlayerStatus.Paused)) {
            player.on(AudioPlayerStatus.Paused, async () => {
                console.log(`[RADIO] (PLAYER) ${guild.name} The bot is paused on the radio ${radio.name}`.brightGreen);
            });
        }
        // on buffering
        if(!player.listenerCount(AudioPlayerStatus.Buffering)) {
            player.on(AudioPlayerStatus.Buffering, async () => {
                console.log(`[RADIO] (PLAYER) ${guild.name} The bot is buffering on the radio ${radio.name}`.brightYellow);
            });
        }
        // on error
        if(!player.listenerCount('error')) {
            player.on('error', error => {
                console.log(`[ERROR] (PLAYER) ${guild.name} An error occured on the radio ${radio.name}`.brightRed);
                console.log((error).red);
                console.log('--------------------------------'.red);
            });
        }

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
                if(!connection.listenerCount('stateChange')) {
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
                } else console.log(`[RADIO] (VOICE) ${guild.name} The bot has already an event for the event stateChange`.brightBlue);
                // ON DISCONNECT
                if(!connection.listenerCount(VoiceConnectionStatus.Disconnected)) {
                    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                        try {
                            await Promise.race([
                                entersState(connection, VoiceConnectionStatus.Signalling, 10_000),
                                entersState(connection, VoiceConnectionStatus.Connecting, 10_000),
                            ]);
                            // Seems to be reconnecting to a new channel - ignore disconnect
                            console.log((`[RADIO] (VOICE) ${guild.name} The bot is reconnecting to the channel`).brightBlue);
                        } catch (error) {
                            if(await isOnline()) {
                                // Seems to be a real disconnect which SHOULDN'T be recovered from
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
                                        player.removeAllListeners();
                                        player.stop();
                                        client.players.delete(guild.id);
                                    }
                                }catch(err){console.log(err);}
                                try{
                                    if(response) {
                                        console.log(`[RADIO] (VOICE) ${guild.name} A response was found, destroying it...`.brightRed);
                                        response.abort();
                                        client.responses.delete(guild.id);
                                    }
                                }catch(err){console.log(err);}
                                let connection = getVoiceConnection(guild.id);
                                try{
                                    if(connection) connection.destroy();
                                }catch(err){console.log(err);}
                                return false;
                            } else {
                                // Internet is shut down, the bot will reconnect when the internet will be back, so don't do anything
                                console.log((`[RADIO] (VOICE) ${guild.name} The bot has been disconnected due to internet shutdown`).brightBlue);
                            }
                        }
                    });
                } else console.log(`[RADIO] (VOICE) ${guild.name} The bot has already an event for the event VoiceConnectionStatus.Disconnected`.brightBlue);
                // ON READY
                let alreadyconnected = false;
                if(!connection.listenerCount(VoiceConnectionStatus.Ready)) {
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
                } else console.log(`[RADIO] (VOICE) ${guild.name} The bot has already an event for the event VoiceConnectionStatus.Ready`.brightBlue);
                // ON CONNECTING
                if(!connection.listenerCount(VoiceConnectionStatus.Connecting)) {
                    connection.on(VoiceConnectionStatus.Connecting, async (oldState, newState) => {
                        console.log(`[RADIO] (VOICE) ${guild.name} The bot is connecting to the channel`.brightBlue);
                    });
                } else console.log(`[RADIO] (VOICE) ${guild.name} The bot has already an event for the event VoiceConnectionStatus.Connecting`.brightBlue);
                // ON SIGNALLING
                if(!connection.listenerCount(VoiceConnectionStatus.Signalling)) {
                    connection.on(VoiceConnectionStatus.Signalling, async (oldState, newState) => {
                        console.log(`[RADIO] (VOICE) ${guild.name} The bot is signalling to the channel`.brightYellow);
                    });
                } else console.log(`[RADIO] (VOICE) ${guild.name} The bot has already an event for the event VoiceConnectionStatus.Signalling`.brightBlue);
                // ON DESTROYED
                if(!connection.listenerCount(VoiceConnectionStatus.Destroyed)) {
                    connection.on(VoiceConnectionStatus.Destroyed, async (oldState, newState) => {
                        console.log(`[RADIO] (VOICE) ${guild.name} The bot has been destroyed`.brightBlue);
                        // remove the player
                        try{
                            if(player) {
                                console.log(`[RADIO] (VOICE) ${guild.name} A player was found, stopping it...`.brightRed);
                                player.removeAllListeners();
                                player.stop();
                                client.players.delete(guild.id);
                            }
                        }catch(err){console.log(err);}
                        try{
                            if(response) {
                                console.log(`[RADIO] (VOICE) ${guild.name} A response was found, destroying it...`.brightRed);
                                response.abort();
                                client.responses.delete(guild.id);
                            }
                        }catch(err){console.log(err);}
                        // check the number of events listeners
                        console.log(`[RADIO] (VOICE) ${guild.name} The bot has ${connection.listenerCount('stateChange') + connection.listenerCount(VoiceConnectionStatus.Disconnected) + connection.listenerCount(VoiceConnectionStatus.Ready) + connection.listenerCount(VoiceConnectionStatus.Connecting) + connection.listenerCount(VoiceConnectionStatus.Signalling) + connection.listenerCount(VoiceConnectionStatus.Destroyed)} events listeners`.brightBlue);
                        // remove all events listeners from the connection
                        connection.removeAllListeners();
                        // console log
                        console.log(`[RADIO] (VOICE) ${guild.name} All events listeners have been removed`.brightBlue);
                    });
                } else console.log(`[RADIO] (VOICE) ${guild.name} The bot has already an event for the event VoiceConnectionStatus.Destroyed`.brightBlue);
            } catch (error) {
                console.log(`[RADIO] ${guild.name} Error while connecting to the server due to ${error}`.brightRed);
                // remove the player
                try{
                    if(player) {
                        console.log(`[RADIO] ${guild.name} A player was found, stopping it...`.brightRed);
                        player.removeAllListeners();
                        player.stop();
                        client.players.delete(guild.id);
                    }
                }catch(err){console.log(err);}
                try{
                    if(response) {
                        console.log(`[RADIO] ${guild.name} A response was found, destroying it...`.brightRed);
                        response.abort();
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
            client.user.setActivity(`${client.prefix}play`, { type: client.config.modules['radio'].addedconfig.status.type });
            
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
                                client.user.setActivity(`${name} se joue sur un serveur... | ${client.prefix}play`, { type: client.config.modules['radio'].addedconfig.status.type });
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