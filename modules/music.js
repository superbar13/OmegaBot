const { entersState, VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');

module.exports = {
    name: 'music',
    showname: 'Music',
    dependencies: ['voice.js'],
    guildSchemaAddition: {
        music: {
            title: { type: String, required: false },
            url: { type: String, required: false },
            thumbnail: { type: String, required: false },
            duration: { type: Number, required: false },
            requester: { type: String, required: false },
        },
        queue: {
            type: Array,
            required: false,
            default: []
        },
    },
    // function to play music in a guild
    async musicLoad(guild, info) {
        let client = module.exports.client;
        if (!client) client = guild.client;

        // Get voice channel and queue
        let voiceconfig = await client.serversdb.findOne({ id: guild.id }).select('voiceconfig music queue');

        let queue = voiceconfig?.queue || [];
        let currentMusic = voiceconfig?.music;

        if (queue.length === 0 && !currentMusic?.url) {
            console.log(`[MUSIC] Queue is empty for ${guild.name}, stopping...`.brightYellow);
            try {
                let connection = getVoiceConnection(guild.id);
                if (connection) connection.destroy();
                let player = client.players.get(guild.id);
                if (player) {
                    player.removeAllListeners();
                    player.stop();
                    client.players.delete(guild.id);
                }
                let response = client.responses.get(guild.id);
                if (response) {
                    if (typeof response.abort === 'function') response.abort();
                    else if (typeof response.kill === 'function') response.kill();
                    client.responses.delete(guild.id);
                }
                await client.serversdb.bulkWrite([
                    client.bulkutility.setField({ 'id': guild.id }, {
                        'voiceconfig.playing': false,
                        'voiceconfig.type': 'none',
                        'music': null
                    })
                ]);
            } catch (e) { }
            return false;
        }

        // if there's no currentMusic or we need to start playing, take the first from queue
        // BUT if currentMusic exists (e.g. from a bot reboot), we play it first without shifting the queue.
        if ((!currentMusic || !currentMusic.url) && queue.length > 0) {
            currentMusic = queue.shift();
            // Update database
            await client.serversdb.bulkWrite([
                client.bulkutility.setField({ 'id': guild.id }, {
                    'music': currentMusic,
                    'queue': queue
                })
            ]);
        }

        let player = client.players.get(guild.id);
        if (!player) {
            player = createAudioPlayer();
            client.players.set(guild.id, player);
        }

        let connection = getVoiceConnection(guild.id);
        if (!connection) {
            let connectioninfo = {
                channelId: voiceconfig.voiceconfig.channelId,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            };
            try {
                connection = joinVoiceChannel(connectioninfo);
            } catch (e) {
                console.log(`[MUSIC] Failed to join voice channel for ${guild.name}`.red);
                return false;
            }
        }

        // Clean up previous event listeners on player to avoid duplicates
        player.removeAllListeners();

        // Subscribe player to connection
        connection.subscribe(player);

        // Fetch stream from yt-dlp-exec
        const ytdl = require('yt-dlp-exec');
        try {
            console.log(`[MUSIC] ${guild.name} extracting stream for ${currentMusic.title} (${currentMusic.url})`.brightBlue);

            // cleanup past process if any
            let oldProcess = client.responses.get(guild.id);
            if (oldProcess && typeof oldProcess.kill === 'function') {
                oldProcess.kill();
            }

            const subprocess = ytdl.exec(currentMusic.url, {
                o: '-',
                q: '',
                f: 'bestaudio',
                r: '1M',
            }, { stdio: ['ignore', 'pipe', 'ignore'] });

            client.responses.set(guild.id, subprocess);

            let volume = voiceconfig?.voiceconfig?.volume || 100;
            let resource = createAudioResource(subprocess.stdout, { inlineVolume: true });
            if (resource.volume) resource.volume.setVolume(volume / 100);

            player.play(resource);
            console.log(`[MUSIC] ${guild.name} playing ${currentMusic.title} at ${volume}%`.brightGreen);

            await client.serversdb.bulkWrite([
                client.bulkutility.setField({ 'id': guild.id }, {
                    'voiceconfig.playing': true,
                    'voiceconfig.type': 'music'
                })
            ]);

            player.on(AudioPlayerStatus.Idle, async () => {
                console.log(`[MUSIC] ${guild.name} finished playing track, loading next...`.brightCyan);
                // Clear current music internally to force shift from queue
                await client.serversdb.bulkWrite([
                    client.bulkutility.setField({ 'id': guild.id }, {
                        'music': null
                    })
                ]);
                return client.modules.music.musicLoad(guild, {});
            });

            player.on('error', async error => {
                console.log(`[ERROR] (PLAYER) ${guild.name} music error: ${error.message}`.brightRed);
                await client.serversdb.bulkWrite([
                    client.bulkutility.setField({ 'id': guild.id }, {
                        'music': null
                    })
                ]);
                return client.modules.music.musicLoad(guild, {});
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                console.log(`[MUSIC] (VOICE) ${guild.name} Disconnected.`.brightYellow);
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (e) {
                    player.stop();
                    connection.destroy();
                }
            });

            return true;
        } catch (err) {
            console.log(`[ERROR] ${guild.name} Music stream failed`.brightRed, err);
            // shift fail and next
            await client.serversdb.bulkWrite([
                client.bulkutility.setField({ 'id': guild.id }, {
                    'music': null
                })
            ]);
            return client.modules.music.musicLoad(guild, {});
        }
    },
}