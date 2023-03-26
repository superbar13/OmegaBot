const { VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');

module.exports = {
    name: 'music',
    showname: 'Music',
    guildSchemaAddition: {
        music: {
            title: {
                type: String,
                required: false
            },
            artist: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            },
            thumbnail: {
                type: String,
                required: false
            },
            duration: {
                type: Number,
                required: false
            },
            requester: {
                type: String,
                required: false
            }
        },
    },
    run: async(client) => {
        console.log('[RADIO] Not implemented yet !'.yellow);
    }
}