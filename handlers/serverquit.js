module.exports = {
    name: 'serverquit',
    run: async(client) => {
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