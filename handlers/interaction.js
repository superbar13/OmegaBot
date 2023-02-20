module.exports = {
    name: 'interaction',
    run: async(client) => {
        // interactionCreate event
        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
            // check if permission is needed to use the command
            if (interaction?.command?.permissions && interaction?.command?.permissions.length > 0) {
                // check if the user has the permission to use the command
                if (!interaction.member.permissions.has(interaction.command.permissions)) {
                    // send a message to the user
                    interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });
                    return;
                } else {
                    // execute the command
                    interaction.client = client;
                    client.commands.get(interaction.commandName).execute(interaction)
                    console.log(`[SLASH] Commande slash ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen)
                }
            } else {
                // execute the command
                interaction.client = client;
                client.commands.get(interaction.commandName).execute(interaction)
                console.log(`[SLASH] Commande slash ${interaction.commandName} exécutée par ${interaction.user.username} (sans permission), dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen)
            }
        })
    }
}