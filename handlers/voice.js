module.exports = {
    name: 'voice',
    run: async(client) => {
        // event when a user join a voice channel
        client.on('voiceStateUpdate', async (oldState, newState) => {            
            // if the user is not in a voice channel, return
            if(!newState.channel) return

            // if the user is in the same voice channel, return
            if(oldState.channel && oldState.channel.id == newState.channel.id) return

            // if the user is not in the same voice channel as the bot database, return
            var config = await client.serversdb.findOne({ id: newState.guild.id }); // get the server config

            if(!config?.voiceconfig?.playing) return;
            if(config?.voiceconfig?.channelId != newState?.channel?.id) return // if no channelId or channelId is not the same as the user channel, return
            // check if the bot is already playing, if yes, return
            if(client.players.get(newState.guild.id)) return // if the bot is already playing, return

            // check if type is radio or music
            if(config.voiceconfig.type == 'radio') {
                if(!client.config.modules['radio'].enabled) return console.log('[VOICE] Radio module disabled, skipping...'.brightBlue);
                console.log(('[VOICE] Radio was playing on '+newState.guild.name).brightBlue);
                client.modules.radio.radioLoad(newState.guild,config,client);
            } else if(config.voiceconfig.type == 'music') {
                console.log(('[VOICE] Music was playing on '+newState.guild.name).brightBlue);
                console.log('[VOICE] Not implemented yet !'.yellow);
            } else {
                console.log('[VOICE] Unknown type of music, skipping on '+newState.guild.name+' ...'.brightBlue);
            }
        });
    }
}