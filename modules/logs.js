module.exports = {
    name: 'logs',
    showname: 'Logs',
    guildSchemaAddition: {
        logs: {
            enabled: {
                type: Boolean,
                default: false,
            },
            channel: {
                type: String,
            },
            components: {
                channelCreate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                channelDelete: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                channelUpdate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                ThreadCreate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                ThreadDelete: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                ThreadUpdate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                ThreadMembersUpdate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                ThreadMemberUpdate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                memberJoin: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                memberLeave: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                messageDelete: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                messageUpdate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                messageBulkDelete: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                roleCreate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                roleDelete: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                roleUpdate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: String,
                    },
                },
                roleMemberAdd: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                roleMemberRemove: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                inviteCreate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                inviteDelete: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                emojiCreate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                emojiDelete: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                emojiUpdate: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                memberJoinVoice: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                memberLeaveVoice: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                memberSwitchVoice: {
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                userUpdate: { // username, displayname, profile picture, etc...
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
                memberUpdate: { // nickname, custom profile picture, etc...
                    enabled: {
                        type: Boolean,
                        default: true,
                    },
                    channel: {
                        type: Number,
                    }
                },
            },
        },
    },
    guildconfig: {
        logs: {
            displayname: 'Logs',
            description: 'Configurez les logs du serveur',
            type: 'databasecategory',
            showed: true,
            childs: {
                enabled: {
                    displayname: 'Activé',
                    description: 'Active ou désactive les logs',
                    type: 'boolean',
                },
                channel: {
                    displayname: 'Channel',
                    description: 'Le channel où seront envoyés les logs',
                    type: 'channel',
                },
                components: {
                    displayname: 'Composants',
                    description: 'Configurez les composants des logs',
                    type: 'databasecategory',
                    showed: true,
                    childs: {
                        channelCreate: {
                            displayname: 'ChannelCreate',
                            description: 'Configurez les logs de création de channel',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de création de channel',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de création de channel',
                                    type: 'channel',
                                },
                            },
                        },
                        channelDelete: {
                            displayname: 'ChannelDelete',
                            description: 'Configurez les logs de suppression de channel',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de suppression de channel',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression de channel',
                                    type: 'channel',
                                },
                            },
                        },
                        channelUpdate: {
                            displayname: 'ChannelUpdate',
                            description: 'Configurez les logs de modification de channel',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de modification de channel',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de modification de channel',
                                    type: 'channel',
                                },
                            },
                        },
                        ThreadCreate: {
                            displayname: 'ThreadCreate',
                            description: 'Configurez les logs de création de thread',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active les logs de création de thread',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de création de thread',
                                    type: 'channel',
                                },
                            },
                        },
                        ThreadDelete: {
                            displayname: 'ThreadDelete',
                            description: 'Configurez les logs de suppression de thread',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active les logs de suppression de thread',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression de thread',
                                    type: 'channel',
                                },
                            },
                        },
                        ThreadUpdate: {
                            displayname: 'ThreadUpdate',
                            description: 'Configurez les logs de modification de thread',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active les logs de modification de thread',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de modification de thread',
                                    type: 'channel',
                                },
                            },
                        },
                        ThreadMembersUpdate: {
                            displayname: 'ThreadMembersUpdate',
                            description: 'Configurez les logs de modification de membres de thread (ajout ou suppression de membre)',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: `Active les logs de modification de membres de thread (ajout ou suppression de membre)`,
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: `Le channel où seront envoyés les logs de modification de membres de thread (ajout ou suppression de membre)`,
                                    type: 'channel',
                                },
                            },
                        },
                        ThreadMemberUpdate: {
                            displayname: 'ThreadMemberUpdate',
                            description: 'Configurez les logs de modification de membre de thread (modification de permissions)',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: `Active les logs de modification de membre de thread (modification de permissions)`,
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: `Le channel où seront envoyés les logs de modification de membre de thread (modification de permissions)`,
                                    type: 'channel',
                                },
                            },
                        },
                        memberJoin: {
                            displayname: 'MemberJoin',
                            description: 'Configurez les logs d\'arrivée de membre',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs d\'arrivée de membre',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs d\'arrivée de membre',
                                    type: 'channel',
                                },
                            },
                        },
                        memberLeave: {
                            displayname: 'MemberLeave',
                            description: 'Configurez les logs de départ de membre',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de départ de membre',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de départ de membre',
                                    type: 'channel',
                                },
                            },
                        },
                        messageDelete: {
                            displayname: 'MessageDelete',
                            description: 'Configurez les logs de suppression de message',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de suppression de message',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression de message',
                                    type: 'channel',
                                },
                            },
                        },
                        messageUpdate: {
                            displayname: 'MessageUpdate',
                            description: 'Configurez les logs de modification de message',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de modification de message',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de modification de message',
                                    type: 'channel',
                                },
                            },
                        },
                        messageBulkDelete: {
                            displayname: 'MessageBulkDelete',
                            description: 'Configurez les logs de suppression de messages en masse (plusieurs messages à la fois)',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de suppression de messages en masse (plusieurs messages à la fois)',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression de messages en masse (plusieurs messages à la fois)',
                                    type: 'channel',
                                },
                            },
                        },
                        roleCreate: {
                            displayname: 'RoleCreate',
                            description: 'Configurez les logs de création de rôle',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de création de rôle',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de création de rôle',
                                    type: 'channel',
                                },
                            },
                        },
                        roleDelete: {
                            displayname: 'RoleDelete',
                            description: 'Configurez les logs de suppression de rôle',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de suppression de rôle',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression de rôle',
                                    type: 'channel',
                                },
                            },
                        },
                        roleUpdate: {
                            displayname: 'RoleUpdate',
                            description: 'Configurez les logs de modification de rôle',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active ou désactive les logs de modification de rôle',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de modification de rôle',
                                    type: 'channel',
                                },
                            },
                        },
                        roleMemberAdd: {
                            displayname: 'RoleMemberAdd',
                            description: 'Configurez les logs d\'ajout de rôle à un membre',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Active les logs d\'ajout de rôle à un membre',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs d\'ajout de rôle à un membre',
                                    type: 'channel',
                                },
                            },
                        },
                        roleMemberRemove: {
                            displayname: 'RoleMemberRemove',
                            description: 'Configurez les logs de suppression de rôle à un membre',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de suppression de rôle à un membre',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression de rôle à un membre',
                                    type: 'channel',
                                },
                            },
                        },
                        inviteCreate: {
                            displayname: 'InviteCreate',
                            description: 'Configurez les logs de création d\'invitation',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de création d\'invitation',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de création d\'invitation',
                                    type: 'channel',
                                },
                            },
                        },
                        inviteDelete: {
                            displayname: 'InviteDelete',
                            description: 'Configurez les logs de suppression d\'invitation',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de suppression d\'invitation',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression d\'invitation',
                                    type: 'channel',
                                },
                            },
                        },
                        emojiCreate: {
                            displayname: 'EmojiCreate',
                            description: 'Configurez les logs de création d\'emoji',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de création d\'emoji',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de création d\'emoji',
                                    type: 'channel',
                                },
                            },
                        },
                        emojiDelete: {
                            displayname: 'EmojiDelete',
                            description: 'Configurez les logs de suppression d\'emoji',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de suppression d\'emoji',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de suppression d\'emoji',
                                    type: 'channel',
                                },
                            },
                        },
                        emojiUpdate: {
                            displayname: 'EmojiUpdate',
                            description: 'Configurez les logs de modification d\'emoji',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de modification d\'emoji',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de modification d\'emoji',
                                    type: 'channel',
                                },
                            },
                        },
                        memberJoinVoice: {
                            displayname: 'MemberJoinVoice',
                            description: 'Configurez les logs d\'arrivée de membre dans un salon vocal',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs d\'arrivée de membre dans un salon vocal',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs d\'arrivée de membre dans un salon vocal',
                                    type: 'channel',
                                },
                            },
                        },
                        memberLeaveVoice: {
                            displayname: 'MemberLeaveVoice',
                            description: 'Configurez les logs de départ de membre dans un salon vocal',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de départ de membre dans un salon vocal',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de départ de membre dans un salon vocal',
                                    type: 'channel',
                                },
                            },
                        },
                        memberSwitchVoice: {
                            displayname: 'MemberSwitchVoice',
                            description: 'Configurez les logs de changement de salon vocal d\'un membre',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de changement de salon vocal d\'un membre',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de changement de salon vocal d\'un membre',
                                    type: 'channel',
                                },
                            },
                        },
                        userUpdate: {
                            displayname: 'UserUpdate',
                            description: 'Configurez les logs de modification d\'utilisateur (pseudo, photo de profil, etc...)',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de modification d\'utilisateur (pseudo, photo de profil, etc...)',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de modification d\'utilisateur (pseudo, photo de profil, etc...)',
                                    type: 'channel',
                                },
                            },
                        },
                        memberUpdate: {
                            displayname: 'MemberUpdate',
                            description: 'Configurez les logs de modification de membre (surnom, photo de profil personnalisée, etc...)',
                            type: 'databasecategory',
                            showed: true,
                            childs: {
                                enabled: {
                                    displayname: 'Activé',
                                    description: 'Les logs de modification de membre (surnom, photo de profil personnalisée, etc...)',
                                    type: 'boolean',
                                },
                                channel: {
                                    displayname: 'Channel',
                                    description: 'Le channel où seront envoyés les logs de modification de membre (surnom, photo de profil personnalisée, etc...)',
                                    type: 'channel',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    run: async(client) => {
        const { EmbedBuilder } = require('discord.js');
        const moment = require('moment');
        const { AuditLogEvent } = require('discord.js');

        // when a channel is created
        client.on('channelCreate', async channel => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: channel.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the channelCreate logs are not enabled, return
            if(!guildConfig.logs.components.channelCreate.enabled) return;
            
            // get the channel logs
            var channelLogs = channel.guild.channels.cache.get(guildConfig.logs.components.channelCreate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === channel.id &&
                entry.targetType === 'Channel' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➕ Channel créé !')
                .setDescription(`Un channel a été créé !` +
                `\n📝 Nom : **${channel.name}**` +
                `\n📅 Date de création : **${moment(channel.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${channel.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor("#338C33");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a channel is deleted
        client.on('channelDelete', async channel => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: channel.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the channelDelete logs are not enabled, return
            if(!guildConfig.logs.components.channelDelete.enabled) return;
            
            // get the channel logs
            var channelLogs = channel.guild.channels.cache.get(guildConfig.logs.components.channelDelete.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === channel.id &&
                entry.targetType === 'Channel' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➖ Channel supprimé !')
                .setDescription(`Un channel a été supprimé !` +
                `\n📝 Nom : **${channel.name}**` +
                `\n📅 Date de création : **${moment(channel.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${channel.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor("#F90004");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a channel is updated
        client.on('channelUpdate', async (oldChannel, newChannel) => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: oldChannel.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the channelUpdate logs are not enabled, return
            if(!guildConfig.logs.components.channelUpdate.enabled) return;
            
            // get the channel logs
            var channelLogs = oldChannel.guild.channels.cache.get(guildConfig.logs.components.channelUpdate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await oldChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === oldChannel.id &&
                entry.targetType === 'Channel' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('🔃 Channel modifié !')
                .setDescription(`Un channel a été modifié !
                \n📝 Nom : **${newChannel.name}**` +
                `\n📅 Date de création : **${moment(oldChannel.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${oldChannel.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor('#FFD900');

            // check if the name has been changed
            // check if a thing has been changed
            if(oldChannel.name !== newChannel.name || oldChannel.type !== newChannel.type || oldChannel.parent !== newChannel.parent || oldChannel.topic !== newChannel.topic || oldChannel.nsfw !== newChannel.nsfw || oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser || oldChannel.bitrate !== newChannel.bitrate || oldChannel.userLimit !== newChannel.userLimit || oldChannel.permissionOverwrites !== newChannel.permissionOverwrites || oldChannel.position !== newChannel.position) {
                if(oldChannel.name !== newChannel.name) embed.addFields({ name: '🔃 Nom changé', value: `**Ancien nom :** ${oldChannel.name}\n**Nouveau nom :** ${newChannel.name}` });
                if(oldChannel.type !== newChannel.type) embed.addFields({ name: '🔃 Type changé', value: `**Ancien type :** ${oldChannel.type}\n**Nouveau type :** ${newChannel.type}` });
                if(oldChannel.parent !== newChannel.parent) embed.addFields({ name: '🔃 Catégorie changée', value: `**Ancienne catégorie :** ${oldChannel.parent || 'Aucune'}\n**Nouvelle catégorie :** ${newChannel.parent || 'Aucune'}` });
                if(oldChannel.topic !== newChannel.topic) embed.addFields({ name: '🔃 Description changée', value: `**Ancienne description :** ${oldChannel.topic || 'Aucune'}\n**Nouvelle description :** ${newChannel.topic || 'Aucune'}` });
                if(oldChannel.nsfw !== newChannel.nsfw) embed.addFields({ name: '🔃 NSFW changé', value: `**Ancien NSFW :** ${oldChannel.nsfw || 'Aucun'}\n**Nouveau NSFW :** ${newChannel.nsfw || 'Aucun'}` });
                if(oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) embed.addFields({ name: '🔃 Slowmode changé', value: `**Ancien Slowmode : ** ${oldChannel.rateLimitPerUser || 'Aucun'}\n**Nouveau slowmode : ** ${newChannel.rateLimitPerUser || 'Aucun'}` });
                if(oldChannel.bitrate !== newChannel.bitrate) embed.addFields({ name: '🔃 Débit binaire changé', value: `**Ancien débit binaire :** ${oldChannel.bitrate || 'Aucun'}\n**Nouveau débit binaire :** ${newChannel.bitrate || 'Aucun'}` });
                if(oldChannel.userLimit !== newChannel.userLimit) embed.addFields({ name: '🔃 Limite de membre changée', value: `**Ancienne limite de membre :** ${oldChannel.userLimit || 'Aucune'}\n**Nouvelle limite de membre :** ${newChannel.userLimit || 'Aucune'}` });
                if(oldChannel.permissionOverwrites.toString() !== newChannel.permissionOverwrites.toString()) {
                    var oldOverwrites = oldChannel.permissionOverwrites.map(overwrite => {
                        return {
                            id: overwrite.id,
                            type: overwrite.type,
                            allow: overwrite.allow.toArray(),
                            deny: overwrite.deny.toArray(),
                        }
                    });
                    var newOverwrites = newChannel.permissionOverwrites.map(overwrite => {
                        return {
                            id: overwrite.id,
                            type: overwrite.type,
                            allow: overwrite.allow.toArray(),
                            deny: overwrite.deny.toArray(),
                        }
                    });
                    var oldOverwritesString = '';
                    var newOverwritesString = '';
                    oldOverwrites.forEach(overwrite => {
                        oldOverwritesString += `**${overwrite.type === 'role' ? oldChannel.guild.roles.cache.get(overwrite.id).name : oldChannel.guild.members.cache.get(overwrite.id)?.user.tag} :**\n${overwrite.allow.length > 0 ? `**Autorisations :** ${overwrite.allow.map(perm => `\`${perm}\``).join(', ')}\n` : ''}${overwrite.deny.length > 0 ? `**Interdictions :** ${overwrite.deny.map(perm => `\`${perm}\``).join(', ')}` : ''}\n\n`;
                    });
                    newOverwrites.forEach(overwrite => {
                        newOverwritesString += `**${overwrite.type === 'role' ? newChannel.guild.roles.cache.get(overwrite.id).name : newChannel.guild.members.cache.get(overwrite.id)?.user.tag} :**\n${overwrite.allow.length > 0 ? `**Autorisations :** ${overwrite.allow.map(perm => `\`${perm}\``).join(', ')}\n` : ''}${overwrite.deny.length > 0 ? `**Interdictions :** ${overwrite.deny.map(perm => `\`${perm}\``).join(', ')}` : ''}\n\n`;
                    });
                    embed.addFields({ name: '🔃 Permissions changées', value: `**Anciennes permissions :**\n${oldOverwritesString}\n**Nouvelles permissions :**\n${newOverwritesString}` });
                    
                }
                if(oldChannel.position !== newChannel.position) embed.addFields({ name: '🔃 Position changée', value: `**Ancienne position :** ${oldChannel.position || 'Aucune'}\n**Nouvelle position :** ${newChannel.position || 'Aucune'}` });
            } else return;

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a thread is created
        client.on('threadCreate', async thread => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: thread.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the ThreadCreate logs are not enabled, return
            if(!guildConfig.logs.components.ThreadCreate.enabled) return;

            // get the channel logs
            var channelLogs = thread.guild.channels.cache.get(guildConfig.logs.components.ThreadCreate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await thread.guild.fetchAuditLogs({ type: AuditLogEvent.ThreadCreate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === thread.id &&
                entry.targetType === 'Thread' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➕ Thread créé !')
                .setDescription(`Un thread a été créé !` +
                `\n📝 Nom : **${thread.name}**` +
                `\n📅 Date de création : **${moment(thread.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${thread.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor("#338C33");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a thread is deleted
        client.on('threadDelete', async thread => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: thread.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the ThreadDelete logs are not enabled, return
            if(!guildConfig.logs.components.ThreadDelete.enabled) return;

            // get the channel logs
            var channelLogs = thread.guild.channels.cache.get(guildConfig.logs.components.ThreadDelete.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await thread.guild.fetchAuditLogs({ type: AuditLogEvent.ThreadDelete, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === thread.id &&
                entry.targetType === 'Thread' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➖ Thread supprimé !')
                .setDescription(`Un thread a été supprimé !` +
                `\n📝 Nom : **${thread.name}**` +
                `\n📅 Date de création : **${moment(thread.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${thread.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor("#F90004");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a thread is updated
        client.on('threadUpdate', async (oldThread, newThread) => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: oldThread.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return  
            if(!guildConfig.logs.enabled) return;

            // if the ThreadUpdate logs are not enabled, return
            if(!guildConfig.logs.components.ThreadUpdate.enabled) return;

            // get the channel logs
            var channelLogs = oldThread.guild.channels.cache.get(guildConfig.logs.components.ThreadUpdate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await oldThread.guild.fetchAuditLogs({ type: AuditLogEvent.ThreadUpdate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === oldThread.id &&
                entry.targetType === 'Thread' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('🔃 Thread modifié !')
                .setDescription(`Un thread a été modifié !
                \n📝 Nom : **${newThread.name}**` +
                `\n📅 Date de création : **${moment(oldThread.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${oldThread.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor('#FFD900');

            // check if the name has been changed
            // check if a thing has been changed
            if(oldThread.name !== newThread.name || oldThread.type !== newThread.type || oldThread.parent !== newThread.parent || oldThread.topic !== newThread.topic || oldThread.nsfw !== newThread.nsfw || oldThread.rateLimitPerUser !== newThread.rateLimitPerUser || oldThread.bitrate !== newThread.bitrate || oldThread.userLimit !== newThread.userLimit || oldThread.permissionOverwrites !== newThread.permissionOverwrites || oldThread.position !== newThread.position) {
                if(oldThread.name !== newThread.name) embed.addFields({ name: '🔃 Nom changé', value: `**Ancien nom :** ${oldThread.name}\n**Nouveau nom :** ${newThread.name}` });
                if(oldThread.type !== newThread.type) embed.addFields({ name: '🔃 Type changé', value: `**Ancien type :** ${oldThread.type}\n**Nouveau type :** ${newThread.type}` });
                if(oldThread.parent !== newThread.parent) embed.addFields({ name: '🔃 Catégorie changée', value: `**Ancienne catégorie :** ${oldThread.parent || 'Aucune'}\n**Nouvelle catégorie :** ${newThread.parent || 'Aucune'}` });
                if(oldThread.topic !== newThread.topic) embed.addFields({ name: '🔃 Description changée', value: `**Ancienne description :** ${oldThread.topic || 'Aucune'}\n**Nouvelle description :** ${newThread.topic || 'Aucune'}` });
                if(oldThread.nsfw !== newThread.nsfw) embed.addFields({ name: '🔃 NSFW changé', value: `**Ancien NSFW :** ${oldThread.nsfw || 'Aucun'}\n**Nouveau NSFW :** ${newThread.nsfw || 'Aucun'}` });
            } else return;

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when members are added or removed from a thread
        client.on('threadMembersUpdate', async (thread, oldMembers, newMembers) => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: thread.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the ThreadMembersUpdate logs are not enabled, return
            if(!guildConfig.logs.components.ThreadMembersUpdate.enabled) return;

            // get the channel logs
            var channelLogs = thread.guild.channels.cache.get(guildConfig.logs.components.ThreadMembersUpdate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await thread.guild.fetchAuditLogs({ type: AuditLogEvent.ThreadMembersUpdate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === thread.id &&
                entry.targetType === 'Thread' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('🔃 Membres du thread modifiés !')
                .setDescription(`Les membres du thread ont été modifiés !
                \n📝 Nom : **${thread.name}**` +
                `\n📅 Date de création : **${moment(thread.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${thread.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor('#FFD900');

            // check if members have been added or removed
            if(oldMembers.size !== newMembers.size) {
                if(oldMembers.size > newMembers.size) {
                    // get the removed members
                    var removedMembers = oldMembers.filter(member => !newMembers.has(member.id));
                    // add the removed members to the embed
                    embed.addFields({ name: '➖ Membres retirés', value: removedMembers.map(member => `**${member.user.tag}** (${member.id})`).join('\n') });
                } else if(oldMembers.size < newMembers.size) {
                    // get the added members
                    var addedMembers = newMembers.filter(member => !oldMembers.has(member.id));
                    // add the added members to the embed
                    embed.addFields({ name: '➕ Membres ajoutés', value: addedMembers.map(member => `**${member.user.tag}** (${member.id})`).join('\n') });
                }
            } else return;

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when member permissions are updated in a thread
        client.on('threadMemberUpdate', async (thread, oldMember, newMember) => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: thread.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the ThreadMemberUpdate logs are not enabled, return
            if(!guildConfig.logs.components.ThreadMemberUpdate.enabled) return;

            // get the channel logs
            var channelLogs = thread.guild.channels.cache.get(guildConfig.logs.components.ThreadMemberUpdate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await thread.guild.fetchAuditLogs({ type: AuditLogEvent.ThreadMemberUpdate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === thread.id &&
                entry.targetType === 'Thread' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('🔃 Permissions du membre du thread modifiées !')
                .setDescription(`Les permissions du membre du thread ont été modifiées !
                \n📝 Nom : **${thread.name}**` +
                `\n📅 Date de création : **${moment(thread.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${thread.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor('#FFD900');

            // check if the permissions have been changed
            if(oldMember.permissions !== newMember.permissions) {
                // get the permissions that have been added
                var addedPermissions = newMember.permissions.toArray().filter(permission => !oldMember.permissions.toArray().includes(permission));
                // get the permissions that have been removed
                var removedPermissions = oldMember.permissions.toArray().filter(permission => !newMember.permissions.toArray().includes(permission));
                // add the permissions to the embed
                if(addedPermissions.length > 0) embed.addFields({ name: '➕ Permissions ajoutées', value: addedPermissions.map(permission => `**${permission}**`).join('\n') });
                if(removedPermissions.length > 0) embed.addFields({ name: '➖ Permissions retirées', value: removedPermissions.map(permission => `**${permission}**`).join('\n') });
            } else return;

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a member join the server
        client.on('guildMemberAdd', async member => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: member.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the memberJoin logs are not enabled, return
            if(!guildConfig.logs.components.memberJoin.enabled) return;
            
            // get the channel logs
            var channelLogs = member.guild.channels.cache.get(guildConfig.logs.components.memberJoin.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('Membre rejoint !')
                .setDescription(`Un membre a rejoint le serveur !` +
                `\n👤 Pseudo : **${member.user.tag}**` +
                `\n📅 Date de création : **${moment(member.user.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${member.id}` })
                .setAuthor({ name: `${member.user.tag} (${member.user.id})`, iconURL: member.user.displayAvatarURL() })
                .setColor("#338C33");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a member leave the server
        client.on('guildMemberRemove', async member => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: member.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the memberLeave logs are not enabled, return
            if(!guildConfig.logs.components.memberLeave.enabled) return;
            
            // get the channel logs
            var channelLogs = member.guild.channels.cache.get(guildConfig.logs.components.memberLeave.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('Membre parti !')
                .setDescription(`Un membre a quitté le serveur !` +
                `\n👤 Pseudo : **${member.user.tag}**` +
                `\n📅 Date de création : **${moment(member.user.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${member.id}` })
                .setAuthor({ name: `${member.user.tag} (${member.user.id})`, iconURL: member.user.displayAvatarURL() })
                .setColor("#F90004");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a message is deleted
        client.on('messageDelete', async message => {
            // message d'un bot
            if(message?.author?.bot) return;

            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: message.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the messageDelete logs are not enabled, return
            if(!guildConfig.logs.components.messageDelete.enabled) return;
            
            // get the channel logs
            var channelLogs = message.guild.channels.cache.get(guildConfig.logs.components.messageDelete.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === message.id &&
                entry.targetType === 'Message' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➖ Message supprimé !')
                .setDescription(`Un message a été supprimé !` +
                `\n👤 Auteur : **${message.author.tag}** (${message.author.id})` +
                `\n📅 Date de création : **${moment(message.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setColor("#F90004")
                .setFooter({ text: `🌐 ID : ${message.id}` })
                .addFields({
                    name: '💭 Message',
                    value: message.content.toString() || 'Aucun contenu (peut-être une image ou un embed)',
                });

            if(auditLog) embed.setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
            else embed.setAuthor({ name: `${message.author.tag} (${message.author.id})`, iconURL: message.author.displayAvatarURL() });

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a message is updated
        client.on('messageUpdate', async (oldMessage, newMessage) => {
            // message d'un bot
            if(oldMessage?.author?.bot) return;

            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: oldMessage.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the messageUpdate logs are not enabled, return
            if(!guildConfig.logs.components.messageUpdate.enabled) return;
            
            // get the channel logs
            var channelLogs = oldMessage.guild.channels.cache.get(guildConfig.logs.components.messageUpdate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('🔃 Message modifié !')
                .setDescription(`Un message a été modifié !` +
                `\n👤 Auteur : **${oldMessage.author.tag}** (${oldMessage.author.id})` +
                `\n📅 Date de création : **${moment(oldMessage.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setColor("#FFD900")
                .setFooter({ text: `🌐 ID : ${oldMessage.id}` })
                .setAuthor({ name: `${oldMessage.author.tag} (${oldMessage.author.id})`, iconURL: oldMessage.author.displayAvatarURL() })
                .addFields({
                    name: '⏮️ Ancien message',
                    value: oldMessage.content.toString() || 'Aucun ancien contenu (peut-être une image ou un embed)',
                },
                {
                    name: '⏭️ Nouveau message',
                    value: newMessage.content.toString() || 'Aucun nouveau contenu (peut-être une image ou un embed)',
                });

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when messages are deleted in bulk
        client.on('MessageBulkDelete', async messages => {
            // if the messages are from a bot
            messages = messages.filter(message => !message?.author?.bot);

            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: messages.first().guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // if the messageBulkDelete logs are not enabled, return
            if(!guildConfig.logs.components.messageBulkDelete.enabled) return;
            
            // get the channel logs
            var channelLogs = messages.first().guild.channels.cache.get(guildConfig.logs.components.messageBulkDelete.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await messages.first().guild.fetchAuditLogs({ type: AuditLogEvent.MessageBulkDelete, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.createdAt > Date.now() - 5000
            ).first();
            console.log(auditLog.targetType, auditLog.targetId);

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➖ Messages supprimés !')
                .setDescription(`Plusieurs messages ont été supprimés !` +
                `\n✅ Nombre de messages : **${messages.size}**`)
                .setTimestamp()
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor("#F90004")

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a role is created
        client.on('roleCreate', async role => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: role.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the roleCreate logs are not enabled, return
            if(!guildConfig.logs.components.roleCreate.enabled) return;

            // get the channel logs
            var channelLogs = role.guild.channels.cache.get(guildConfig.logs.components.roleCreate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === role.id &&
                entry.targetType === 'Role' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➕ Rôle créé !')
                .setDescription(`Un rôle a été créé !` +
                `\n📝 Nom : **${role.name}**` +
                `\n📅 Date de création : **${moment(role.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${role.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor(role.color);

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a role is deleted
        client.on('roleDelete', async role => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: role.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the roleDelete logs are not enabled, return
            if(!guildConfig.logs.components.roleDelete.enabled) return;

            // get the channel logs
            var channelLogs = role.guild.channels.cache.get(guildConfig.logs.components.roleDelete.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === role.id &&
                entry.targetType === 'Role' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // get the role's members
            var members = role.guild.members.cache.filter(member => member.roles.cache.has(role.id));

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➖ Rôle supprimé !')
                .setDescription(`Un rôle a été supprimé !` +
                `\n📝 Nom : **${role.name}**` +
                `\n📅 Date de création : **${moment(role.createdAt).format('DD/MM/YYYY')}**` +
                `\n✅ Membres ayant le rôle : **${members.size}**`)
                .setTimestamp()
                .setColor(role.color)
                .setFooter({ text: `🌐 ID : ${role.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() });

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when a role is updated
        client.on('roleUpdate', async (oldRole, newRole) => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: oldRole.guild.id });
            
            // if the guild config doesn't exist, return
            if(!guildConfig) return;

            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the roleUpdate logs are not enabled, return
            if(!guildConfig.logs.components.roleUpdate.enabled) return;

            // get the channel logs
            var channelLogs = oldRole.guild.channels.cache.get(guildConfig.logs.components.roleUpdate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await oldRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === oldRole.id &&
                entry.targetType === 'Role' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // check if role name, color, permissions, position, hoist or mentionable has changed
            var nameChanged = oldRole.name != newRole.name;
            var colorChanged = oldRole.color != newRole.color;
            var permissionsChanged = oldRole.permissions != newRole.permissions;
            var positionChanged = oldRole.position != newRole.position;
            var hoistChanged = oldRole.hoist != newRole.hoist;
            var mentionableChanged = oldRole.mentionable != newRole.mentionable;

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('🔃 Rôle modifié !')
                .setDescription(`Un rôle a été modifié !` +
                `\n📝 Nom : **${oldRole.name}**` +
                `\n📅 Date de création : **${moment(oldRole.createdAt).format('DD/MM/YYYY')}**` +
                `\n✅ Membres ayant le rôle : **${oldRole.members.size}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${oldRole.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setColor(newRole.color);
            
            // if the role name has changed
            if(nameChanged) {
                embed.addFields({
                    name: '🔃 Nom changé',
                    value: `⏮️ Ancien nom : **${oldRole.name}**\n⏭ Nouveau nom : **${newRole.name}**`,
                    inline: true,
                });
            }

            // if the role color has changed
            if(colorChanged) {
                embed.addFields({
                    name: '🔃 Couleur changée',
                    value: `⏮️ Ancienne couleur : **${oldRole.color}**\n⏭ Nouvelle couleur : **${newRole.color}**`,
                    inline: true,
                });
            }

            // if the role position has changed
            if(positionChanged) {
                embed.addFields({
                    name: '🔃 Position changée',
                    value: `⏮️ Ancienne position : **${oldRole.position}**\n⏭ Nouvelle position : **${newRole.position}**`,
                    inline: true,
                });
            }

            // if the role hoist has changed
            if(hoistChanged) {
                embed.addFields({
                    name: '🔃 Affichage séparé changé',
                    value: `⏮️ Ancien affichage séparé : **${oldRole.hoist}**\n⏭ Nouvel affichage séparé : **${newRole.hoist}**`,
                    inline: true,
                });
            }

            // if the role mentionable has changed
            if(mentionableChanged) {
                embed.addFields({
                    name: '🔃 Mentionnable changé',
                    value: `⏮️ Ancienne mentionnable : **${oldRole.mentionable}**\n⏭ Nouvel mentionnable : **${newRole.mentionable}**`,
                    inline: true,
                });
            }

            // if the role permissions has changed
            if(permissionsChanged) {
                let PermissionsAdded = newRole.permissions.toArray().filter(permission => !oldRole.permissions.toArray().includes(permission));
                let PermissionsRemoved = oldRole.permissions.toArray().filter(permission => !newRole.permissions.toArray().includes(permission));
                if(PermissionsAdded.length > 0 || PermissionsRemoved.length > 0) {
                    embed.addFields({
                        name: 'Permissions changées',
                        value: `➕ Permissions ajoutées : **${PermissionsAdded.join(', ') || 'Aucune'}**\n➖ Permissions supprimées : **${PermissionsRemoved.join(', ') || 'Aucune'}**`,
                        inline: false,
                    });
                }
            }

            // if no changes has been detected, return
            if(!nameChanged && !colorChanged && !permissionsChanged && !positionChanged && !hoistChanged && !mentionableChanged) return;
            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when an invite is created
        client.on('inviteCreate', async invite => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: invite.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;
            
            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the inviteCreate logs are not enabled, return
            if(!guildConfig.logs.components.inviteCreate.enabled) return;

            // get the channel logs
            var channelLogs = invite.guild.channels.cache.get(guildConfig.logs.components.inviteCreate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get the invite's creator
            var creator = await client.users.fetch(invite.inviter.id);

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➕ Invitation créée !')
                .setDescription(`Une invitation a été créée !` +
                `\n👤 Créateur : **${creator.tag}** (${creator.id})` +
                `\n📝 Code : **${invite.code}**` +
                `\n🌐 URL : **${invite.url}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${invite.id}` })
                .setAuthor({ name: `${creator.tag} (${creator.id})`, iconURL: creator.displayAvatarURL() })
                .setColor("#338C33");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when an invite is deleted
        client.on('inviteDelete', async invite => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: invite.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;
            
            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the inviteDelete logs are not enabled, return
            if(!guildConfig.logs.components.inviteDelete.enabled) return;

            // get the channel logs
            var channelLogs = invite.guild.channels.cache.get(guildConfig.logs.components.inviteDelete.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get the invite's remover
            var creator = await client.users.fetch(invite.inviter.id);

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➖ Invitation supprimée !')
                .setDescription(`Une invitation a été supprimée !` +
                `\n👤 Créateur : **${creator.tag}** (${creator.id})` +
                `\n📝 Code : **${invite.code}**` +
                `\n🌐 URL : **${invite.url}**`)
                .setTimestamp()
                .setFooter({ text: `🌐 ID : ${invite.id}` })
                .setAuthor({ name: `${creator.tag} (${creator.id})`, iconURL: creator.displayAvatarURL() })
                .setColor("#F90004");

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when an emoji is created
        client.on('emojiCreate', async emoji => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: emoji.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;
            
            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the emojiCreate logs are not enabled, return
            if(!guildConfig.logs.components.emojiCreate.enabled) return;

            // get the channel logs
            var channelLogs = emoji.guild.channels.cache.get(guildConfig.logs.components.emojiCreate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get the emoji's creator
            var creator = await client.users.fetch(emoji.user.id);

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➕ Emoji créé !')
                .setDescription(`Un emoji a été créé !` +
                `\n📝 Nom : **${emoji.name}**` +
                `\n📅 Date de création : **${moment(emoji.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setColor("#338C33")
                .setFooter({ text: `🌐 ID : ${emoji.id}` })
                .setAuthor({ name: `${creator.tag} (${creator.id})`, iconURL: creator.displayAvatarURL() })
                .setImage(emoji.url);

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when an emoji is deleted
        client.on('emojiDelete', async emoji => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: emoji.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;
            
            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the emojiDelete logs are not enabled, return
            if(!guildConfig.logs.components.emojiDelete.enabled) return;

            // get the channel logs
            var channelLogs = emoji.guild.channels.cache.get(guildConfig.logs.components.emojiDelete.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // get audit logs
            let auditLogs = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === emoji.id &&
                entry.targetType === 'Emoji' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('➖ Emoji supprimé !')
                .setDescription(`Un emoji a été supprimé !` +
                `\n📝 Nom : **${emoji.name}**` +
                `\n📅 Date de création : **${moment(emoji.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setColor("#F90004")
                .setFooter({ text: `🌐 ID : ${emoji.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setImage(emoji.url);

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when an emoji is updated
        client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: oldEmoji.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;
            
            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;
            
            // if the emojiUpdate logs are not enabled, return
            if(!guildConfig.logs.components.emojiUpdate.enabled) return;

            // get the channel logs
            var channelLogs = oldEmoji.guild.channels.cache.get(guildConfig.logs.components.emojiUpdate.channel || guildConfig.logs.channel);
            // if the channel logs doesn't exist, return
            if(!channelLogs) return;

            // check if emoji name or image has changed
            var nameChanged = oldEmoji.name != newEmoji.name;
            var imageChanged = oldEmoji.url != newEmoji.url;

            // get audit logs
            let auditLogs = await oldEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate, limit: 1 });
            let auditLog = auditLogs.entries.filter(entry =>
                entry.targetId === oldEmoji.id &&
                entry.targetType === 'Emoji' &&
                entry.createdAt > Date.now() - 5000
            ).first();

            // create the embed
            var embed = new EmbedBuilder()
                .setTitle('🔃 Emoji modifié !')
                .setDescription(`Un emoji a été modifié !` +
                `\n📝 Nom : **${oldEmoji.name}**` +
                `\n📅 Date de création : **${moment(oldEmoji.createdAt).format('DD/MM/YYYY')}**`)
                .setTimestamp()
                .setColor("#FFD900")
                .setFooter({ text: `🌐 ID : ${oldEmoji.id}` })
                .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                .setImage(newEmoji.url);
            
            // if the emoji name has changed
            if(nameChanged) {
                embed.addFields({
                    name: '🔃 Nom changé',
                    value: `⏮️ Ancien nom : **${oldEmoji.name}**\n⏭ Nouveau nom : **${newEmoji.name}**`,
                    inline: true,
                });
            }

            // if the emoji image has changed
            if(imageChanged) {
                embed.addFields({
                    name: '🔃 Image changée',
                    value: `⏮️ Ancienne image : **${oldEmoji.url}**\n⏭ Nouvelle image : **${newEmoji.url}**`,
                    inline: true,
                });
            }

            // send the embed
            channelLogs.send({ embeds: [embed] });
        });

        // when member join a voice channel
        client.on('voiceStateUpdate', async (oldState, newState) => {
            // get the guild config
            var guildConfig = await client.serversdb.findOne({ id: oldState.guild.id });
            // if the guild config doesn't exist, return
            if(!guildConfig) return;
            
            // if the logs are not enabled, return
            if(!guildConfig.logs.enabled) return;

            // check if the member has joined a voice channel
            var joined = !oldState.channelId && newState.channelId;
            // check if the member has left a voice channel
            var left = oldState.channelId && !newState.channelId;
            // check if the member has changed his voice channel
            var changed = oldState.channelId && newState.channelId && oldState.channelId != newState.channelId;
            
            // if the member has joined a voice channel
            if(joined) {
                // if the memberJoinVoice logs are not enabled, return
                if(!guildConfig.logs.components.memberJoinVoice.enabled) return;

                // get the channel logs
                var channelLogs = oldState.guild.channels.cache.get(guildConfig.logs.components.memberJoinVoice.channel || guildConfig.logs.channel);
                // if the channel logs doesn't exist, return
                if(!channelLogs) return;

                // create the embed
                var embed = new EmbedBuilder()
                .setTitle('➕ Un membre a rejoint un salon vocal')
                .setTimestamp()
                .setColor("#338C33")
                .setDescription(`👤 Membre : **${oldState.member.user.tag}** (${oldState.member.id})` +
                `\n📝 Salon : **${newState.channel.name}** (${newState.channel.id})`)
                .setAuthor({ name: `${oldState.member.user.tag} (${oldState.member.id})`, iconURL: oldState.member.user.displayAvatarURL() })

                // send the embed
                channelLogs.send({ embeds: [embed] });
            }

            // if the member has left a voice channel
            else if(left) {
                // if the memberLeaveVoice logs are not enabled, return
                if(!guildConfig.logs.components.memberLeaveVoice.enabled) return;

                // get the channel logs
                var channelLogs = oldState.guild.channels.cache.get(guildConfig.logs.components.memberLeaveVoice.channel || guildConfig.logs.channel);
                // if the channel logs doesn't exist, return
                if(!channelLogs) return;

                // get audit logs
                let auditLogs = await oldState.guild.fetchAuditLogs({ type: AuditLogEvent.MemberDisconnect, limit: 1 });
                let auditLog = auditLogs.entries.filter(entry =>
                    entry.targetId === oldState.member.id &&
                    entry.targetType === 'User' &&
                    entry.createdAt > Date.now() - 5000
                ).first();

                // create the embed
                var embed = new EmbedBuilder()
                .setTitle('➖ Un membre a quitté un salon vocal')
                .setTimestamp()
                .setColor("#F90004")
                .setDescription(`👤 Membre : **${oldState.member.user.tag}** (${oldState.member.id})` +
                `\n📝 Salon : **${oldState.channel.name}** (${oldState.channel.id})`);
                if(auditLog) embed.setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                else embed.setAuthor({ name: `${oldState.member.user.tag} (${oldState.member.id})`, iconURL: oldState.member.user.displayAvatarURL() })

                // send the embed
                channelLogs.send({ embeds: [embed] });
            }

            // if the member has changed his voice channel
            else if(changed) {
                // if the memberChangeVoice logs are not enabled, return
                if(!guildConfig.logs.components.memberSwitchVoice.enabled) return;

                // get the channel logs
                var channelLogs = oldState.guild.channels.cache.get(guildConfig.logs.components.memberSwitchVoice.channel || guildConfig.logs.channel);
                // if the channel logs doesn't exist, return
                if(!channelLogs) return;

                // get audit logs
                let auditLogs = await oldState.guild.fetchAuditLogs({ type: AuditLogEvent.MemberMove, limit: 1 });
                let auditLog = auditLogs.entries.filter(entry =>
                    entry.targetId === oldState.member.id &&
                    entry.targetType === 'User' &&
                    entry.createdAt > Date.now() - 5000
                ).first();

                // create the embed
                var embed = new EmbedBuilder()
                .setTitle('🔃 Un membre a changé de salon vocal')
                .setTimestamp()
                .setColor("#FFD900")
                .setDescription(`👤 Membre : **${oldState.member.user.tag}** **${oldState.member.id}**` +
                `\n⏮ Ancien Salon : **${oldState.channel.name}**` +
                `\n⏭ Nouveau Salon : **${newState.channel.name}**`)
                .setFooter({ text: `🌐 ID Salon : ${oldState.channel.id}` });
                if(auditLog) embed.setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                else embed.setAuthor({ name: `${oldState.member.user.tag} (${oldState.member.id})`, iconURL: oldState.member.user.displayAvatarURL() })

                // send the embed
                channelLogs.send({ embeds: [embed] });
            }
        });

        // when an user update is detected
        client.on('userUpdate', async (oldUser, newUser) => {
            // get the guild config (check where the user is and get all the guilds)
            var guilds = client.guilds.cache.filter(guild => guild.members.cache.has(newUser.id));
            
            // for each guild
            guilds.forEach(async guild => {
                var guildConfig = await client.serversdb.findOne({ id: guild.id });
                // if the guild config doesn't exist, return
                if(!guildConfig) return;
                
                // if the logs are not enabled, return
                if(!guildConfig.logs.enabled) return;

                // if the userUpdate logs are not enabled, return
                if(!guildConfig.logs.components.userUpdate.enabled) return;

                // get the channel logs
                var channelLogs = guild.channels.cache.get(guildConfig.logs.components.userUpdate.channel || guildConfig.logs.channel);
                // if the channel logs doesn't exist, return
                if(!channelLogs) return;

                // check if user username, discriminator or avatar has changed
                var usernameChanged = oldUser.username != newUser.username;
                var discriminatorChanged = oldUser.discriminator != newUser.discriminator;
                var avatarChanged = oldUser.avatar != newUser.avatar;

                // create the embed
                var embed = new EmbedBuilder()
                    .setTitle('🔃 Mise a jour utilisateur')
                    .setDescription(`Le profil d'un utilisateur a été modifié !` +
                    `\n👤 Utilisateur : **${oldUser.tag}**` +
                    `\n📅 Date de création : **${moment(oldUser.createdAt).format('DD/MM/YYYY')}**`)
                    .setTimestamp()
                    .setColor("#FFD900")
                    .setAuthor({ name: `${oldUser.tag} (${oldUser.id})`, iconURL: oldUser.displayAvatarURL() })
                    .setThumbnail(newUser.displayAvatarURL());

                // if the user username has changed
                if(usernameChanged) {
                    embed.addFields({
                        name: '🔃 Pseudo changé',
                        value: `⏮️ Ancien pseudo : **${oldUser.username}**\n⏭ Nouveau pseudo : **${newUser.username}**`,
                        inline: true,
                    });
                }

                // if the user discriminator has changed
                if(discriminatorChanged) {
                    embed.addFields({
                        name: '🔃 Discriminateur changé',
                        value: `⏮️ Ancien discriminateur : **${oldUser.discriminator}**\n⏭ Nouveau discriminateur : **${newUser.discriminator}**`,
                        inline: true,
                    });
                }

                // if the user avatar has changed
                if(avatarChanged) {
                    embed.addFields({
                        name: '🔃 Avatar changé',
                        value: `⏮️ Ancien avatar : **${oldUser.displayAvatarURL()}**\n⏭ Nouvel avatar : **${newUser.displayAvatarURL()}**`,
                        inline: true,
                    });
                }

                // send the embed
                channelLogs.send({ embeds: [embed] });
            });
        });

        // when memberUpdate is detected
        client.on('guildMemberUpdate', async (oldMember, newMember) => {
            // if no roles has been added or removed
            if(oldMember.roles.cache.size == newMember.roles.cache.size) {
                // get the guild config
                var guildConfig = await client.serversdb.findOne({ id: oldMember.guild.id });
                // if the guild config doesn't exist, return
                if(!guildConfig) return;
                
                // if the logs are not enabled, return
                if(!guildConfig.logs.enabled) return;

                // if the memberUpdate logs are not enabled, return
                if(!guildConfig.logs.components.memberUpdate.enabled) return;

                // get the channel logs
                var channelLogs = oldMember.guild.channels.cache.get(guildConfig.logs.components.memberUpdate.channel || guildConfig.logs.channel);
                // if the channel logs doesn't exist, return
                if(!channelLogs) return;
                
                // get audit logs
                let auditLogs = await oldMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
                let auditLog = auditLogs.entries.filter(entry =>
                    entry.targetId === oldMember.id &&
                    entry.targetType === 'User' &&
                    entry.createdAt > Date.now() - 5000
                ).first();
                
                // check if member nickname has changed
                var nicknameChanged = oldMember.nickname != newMember.nickname;

                // create the embed
                var embed = new EmbedBuilder()
                    .setTitle('🔃 Mise  a jour membre')
                    .setDescription(`Le profil de membre d'un utilisateur a été modifié !` +
                    `\n👤 Utilisateur : **${oldMember.user.tag}**` +
                    `\n📅 Date de création : **${moment(oldMember.user.createdAt).format('DD/MM/YYYY')}**` +
                    `\n📅 Date d'arrivée : **${moment(oldMember.joinedAt).format('DD/MM/YYYY')}**`)
                    .setTimestamp()
                    .setColor("#FFD900")
                    .setFooter({ text: `🌐 ID : ${oldMember.id}` })
                    .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                    .setThumbnail(newMember.user.displayAvatarURL());

                // if the member nickname has changed
                if(nicknameChanged) {
                    embed.addFields({
                        name: '🔃 Surnom changé',
                        value: `⏮️ Ancien surnom : **${oldMember.nickname}**\n⏭ Nouveau surnom : **${newMember.nickname}**`,
                        inline: true,
                    });
                }

                // send the embed
                channelLogs.send({ embeds: [embed] });
            } else {
                // check if roles has been added
                var rolesAdded = oldMember.roles.cache.size < newMember.roles.cache.size;
                var rolesRemoved = oldMember.roles.cache.size > newMember.roles.cache.size;
                
                if(rolesAdded) {
                    // get the guild config
                    var guildConfig = await client.serversdb.findOne({ id: oldMember.guild.id });
                    // if the guild config doesn't exist, return
                    if(!guildConfig) return;
                    
                    // if the logs are not enabled, return
                    if(!guildConfig.logs.enabled) return;
                    
                    // if the roleMemberAdd logs are not enabled, return
                    if(!guildConfig.logs.components.roleMemberAdd.enabled) return;

                    // get the channel logs
                    var channelLogs = newMember.guild.channels.cache.get(guildConfig.logs.components.roleMemberAdd.channel || guildConfig.logs.channel);
                    // if the channel logs doesn't exist, return
                    if(!channelLogs) return;

                    // get audit logs
                    let auditLogs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
                    let auditLog = auditLogs.entries.filter(entry =>
                        entry.targetId === newMember.id &&
                        entry.targetType === 'User' &&
                        entry.createdAt > Date.now() - 5000
                    ).first();

                    // create the embed
                    var embed = new EmbedBuilder()
                        .setTitle('➕ Rôle ajouté !')
                        .setDescription(`Un ou plusieurs rôles ont été ajoutés à un membre !`)
                        .setTimestamp()
                        .setColor("#338C33")
                        .setThumbnail(newMember.user.displayAvatarURL())
                        .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                        .addFields({
                            name: '👤 Membre',
                            value: `👤 Pseudo : **${newMember.user.tag}**\n🌐 ID : **${newMember.user.id}**`,
                            inline: false,
                        })
                        .addFields({
                            name: '➕ Rôles ajoutés',
                            value: newMember?.roles?.cache
                                ?.filter(role => !oldMember?.roles?.cache?.has(role?.id))
                                ?.map(role => `${role?.name} (${role?.id})`)
                                ?.join(', '),
                            inline: false,
                        });
                        
                    // send the embed
                    channelLogs.send({ embeds: [embed] });
                } else if(rolesRemoved) {
                    // get the guild config
                    var guildConfig = await client.serversdb.findOne({ id: oldMember.guild.id });
                    // if the guild config doesn't exist, return
                    if(!guildConfig) return;
                    
                    // if the logs are not enabled, return
                    if(!guildConfig.logs.enabled) return;
                    
                    // if the roleMemberRemove logs are not enabled, return
                    if(!guildConfig.logs.components.roleMemberRemove.enabled) return;

                    // get the channel logs
                    var channelLogs = newMember.guild.channels.cache.get(guildConfig.logs.components.roleMemberRemove.channel || guildConfig.logs.channel);
                    // if the channel logs doesn't exist, return
                    if(!channelLogs) return;

                    // get audit logs
                    let auditLogs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
                    let auditLog = auditLogs.entries.filter(entry =>
                        entry.targetId === newMember.id &&
                        entry.targetType === 'User' &&
                        entry.createdAt > Date.now() - 5000
                    ).first();

                    // create the embed
                    var embed = new EmbedBuilder()
                        .setTitle('➖ Rôle retiré !')
                        .setDescription(`Un ou plusieurs rôles ont été retirés à un membre !`)
                        .setTimestamp()
                        .setColor("#F90004")
                        .setThumbnail(newMember.user.displayAvatarURL())
                        .setAuthor({ name: `${auditLog?.executor?.tag} (${auditLog?.executor?.id})`, iconURL: auditLog?.executor?.displayAvatarURL() })
                        .addFields({
                            name: '👤 Membre',
                            value: `👤 Pseudo : **${newMember.user.tag}**\n🌐 ID : **${newMember.user.id}**`,
                            inline: false,
                        })
                        .addFields({
                            name: '➖ Rôles retirés',
                            value: oldMember?.roles?.cache
                                ?.filter(role => !newMember?.roles?.cache
                                ?.has(role?.id))
                                ?.map(role => `${role?.name} (${role?.id})`)
                                ?.join(', '),
                            inline: false,
                        });
                        
                    // send the embed
                    channelLogs.send({ embeds: [embed] });
                }
            }
        });
    }
}