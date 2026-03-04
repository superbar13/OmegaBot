const { ChannelType } = require('discord.js');
const ratelimit = new Map();

function getLogContext(interaction) {
    if (interaction.guild) {
        return `, dans le serveur ${interaction.guild.name}, dans le salon ${interaction.channel?.name || 'inconnu'}`;
    } else {
        if (interaction.channel?.type === ChannelType.DM) {
            return `, en DM avec ${interaction.user.username}`;
        } else if (interaction.channel?.type === ChannelType.GroupDM) {
            return `, dans le groupe ${interaction.channel.name || interaction.user.username}`;
        } else {
            // Context user install or fallback
            return `, en contexte privé (DM/Groupe) avec ${interaction.user.username}`;
        }
    }
}

module.exports = {
    name: 'interaction',
    run: async (client) => {
        // interactionCreate event
        client.on('interactionCreate', async interaction => {
            // Get the command name either from the interaction itself or from the customId (for components)
            let commandName = interaction.commandName || interaction.customId?.split('_')[0] || interaction.customId;

            // check if the user is rate limited
            let command = client.commands.get(commandName);
            if (!command) return;
            if (command.ratelimit) {
                let blockedtime = command.rateblockedtime || process.env.BLOCKEDTIME || 30;
                let maxmessages = command.ratemaxmessages || process.env.MAXMESSAGES || 5;
                let removeafter = command.rateremoveafter || process.env.REMOVEAFTER || 30;

                // check if the user is in the ratelimit map
                if (ratelimit.get(interaction.user.id)) {
                    // if the user is ratelimited
                    if (ratelimit.get(interaction.user.id).ratelimit) {
                        if (ratelimit.get(interaction.user.id).time < Date.now()) {
                            // delete the user from the ratelimit map
                            ratelimit.delete(interaction.user.id);
                        } else {
                            // if the user has not been responded
                            if (!ratelimit.get(interaction.user.id).responded) {
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
                            if (ratelimit.get(interaction.user.id).nbofmessages == 0 && !ratelimit.get(interaction.user.id).ratelimit) ratelimit.delete(interaction.user.id);
                        }, removeafter * 1000);
                        // if the user has sent more than 5 messages in 30 seconds
                        if (ratelimit.get(interaction.user.id).nbofmessages > maxmessages) {
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
                    ratelimit.set(interaction.user.id, { time: Date.now(), responded: false, nbofmessages: 1, ratelimit: false });
                    // wait blockedtime seconds to remove 1 to the number of messages
                    setTimeout(() => {
                        ratelimit.get(interaction.user.id).nbofmessages--;
                        // if number of messages is 0, delete the user from the ratelimit map
                        if (ratelimit.get(interaction.user.id).nbofmessages == 0 && !ratelimit.get(interaction.user.id).ratelimit) ratelimit.delete(interaction.user.id);
                    }, removeafter * 1000);
                }
            }

            // command is an slash command ?
            if (interaction.isChatInputCommand()) {
                // SLASH COMMAND
                // Seulement sur les commandes message donc on return du vide
                interaction.deleteToReply = async function () { }
                // execute the command
                interaction.client = client;
                if (!client.commands.get(commandName)) return;
                if (client.commands.get(commandName).type == "slash") {
                    try {
                        client.commands.get(commandName).execute(interaction);
                        console.log(`[SLASH] Commande slash ${commandName} exécutée par ${interaction.user.username}${getLogContext(interaction)}`.brightGreen);
                    } catch (error) {
                        try {
                            if (interaction.replied || interaction.deferred) await interaction.followUp({ content: `Une erreur est survenue lors de l'exécution de la commande.`, flags: 64 });
                            else await interaction.reply({ content: `Une erreur est survenue lors de l'exécution de la commande.`, flags: 64 });
                        } catch (e) { }
                        console.log(`[SLASH] Commande slash ${commandName} exécutée par ${interaction.user.username}${getLogContext(interaction)}`.brightRed);
                        console.log(error);
                    }
                }
            } else if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu() || interaction.isUserSelectMenu() || interaction.isMentionableSelectMenu()) {
                // SELECT MENU ON MESSAGE
                // execute the command
                interaction.client = client;
                if (!client.commands.get(commandName)) return;
                // Accept 'select' or matching the default command type fallback
                if (['select', 'slash'].includes(client.commands.get(commandName).type)) {
                    try {
                        client.commands.get(commandName).execute(interaction);
                        console.log(`[SELECT] Select menu ${commandName} exécuté par ${interaction.user.username}${getLogContext(interaction)}`.brightGreen);
                    } catch (error) { }
                }
            } else if (interaction.isUserContextMenuCommand()) {
                // RIGHT CLICK COMMAND ON USER
                // execute the command
                interaction.client = client;
                if (!client.commands.get(commandName)) return;
                if (client.commands.get(commandName).type == "contextmenu") {
                    try {
                        client.commands.get(commandName).execute(interaction)
                        console.log(`[CONTEXT] Commande contextuelle ${commandName} exécutée par ${interaction.user.username}${getLogContext(interaction)}`.brightGreen);
                    } catch (error) {
                        try {
                            if (interaction.replied || interaction.deferred) await interaction.followUp({ content: `Une erreur est survenue lors de l'exécution de la commande.`, flags: 64 });
                            else await interaction.reply({ content: `Une erreur est survenue lors de l'exécution de la commande.`, flags: 64 });
                        } catch (e) { }
                        console.log(`[CONTEXT] Commande contextuelle ${commandName} exécutée par ${interaction.user.username}${getLogContext(interaction)}`.brightRed);
                        console.log(error);
                    }
                }
            } else if (interaction.isMessageContextMenuCommand()) {
                // RIGHT CLICK COMMAND ON MESSAGE
                // execute the command
                interaction.client = client;
                if (!client.commands.get(commandName)) return;
                if (client.commands.get(commandName).type == "contextmenu") {
                    try {
                        client.commands.get(commandName).execute(interaction);
                        console.log(`[CONTEXT] Commande contextuelle ${commandName} exécutée par ${interaction.user.username}${getLogContext(interaction)}`.brightGreen);
                    } catch (error) {
                        try {
                            if (interaction.replied || interaction.deferred) await interaction.followUp({ content: `Une erreur est survenue lors de l'exécution de la commande.`, flags: 64 });
                            else await interaction.reply({ content: `Une erreur est survenue lors de l'exécution de la commande.`, flags: 64 });
                        } catch (e) { }
                        console.log(`[CONTEXT] Commande contextuelle ${commandName} exécutée par ${interaction.user.username}${getLogContext(interaction)}`.brightRed);
                        console.log(error);
                    }
                }
            } else if (interaction.isButton()) {
                // BUTTON CLICK ON MESSAGE
                // execute the command
                interaction.client = client;
                if (!client.commands.get(commandName)) return;
                // Accept 'button' or matching the default command type fallback
                if (['button', 'slash'].includes(client.commands.get(commandName).type)) {
                    try {
                        client.commands.get(commandName).execute(interaction);
                        console.log(`[BUTTON] Bouton ${commandName} exécuté par ${interaction.user.username}${getLogContext(interaction)}`.brightGreen);
                    } catch (error) { }
                }
            } else if (interaction.isModalSubmit()) {
                // MODAL SUBMIT ON MESSAGE
                // execute the command
                interaction.client = client;
                if (!client.commands.get(commandName)) return;
                // Accept 'modal' or matching the default command type fallback
                if (['modal', 'slash'].includes(client.commands.get(commandName).type)) {
                    try {
                        client.commands.get(commandName).execute(interaction);
                        console.log(`[MODAL] Modal ${commandName} exécuté par ${interaction.user.username}${getLogContext(interaction)}`.brightGreen);
                    } catch (error) { }
                }
            } else if (interaction.isAutocomplete()) {
                // AUTOCOMPLETE ON MESSAGE
                // execute the command
                interaction.client = client;
                if (!client.commands.get(commandName)) return;

                try {
                    client.commands.get(commandName).autocomplete(interaction);
                } catch (error) { }
            }
        })
    }
}