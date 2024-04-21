const { VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');

module.exports = {
    name: 'music',
    showname: 'Music',
    dependencies: ['voice.js'],
    /*guildSchemaAddition: {
        music: {
            title: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            },
            stream: {
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
            },
            queue: {
                type: Array,
                required: false
            },
        },
    },*/
    // function to play music in a guild
    async musicLoad(guild, info) {
        client = module.exports.client;
        console.log(`[MUSIC] Not finished yet!`);
    },
}