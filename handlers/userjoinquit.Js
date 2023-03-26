module.exports = {
    name: 'userjoinquit',
    run: async(client) => {
        // when a user join a server (guild)
        client.on('guildMemberAdd', async (member) => {
            // check if the user exists in the database
            var user = await client.usersdb.findOne({ id: member.id });
            if(!user){
                // create the member document
                await client.usersdb.createModel({
                    id: member.id,
                });
                console.log(`[DATABASE] Joined a server, User ${member.id} added to database`.brightGreen);
            } else {
                console.log(`[DATABASE] Joined a server, User ${member.id} already in database`.brightBlue);
            }
        });
    }
}