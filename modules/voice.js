module.exports = {
    name: 'voice',
    run: async(client) => {
        client.players = new Map();
        client.responses = new Map();
        // loop in all servers
        client.guilds.cache.forEach(async guild => {
            // check if the music was playing
            var info = await client.serversdb.findOne({ id: guild.id }).select('music radio voiceconfig');

            console.log(('[VOICE] Checking if music was playing on '+guild.name).brightBlue);
            if(!info?.voiceconfig?.playing) return console.log('[VOICE] La musique n\'est pas en train de jouer, je ne fais rien sur le serveur '+guild.name+ ' !'.brightBlue);
            
            if(info?.voiceconfig?.type == 'music') {
                console.log(('[VOICE] Music was playing on '+guild.name).brightBlue);
                console.log('[VOICE] Not implemented yet !'.yellow);
            } else if(info?.voiceconfig?.type == 'radio') {
                if(!client.config.modules['radio'].enabled) return console.log('[VOICE] Radio module disabled, skipping...'.brightBlue);
                console.log(('[VOICE] Radio was playing on '+guild.name).brightBlue);  
                client.modules.radio.radioLoad(guild, info, client);
            } else {
                console.log('[VOICE] Unknown type of music, skipping on '+guild.name+' ...'.brightBlue);
            }
        });
    }
}