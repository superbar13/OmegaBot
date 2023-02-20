module.exports = {
    name: 'voiceevent',
    run: async(client) => {
        client.players = new Map();
        // loop in all servers
        client.guilds.cache.forEach(async guild => {
            // check if the music was playing
            var info = await client.serversdb.findOne({ id: guild.id }).select('music radio voiceconfig');
            console.log('[VOICE] Checking if music or radio...'.brightBlue);
            var voiceconfig = info.voiceconfig;
            if(voiceconfig?.type == 'music'){
                console.log('[VOICE] Music was playing'.yellow);
                console.log('[VOICE] Not implemented yet !'.yellow);
            } else if(voiceconfig?.type == 'radio'){
                console.log('[VOICE] Radio was playing'.brightBlue);
                client.radio.radioLoad(guild, info,client);
            } else {
                console.log('[VOICE] No radio or music'.brightBlue);
            }
        });
    }
}