const { ActivityType } = require('discord.js');

module.exports = {
    name: 'radiostatus',
    run: async(client) => {
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
                client.user.setActivity(`${client.prefix}play`, { type: ActivityType.Listening });
            }
        }

        // toues les 20 secondes, changer le status du bot
        setInterval(function(){
            iserver = 0;
            changestatus();
        }, 20000);
    }
}