module.exports = {
    name: 'interaction',
    run: async(client) => {
        // interactionCreate event
        client.on('interactionCreate', async interaction => {
            // command is an slash command ?
            if (interaction.isChatInputCommand()) {
                // SLASH COMMAND
                // Seulement sur les commandes message donc on return du vide
                interaction.deleteToReply = async function () {}
                // execute the command
                interaction.client = client;
                if(!client.commands.get(interaction.commandName)) return;
                if(client.commands.get(interaction.commandName).type == "slash") {
                    try {
                        client.commands.get(interaction.commandName).execute(interaction);
                        console.log(`[SLASH] Commande slash ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen);
                    } catch (error) {
                        interaction.reply({ content: `Une erreur est survenue lors de l'exécution de la commande.`, ephemeral: true });
                        console.log(`[SLASH] Commande slash ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightRed);
                        console.log(error);
                    }
                }
            } else if (interaction.isSelectMenu()) {
                // SELECT MENU ON MESSAGE
                // execute the command
                interaction.client = client;
                if(!client.commands.get(interaction.commandName)) return;
                if(client.commands.get(interaction.commandName).type == "select") {
                    try {
                        client.commands.get(interaction.commandName).execute(interaction);
                        console.log(`[SELECT] Select menu ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen);
                    } catch (error) {}
                }    
            } else if (interaction.isUserContextMenuCommand()) {
                // RIGHT CLICK COMMAND ON USER
                // execute the command
                console.log(client.commands.get(interaction.commandName));
                interaction.client = client;
                if(!client.commands.get(interaction.commandName)) return;
                if(client.commands.get(interaction.commandName).type == "contextmenu") {
                    try {
                        client.commands.get(interaction.commandName).execute(interaction)
                        console.log(`[CONTEXT] Commande contextuelle ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen);
                    } catch (error) {
                        interaction.reply({ content: `Une erreur est survenue lors de l'exécution de la commande.`, ephemeral: true });
                        console.log(`[CONTEXT] Commande contextuelle ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightRed);
                        console.log(error);
                    }
                }    
            } else if (interaction.isMessageContextMenuCommand()) {
                // RIGHT CLICK COMMAND ON MESSAGE
                // execute the command
                interaction.client = client;
                if(!client.commands.get(interaction.commandName)) return;
                if(client.commands.get(interaction.commandName).type == "contextmenu") {
                    try {
                        client.commands.get(interaction.commandName).execute(interaction);
                        console.log(`[CONTEXT] Commande contextuelle ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen);
                    } catch (error) {
                        interaction.reply({ content: `Une erreur est survenue lors de l'exécution de la commande.`, ephemeral: true });
                        console.log(`[CONTEXT] Commande contextuelle ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightRed);
                        console.log(error);
                    }
                }
            } else if (interaction.isButton()) {
                // BUTTON CLICK ON MESSAGE
                // execute the command
                interaction.client = client;
                if(!client.commands.get(interaction.commandName)) return;
                if(client.commands.get(interaction.commandName).type == "button") {
                    try {
                        client.commands.get(interaction.commandName).execute(interaction);
                        console.log(`[BUTTON] Bouton ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen);
                    } catch (error) {}
                }
            } else if (interaction.isModalSubmit()) {
                // MODAL SUBMIT ON MESSAGE
                // execute the command
                interaction.client = client;
                if(!client.commands.get(interaction.commandName)) return;
                if(client.commands.get(interaction.commandName).type == "modal") {
                    try {
                        client.commands.get(interaction.commandName).execute(interaction);
                        console.log(`[MODAL] Modal ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen);
                    } catch (error) {}
                }
            }
        })
    }
}