module.exports = {
    name: 'serverjoinquit',
    run: async(client) => {
        // event when the bot join a server
        client.on('guildCreate', async (guild) => {
            // check if the server exists in the database
            var server = await client.serversdb.findOne({ id: guild.id });
            if(!server){
                // create the server document
                await client.serversdb.createModel({
                    id: guild.id,
                });
                console.log(`[DATABASE] Joined a server, Server ${guild.id} added to database`.brightGreen);
            } else {
                console.log(`[DATABASE] Joined a server, Server ${guild.id} already in database`.brightBlue);
            }
        });
        // event when the bot quit a server
        client.on('guildDelete', async (guild) => {
            // check if the server exists in the database
            var server = await client.serversdb.findOne({ id: guild.id });
            if(server){
                // delete the server document
                await client.serversdb.deleteOne({ id: guild.id });
                console.log(`[DATABASE] Quit a server, Server ${guild.id} removed from database`.brightRed);
            } else {
                console.log(`[DATABASE] Quit a server, Server ${guild.id} not in database`.brightBlue);
            }
        });
    }
}