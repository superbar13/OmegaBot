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
        if(player){
            player.stop();
            client.players.delete(guild.id);
        }
        if(response){
            response.destroy();
            client.responses.delete(guild.id);
        }

        // create a new player

        player = createAudioPlayer();

        client.players.set(guild.id, player);
        async function cr(readableStream) {
            return createAudioResource(readableStream, {
                inputType: StreamType.WebmOpus,
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
            });
            if(streamerror == false) {
                // get response music stream and send it to the resource
                let resource = await cr(response.body);
                player.play(resource);
                console.log(`[RADIO] Bot ${alreadyplaying ? 're' : ''}connected to the stream ${radio.name} on the guild ${guild.name} (${guild.id})`.brightGreen);
            }
        }
        await startplaying();
        if(streamerror == true) {
            console.log('[ERROR] Une erreur est survenue lors de la lecture de la radio ' + radio.name)
            try{
                await client.serversdb.bulkWrite([
                    client.bulkutility.setField({
                        'id': guild.id
                    }, {
                        'voiceconfig.playing': false,
                        'voiceconfig.type': 'none'
                    })
                ])
            }catch(err){
                console.log((err).red)
            }
            player.stop();
            client.players.delete(guild.id);
            response.destroy();
            client.responses.delete(guild.id);
            return false;
        }

        // if the stream is ok
        let errorcount = 0;
        player.on(AudioPlayerStatus.Idle, async () => {
            if(player !== client.players.get(guild.id)) return;
            if(errorcount >= 5) {
                console.log(`[ERROR] Too many errors, stopping the radio ${radio.name} on the guild ${guild.name} (${guild.id})`.brightRed);
                try{
                    await client.serversdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': guild.id
                        }, {
                            'voiceconfig.playing': false,
                            'voiceconfig.type': 'none'
                        })
                    ])
                }catch(err){
                    console.log((err).red)
                }
                player.stop();
                client.players.delete(guild.id);
                response.destroy();
                client.responses.delete(guild.id);
                // leave the voice channel
                let connection = getVoiceConnection(guild.id);
                if(connection) connection.destroy();
                return false;
            }
            // wait 5 seconds
            errorcount++;
            console.log(`[RADIO] Error ${errorcount}, Waiting 5 seconds before reconnecting to the radio ${radio.name} on the guild ${guild.name} (${guild.id})`.brightYellow);
            await new Promise(resolve => setTimeout(resolve, 5000));
            await startplaying();
        });
        // on playing
        player.on(AudioPlayerStatus.Playing, async () => {
            console.log(`[RADIO] The bot is ${alreadyplaying ? 're' : ''}connected to the radio ${radio.name} on the guild ${guild.name} (${guild.id})`.brightGreen);
            alreadyplaying = true;
            errorcount = 0;
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
                        'voiceconfig.channelId': connectioninfo.channelId,
                        'voiceconfig.guildId': connectioninfo.guildId,
                        'voiceconfig.type': 'radio'
                    })
                ])
            }catch(err){
                console.log(err);
            }

            console.log('[RADIO] Audio player is playing on the server ' + guild.name + ' in the channel ' + connectioninfo.channelId);
            console.log('[RADIO] It is playing the radio ' + radio.name);

            // ON DISCONNECT
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
                                'voiceconfig.type': 'none'
                            })
                        ])
                    }catch(err){
                        console.log(err);
                    }
                    console.log(('[RADIO] The bot has been disconnected from the server ' + guild.name).brightBlue);
                    // remove the player
                    player.stop();
                    client.players.delete(guild.id);
                    response.destroy();
                    client.responses.delete(guild.id);
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
                console.log(`[RADIO] The bot has been ${alreadyconnected ? 'reconnected' : 'connected'} to the server ${guild.name}`.brightGreen);
                alreadyconnected = true;
            });
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
        }catch(err){
            console.log(err);
        }

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