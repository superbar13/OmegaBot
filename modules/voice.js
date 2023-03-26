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
    }
}