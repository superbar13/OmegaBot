module.exports = {
    name: 'voiceevent',
    run: async(client) => {
        // event when a user join a voice channel
        client.on('voiceStateUpdate', async (oldState, newState) => {
            // if the user is not in a voice channel, return
            if(!newState.channel) return
            // if the user is in the same voice channel, return
            if(oldState.channel && oldState.channel.id == newState.channel.id) return

            // if the user is not in the same voice channel as the bot database, return
            var config = await client.serversdb.findOne({ id: newState.guild.id });
            if(!config || !config.voiceconfig) return
            if(config.voiceconfig.channelId && config.voiceconfig.channelId != newState.channel.id) return

            // check if the bot playing is activated in the database for the guild, if not, return
            var config = await client.serversdb.findOne({ id: newState.guild.id });
            if(!config || !config.voiceconfig || !config.voiceconfig.playing) return

            // check if the bot is already playing, if yes, return
            if(client.players.get(newState.guild.id)) return

            console.log('[VOICE] The music or radio was playing !'.brightBlue);

            // check if type is radio or music
            if(config.voiceconfig.type == 'radio') {
                console.log('[VOICE] Radio was playing !'.brightBlue);
                client.radio.changeRadio(newState,client);
                console.log('[VOICE] Radio loaded !'.brightGreen);
            } else if(config.voiceconfig.type == 'music') {
                console.log('[VOICE] Music was playing !'.brightBlue);
                client.radio.changeMusic(newState,client);
                console.log('[VOICE] Music loaded !'.brightGreen);
            }
        });
    }
}