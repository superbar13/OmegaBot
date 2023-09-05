const ratelimit = new Map();

module.exports = {
    name: 'interaction',
    run: async(client) => {
        // interactionCreate event
        client.on('interactionCreate', async interaction => {
            // check if the user is rate limited
            let command = client.commands.get(interaction.commandName);
            if(!command) return;
            if(command.ratelimit) {
                let blockedtime = command.rateblockedtime || process.env.BLOCKEDTIME || 30;
                let maxmessages = command.ratemaxmessages || process.env.MAXMESSAGES || 5;
                let removeafter = command.rateremoveafter || process.env.REMOVEAFTER || 30;

                // check if the user is in the ratelimit map
                if(ratelimit.get(interaction.user.id)) {
                    // if the user is ratelimited
                    if(ratelimit.get(interaction.user.id).ratelimit) {
                        if(ratelimit.get(interaction.user.id).time < Date.now()) {
                            // delete the user from the ratelimit map
                            ratelimit.delete(interaction.user.id);
                        } else {
                            // if the user has not been responded
                            if(!ratelimit.get(interaction.user.id).responded) {
                                // send a message to the user
                                await interaction.reply('Vous êtes bannis des commandes pendant ' + blockedtime + ' secondes pour avoir spammer les commandes, le bot ne répondra plus à vos commandes pendant ' + blockedtime + ' secondes.');
                                // set responded to true
                                ratelimit.get(interaction.user.id).responded = true;
                                // return
                                return;
                            } else return;
                        }
                    } else {
                        // add 1 to the number of messages
                        ratelimit.get(interaction.user.id).nbofmessages++;
                        // wait 30 seconds to remove 1 to the number of messages
                        setTimeout(() => {
                            ratelimit.get(interaction.user.id).nbofmessages--;
                            // if number of messages is 0, delete the user from the ratelimit map
                            if(ratelimit.get(interaction.user.id).nbofmessages == 0 && !ratelimit.get(interaction.user.id).ratelimit) ratelimit.delete(interaction.user.id);
                        }, removeafter * 1000);
                        // if the user has sent more than 5 messages in 30 seconds
                        if(ratelimit.get(interaction.user.id).nbofmessages > maxmessages) {
                            // set ratelimit to true
                            ratelimit.get(interaction.user.id).ratelimit = true;
                            // set time to blockedtime seconds
                            ratelimit.get(interaction.user.id).time = Date.now() + (blockedtime * 1000);
                            // send a message to the user
                            await interaction.reply('Vous êtes en train de spammer les commandes, veuillez patienter ' + blockedtime + ' secondes avant de pouvoir réutiliser une commande.');
                            // return
                            return;
                        }
                    }
                // add the user to the ratelimit map
                } else {
                    ratelimit.set(interaction.user.id, {time: Date.now(), responded: false, nbofmessages: 1, ratelimit: false});
                    // wait blockedtime seconds to remove 1 to the number of messages
                    setTimeout(() => {
                        ratelimit.get(interaction.user.id).nbofmessages--;
                        // if number of messages is 0, delete the user from the ratelimit map
                        if(ratelimit.get(interaction.user.id).nbofmessages == 0 && !ratelimit.get(interaction.user.id).ratelimit) ratelimit.delete(interaction.user.id);
                    }, removeafter * 1000);
                }
            }

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
            } else if (interaction.isStringSelectMenu()) {
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
            } else if (interaction.isAutocomplete()) {
                // AUTOCOMPLETE ON MESSAGE
                // execute the command
                interaction.client = client;
                if(!client.commands.get(interaction.commandName)) return;
                
                try {
                    client.commands.get(interaction.commandName).autocomplete(interaction);
                    // console.log(`[AUTOCOMPLETE] Autocomplete ${interaction.commandName} exécutée par ${interaction.user.username}, dans le serveur ${interaction.guild.name} , dans le salon ${interaction.channel.name}`.brightGreen);
                } catch (error) {}
            }
        })
    }
}