module.exports = {
    name: 'userjoinquit',
    run: async(client) => {
        // when a user join a server (guild)
        client.on('guildMemberAdd', async (member) => {
            // member is bot ? return
            if(member.user.bot) return;
            // check if the user exists in the database
            var user = await client.usersdb.findOne({ id: member.id });
            if(!user){
                // create the member document
                await client.usersdb.createModel({
                    id: member.id,
                });
                console.log(`[DATABASE] User joined a server, User ${member.id} added to database`.brightGreen);
            } else {
                console.log(`[DATABASE] User joined a server, User ${member.id} already in database`.brightBlue);
            }
        });
    }
}