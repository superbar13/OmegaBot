const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'voice',
    showname: 'Voice',
    guildconfig: {
        voiceconfig: {
            displayname: 'Voice',
            description: 'Voice module configuration',
            type: 'databasecategory',
            showed: true,
            childs: {
                adminonly: {
                    displayname: 'Admin only',
                    description: 'Only admins can use the voice commands',
                    type: 'boolean',
                },
            },
        },
    },
    guildSchemaAddition: {
        voiceconfig: {
            guildId: {
                type: String,
                required: false
            },
            channelId : {
                type: String,
                required: false
            },
            volume: {
                type: Number,
                required: false
            },
            adminonly: {
                type: Boolean,
                default: false
            },
            playing: {
                type: Boolean,
                default: false
            },
            type: {
                // radio or music
                type: String,
                default: "none"
            },
        },
    },
    run: async(client) => {
        client.players = new Map();
        client.responses = new Map();
        // loop in all servers
        client.guilds.cache.forEach(async guild => {
            // check if the music was playing
            var info = await client.serversdb.findOne({ id: guild.id }).select('music radio voiceconfig');
            
            if(!info?.voiceconfig?.playing) return;
            
            if(info?.voiceconfig?.type == 'music') {
                console.log(('[VOICE] Music was playing on '+guild.name).brightBlue);
                console.log('[VOICE] Not implemented yet !'.yellow);
            } else if(info?.voiceconfig?.type == 'radio') {
                if(!client.config.modules['radio'].enabled) return console.log('[VOICE] Radio module disabled, skipping...'.brightBlue);
                console.log(('[VOICE] Radio was playing on '+guild.name).brightBlue);  
                client.modules.radio.radioLoad(guild, info);
            } else {
                console.log(('[VOICE] Unknown type of music, skipping on '+guild.name+' ...').brightBlue);
            }
        });

        // handler for voice update to reconnect
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
            
            // check if the bot is in voice channel
            const connection = getVoiceConnection(newState.guild.id);
            if(connection) return; // if the bot is in a voice channel, return

            // check if type is radio or music
            if(config.voiceconfig.type == 'radio') {
                if(!client.config.modules['radio'].enabled) return console.log('[VOICE] Radio module disabled, skipping...'.brightBlue);
                console.log(('[VOICE] Radio was playing on '+newState.guild.name).brightBlue);
                client.modules.radio.radioLoad(newState.guild,config);
            } else if(config.voiceconfig.type == 'music') {
                console.log(('[VOICE] Music was playing on '+newState.guild.name).brightBlue);
                console.log('[VOICE] Not implemented yet !'.yellow);
            } else {
                console.log(('[VOICE] Unknown type of music, skipping on '+newState.guild.name+' ...').brightBlue);
            }
        });
    }
}