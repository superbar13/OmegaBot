// interserver command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interserver')
        .setDescription('Modifiez les paramètres de l\'interserveur')
        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Créez un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Le channel de l\'interserveur')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('description')
                .setDescription('La description de l\'interserveur')
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName('private')
                .setDescription('Si l\'interserveur est privé ou non')
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName('invites')
                .setDescription('Si les invitations sont autorisées ou non')
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName('antispam')
                .setDescription('Si l\'antispam est activé ou non')
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName('antilinks')
                .setDescription('Si l\'antilinks est activé ou non')
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName('antiswear')
                .setDescription('Si l\'antiswear est activé ou non')
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName('pictures')
                .setDescription('Si les images sont autorisées ou non')
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName('gifs')
                .setDescription('Si les gifs sont autorisés (donc affichés) ou non')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('keycode')
                .setDescription('Le keycode de l\'interserveur')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('logo')
                .setDescription('Le logo de l\'interserveur')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('banner')
                .setDescription('La bannière de l\'interserveur')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('bannedlinks')
                .setDescription('Les liens bannis')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('bannedwords')
                .setDescription('Les mots bannis')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('maxspamcount')
                .setDescription('Le nombre maximum de messages autorisés en un certain temps')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('maxspamtime')
                .setDescription('Le temps en secondes')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Supprimez un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('modify')
            .setDescription('Modifiez un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('description')
                .setDescription('La description de l\'interserveur')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('private')
                .setDescription('Si l\'interserveur est privé ou non')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('keycode')
                .setDescription('Le keycode de l\'interserveur')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('invites')
                .setDescription('Si les invitations sont autorisées ou non')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('antispam')
                .setDescription('Si l\'antispam est activé ou non')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('antilinks')
                .setDescription('Si l\'antilinks est activé ou non')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('antiswear')
                .setDescription('Si l\'antiswear est activé ou non')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('pictures')
                .setDescription('Si les images sont autorisées ou non')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('gifs')
                .setDescription('Si les gifs sont autorisés (donc affichés) ou non')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('logo')
                .setDescription('Le logo de l\'interserveur')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('banner')
                .setDescription('La bannière de l\'interserveur')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('bannedlinks')
                .setDescription('Les liens bannis')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('bannedwords')
                .setDescription('Les mots bannis')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('maxspamcount')
                .setDescription('Le nombre maximum de messages autorisés en un certain temps')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('maxspamtime')
                .setDescription('Le temps en secondes')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('Listez les interserveurs')
        )
        .addSubcommand(subcommand => subcommand
            .setName('info')
            .setDescription('Obtenez des informations sur un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('join')
            .setDescription('Rejoignez un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Le channel de l\'interserveur')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('keycode')
                .setDescription('Le keycode de l\'interserveur')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('leave')
            .setDescription('Quittez un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('ban')
            .setDescription('Bannissez un utilisateur d\'un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
            .addUserOption(option => option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('unban')
            .setDescription('Débannissez un utilisateur d\'un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
            .addUserOption(option => option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à débannir')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove-message')
            .setDescription('Supprimez un message d\'un interserveur')
            .addStringOption(option => option
                .setName('nom')
                .setDescription('Le nom de l\'interserveur')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('message')
                .setDescription('Le message à supprimer')
                .setRequired(true)
            )
        )
        .setDMPermission(false),
    category: 'interserver',
    async execute(interaction){
        await interaction.deferReply();
        if(!interaction.client.config.modules['interserver']?.enabled) return interaction.editReply({ content: 'Le module interserver est désactivé !', ephemeral: true });
        // retrouve la sous-commande
        var type = interaction.options.getSubcommand();
        if(type == 'create'){
            // check si l'user est admin ou pas
            if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.editReply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });

            // retrouve les options
            var nom = interaction.options.getString('nom');
            if(nom.length > 20 || nom.length < 3) return interaction.editReply({ content: 'Le nom de l\'interserveur doit être compris entre 3 et 20 caractères !', ephemeral: true });
            var channel = interaction.options.getChannel('channel');
            var description = interaction.options.getString('description');
            if(description.length > 200) return interaction.editReply({ content: 'La description de l\'interserveur doit être inférieure à 200 caractères !', ephemeral: true });
            var private = interaction.options.getBoolean('private');
            var keycode = interaction.options.getString('keycode');
            if(keycode.length > 10 || keycode.length < 5) return interaction.editReply({ content: 'Le keycode de l\'interserveur doit être compris entre 5 et 10 caractères !', ephemeral: true });
            var invites = interaction.options.getBoolean('invites');
            var antispam = interaction.options.getBoolean('antispam');
            var antilinks = interaction.options.getBoolean('antilinks');
            var antiswear = interaction.options.getBoolean('antiswear');
            var pictures = interaction.options.getBoolean('pictures');
            var gifs = interaction.options.getBoolean('gifs');
            var logo = interaction.options.getString('logo');
            if(!logo.startsWith('http') || (!logo.endsWith('.png') && !logo.endsWith('.jpg') && !logo.endsWith('.jpeg'))) return interaction.editReply({ content: 'Le logo de l\'interserveur doit être une image !', ephemeral: true });
            var banner = interaction.options.getString('banner');
            if(!banner.startsWith('http') || (!banner.endsWith('.png') && !banner.endsWith('.jpg') && !banner.endsWith('.jpeg'))) return interaction.editReply({ content: 'La bannière de l\'interserveur doit être une image !', ephemeral: true });
            var bannedlinks = interaction.options.getString('bannedlinks');
            if(bannedlinks.length > 200) return interaction.editReply({ content: 'Les liens bannis de l\'interserveur doivent être inférieurs à 200 caractères !', ephemeral: true });
            bannedlinks = bannedlinks.split(',').map(link => link.trim());
            for(var i = 0; i < bannedlinks.length; i++){
                if(bannedlinks[i].length > 20) return interaction.editReply({ content: 'Les liens bannis de l\'interserveur doivent être inférieurs à 20 caractères !', ephemeral: true });
                if(!bannedlinks[i].startsWith('http')) return interaction.editReply({ content: 'Les liens bannis de l\'interserveur doivent être des liens !', ephemeral: true });
            }
            var bannedwords = interaction.options.getString('bannedwords');
            if(bannedwords.length > 200) return interaction.editReply({ content: 'Les mots bannis de l\'interserveur doivent être inférieurs à 200 caractères !', ephemeral: true });
            bannedwords = bannedwords.split(',').map(link => link.trim());
            for(var i = 0; i < bannedwords.length; i++){
                if(bannedwords[i].length > 20) return interaction.editReply({ content: 'Les mots bannis de l\'interserveur doivent être inférieurs à 20 caractères !', ephemeral: true });
                if(bannedwords[i].startsWith('http')) return interaction.editReply({ content: 'Les mots bannis de l\'interserveur doivent être des mots !', ephemeral: true });
            }
            var maxspamcount = interaction.options.getString('maxspamcount');
            if(maxspamcount > 15 && antispam) return interaction.editReply({ content: 'Le nombre maximum de messages autorisés en un certain temps de l\'interserveur doit être inférieur à 15 messages !', ephemeral: true });
            var maxspamtime = interaction.options.getString('maxspamtime');
            if(maxspamtime > 15 && antispam) return interaction.editReply({ content: 'Le temps maximum de l\'interserveur doit être inférieur à 15 secondes !', ephemeral: true });

            // verifie si il n'y a pas deja un interserveur avec ce nom ou ce server et salon
            let interserver = await interaction.client.interserversdb.findOne(
                {
                    $or: [
                        { name: nom },
                        { servers: { $elemMatch: { id: interaction.guild.id, channel: channel.id } } }
                    ]
                }
            );
            if(interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il y a déjà un interserveur avec ce nom ou ce serveur et salon !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            let webhook;
            try{
                // if not, create it
                webhook = await channel.createWebhook({
                    name: 'Interserver',
                    avatar: interaction.client.user.avatarURL()
                });
            }catch(err){
                console.log(`[WEBHOOK] There was an error creating the webhook: ${err}`.red);
                webhook = {
                    id: null,
                    token: null
                }
            }

            // crée l'interserveur dans la base de données
            interserver = await interaction.client.interserversdb.createModel({
                name: nom,
                servers: [{
                    id: interaction.guild.id,
                    channel: channel.id,
                    webhook: {
                        id: webhook.id,
                        token: webhook.token
                    }
                }],
                owner: interaction.user.id,
                description: description,
                private: private,
                keycode: keycode,
                invites: invites,
                antispam: antispam,
                antilinks: antilinks,
                antiswear: antiswear,
                pictures: pictures,
                gifs: gifs,
                logo: logo,
                banner: banner,
                bannedlinks: bannedlinks,
                bannedwords: bannedwords,
                maxspamcount: maxspamcount,
                maxspamtime: maxspamtime
            });
            
            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Interserveur créé')
                .setDescription(`L'interserveur ${nom} a été créé avec succès !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Interserveur créé par ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
            await interaction.editReply({ embeds: [embed] });

            // envois un message systeme
            await interaction.client.modules.interserver.SendSystemMessage(
                interserver, // interserver
                `L'interserveur a été créé dans ce salon !`, // nom du serveur
                interaction.guild.iconURL() // icone du serveur
            );
        }else if(type == 'delete'){
            // check si l'user est admin ou pas
            if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.editReply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });

            // retrouve les options
            var nom = interaction.options.getString('nom');

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // verifie si l'utilisateur est le propriétaire de l'interserveur
            if(interserver.owner != interaction.user.id){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Vous n'êtes pas le propriétaire de cet interserveur !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // envois un message systeme pour avertir les autres serveurs
            await interaction.client.modules.interserver.SendSystemMessage(
                interserver, // interserver
                `L'interserveur auquel été connecté ce serveur a été supprimé ! Pensez a supprimer le webhook !`,
                interaction.client.user.avatarURL()
            );

            // supprime l'interserveur
            await interaction.client.interserversdb.deleteOne({ name: nom });

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Interserveur supprimé')
                .setDescription(`L'interserveur ${nom} a été supprimé avec succès !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Interserveur créé par ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
            await interaction.editReply({ embeds: [embed] });
        }else if(type == 'modify'){
            // check si l'user est admin ou pas
            if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.editReply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });

            // retrouve les options
            var nom = interaction.options.getString('nom');
            if(nom.length > 20 || nom.length < 3) return interaction.editReply({ content: 'Le nom de l\'interserveur doit être compris entre 3 et 20 caractères !', ephemeral: true });
            var channel = interaction.options.getChannel('channel');
            var description = interaction.options.getString('description');
            if(description.length > 200) return interaction.editReply({ content: 'La description de l\'interserveur doit être inférieure à 200 caractères !', ephemeral: true });
            var private = interaction.options.getBoolean('private');
            var keycode = interaction.options.getString('keycode');
            if(keycode.length > 10 || keycode.length < 5) return interaction.editReply({ content: 'Le keycode de l\'interserveur doit être compris entre 5 et 10 caractères !', ephemeral: true });
            var invites = interaction.options.getBoolean('invites');
            var antispam = interaction.options.getBoolean('antispam');
            var antilinks = interaction.options.getBoolean('antilinks');
            var antiswear = interaction.options.getBoolean('antiswear');
            var pictures = interaction.options.getBoolean('pictures');
            var gifs = interaction.options.getBoolean('gifs');
            var logo = interaction.options.getString('logo');
            if(!logo.startsWith('http') || (!logo.endsWith('.png') && !logo.endsWith('.jpg') && !logo.endsWith('.jpeg'))) return interaction.editReply({ content: 'Le logo de l\'interserveur doit être une image !', ephemeral: true });
            var banner = interaction.options.getString('banner');
            if(!banner.startsWith('http') || (!banner.endsWith('.png') && !banner.endsWith('.jpg') && !banner.endsWith('.jpeg'))) return interaction.editReply({ content: 'La bannière de l\'interserveur doit être une image !', ephemeral: true });
            var bannedlinks = interaction.options.getString('bannedlinks');
            if(bannedlinks.length > 200) return interaction.editReply({ content: 'Les liens bannis de l\'interserveur doivent être inférieurs à 200 caractères !', ephemeral: true });
            bannedlinks = bannedlinks.split(',').map(link => link.trim());
            for(var i = 0; i < bannedlinks.length; i++){
                if(bannedlinks[i].length > 20) return interaction.editReply({ content: 'Les liens bannis de l\'interserveur doivent être inférieurs à 20 caractères !', ephemeral: true });
                if(!bannedlinks[i].startsWith('http')) return interaction.editReply({ content: 'Les liens bannis de l\'interserveur doivent être des liens !', ephemeral: true });
            }
            var bannedwords = interaction.options.getString('bannedwords');
            if(bannedwords.length > 200) return interaction.editReply({ content: 'Les mots bannis de l\'interserveur doivent être inférieurs à 200 caractères !', ephemeral: true });
            bannedwords = bannedwords.split(',').map(link => link.trim());
            for(var i = 0; i < bannedwords.length; i++){
                if(bannedwords[i].length > 20) return interaction.editReply({ content: 'Les mots bannis de l\'interserveur doivent être inférieurs à 20 caractères !', ephemeral: true });
                if(bannedwords[i].startsWith('http')) return interaction.editReply({ content: 'Les mots bannis de l\'interserveur doivent être des mots !', ephemeral: true });
            }
            var maxspamcount = interaction.options.getString('maxspamcount');
            if(maxspamcount > 15 && antispam) return interaction.editReply({ content: 'Le nombre maximum de messages autorisés en un certain temps de l\'interserveur doit être inférieur à 15 messages !', ephemeral: true });
            var maxspamtime = interaction.options.getString('maxspamtime');
            if(maxspamtime > 15 && antispam) return interaction.editReply({ content: 'Le temps maximum de l\'interserveur doit être inférieur à 15 secondes !', ephemeral: true });

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // verifie si l'utilisateur est le propriétaire de l'interserveur
            if(interserver.owner != interaction.user.id){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Vous n'êtes pas le propriétaire de cet interserveur !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // modifie l'interserveur
            await interaction.client.interserversdb.updateOne({ name: nom }, {
                description: description || interserver.description,
                private: private || interserver.private,
                keycode: keycode || interserver.keycode,
                invites: invites || interserver.invites,
                antispam: antispam || interserver.antispam,
                antilinks: antilinks || interserver.antilinks,
                antiswear: antiswear || interserver.antiswear,
                pictures: pictures || interserver.pictures,
                gifs: gifs || interserver.gifs,
                logo: logo || interserver.logo,
                banner: banner || interserver.banner,
                bannedlinks: bannedlinks || interserver.bannedlinks,
                bannedwords: bannedwords || interserver.bannedwords,
                maxspamcount: maxspamcount || interserver.maxspamcount,
                maxspamtime: maxspamtime || interserver.maxspamtime
            });

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Interserveur modifié')
                .setDescription(`L'interserveur ${nom} a été modifié avec succès !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Interserveur créé par ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
            await interaction.editReply({ embeds: [embed] });
        }else if(type == 'list'){
            // retrouve les interserveurs
            let interservers = await interaction.client.interserversdb.find({});

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Liste des interserveurs')
                .setDescription(`Voici la liste des interserveurs :`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
            for(let interserver of interservers){
                if(interserver.private && interserver.owner != interaction.user.id) continue;
                // check if the user is in this server
                let user;
                if(interaction.guild.members.cache.has(interserver.owner)) user = `<@${interserver.owner}> (${interaction.guild.members.cache.get(interserver.owner).user.tag})`;
                else user = await interaction.client.users.cache.get(interserver.owner).tag;
                embed.addFields(
                    {
                        name: interserver.name + (interserver.private ? ' 🔒' : ''),
                        value: `> Description : ${interserver.description}\n> Serveurs : ${interserver.servers.length} | Propriétaire : ${user}`
                    }
                );
            }
            await interaction.editReply({ embeds: [embed] });
        }else if(type == 'info'){
            // retrouve les options
            var nom = interaction.options.getString('nom');

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle(`Informations sur l'interserveur ${nom}`)
                .setDescription(`Voici les informations sur l'interserveur ${nom} :`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() })
                .addFields(
                    { name: 'Description', value: interserver.description.length > 0 ? interserver.description : 'Aucune description'},
                    { name: 'Serveurs', value: interserver.servers.length.toString(), inline: true },
                    { name: 'Propriétaire', value: `${interaction.guild.members.cache.has(interserver.owner) ? '<@' + interserver.owner + '> (' + interaction.client.users.cache.get(interserver.owner).tag +')' : interaction.client.users.cache.get(interserver.owner).tag}`, inline: true },
                    { name: 'Privé', value: interserver.private ? '<:check:848664730838499409> Oui' : '<:erreur:848664731098153030> Non', inline: true },
                    { name: 'Invitations', value: interserver.invites ? '<:check:848664730838499409> Oui' : '<:erreur:848664731098153030> Non', inline: true },
                    { name: 'Antispam', value: interserver.antispam ? '<:check:848664730838499409> Oui' : '<:erreur:848664731098153030> Non', inline: true },
                    { name: 'Antilinks', value: interserver.antilinks ? '<:check:848664730838499409> Oui' : '<:erreur:848664731098153030> Non', inline: true },
                    { name: 'Antiswear', value: interserver.antiswear ? '<:check:848664730838499409> Oui' : '<:erreur:848664731098153030> Non', inline: true },
                    { name: 'Images', value: interserver.pictures ? '<:check:848664730838499409> Oui' : '<:erreur:848664731098153030> Non', inline: true },
                    { name: 'Gifs', value: interserver.gifs ? '<:check:848664730838499409> Oui' : '<:erreur:848664731098153030> Non', inline: true },
                    { name: 'Liens bannis', value: interserver.bannedlinks.length > 0 ? interserver.bannedlinks.join(', ') : 'Aucun' },
                    { name: 'Mots bannis', value: interserver.bannedwords.length > 0 ? interserver.bannedwords.join(', ') : 'Aucun' }
                )
                // logo et bannière
                .setImage(interserver.banner)
                .setThumbnail(interserver.logo);
            if(interserver.private && interserver.owner == interaction.user.id) embed.addFields(
                { name: 'Keycode', value: interserver.keycode, inline: true }
            );
            if(interserver.antispam){
                embed.addFields(
                    { name: 'Nombre maximum de messages autorisés en un certain temps', value: interserver.maxspamcount.toString(), inline: true },
                    { name: 'Temps en secondes', value: interserver.maxspamtime.toString(), inline: true }
                );
            }

            await interaction.editReply({ embeds: [embed] });
        }else if(type == 'join'){
            // check si l'user est admin ou pas
            if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.editReply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });

            // retrouve les options
            var nom = interaction.options.getString('nom');
            var channel = interaction.options.getChannel('channel');
            var keycode = interaction.options.getString('keycode');

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // verifie si l'interserveur est privé
            if(interserver.private){
                // verifie si l'utilisateur a donné le keycode
                if(!keycode){
                    // envois un gentil petit message en embed a l'utilisateur
                    const embed = new EmbedBuilder()
                        .setTitle('Erreur')
                        .setDescription(`L'interserveur ${nom} est privé ! Vous devez donner le keycode pour le rejoindre !`)
                        .setColor('#FF0000')
                        .setTimestamp()
                        .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }else{
                    // verifie si le keycode est le bon
                    if(interserver.keycode != keycode){
                        // envois un gentil petit message en embed a l'utilisateur
                        const embed = new EmbedBuilder()
                            .setTitle('Erreur')
                            .setDescription(`Le keycode de l'interserveur ${nom} est incorrect !`)
                            .setColor('#FF0000')
                            .setTimestamp()
                            .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                        await interaction.editReply({ embeds: [embed] });
                        return;
                    }
                }
            }

            // verifie si l'utilisateur est deja dans l'interserveur
            if(interserver.servers.find(server => server.id == interaction.guild.id)){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Vous êtes déjà dans l'interserveur ${nom} !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            let webhook;
            try{
                // if not, create it
                webhook = await channel.createWebhook({
                    name: 'Interserver',
                    avatar: interaction.client.user.avatarURL()
                });
            }catch(err){
                console.log(`[WEBHOOK] There was an error creating the webhook: ${err}`.red);
                webhook = {
                    id: null,
                    token: null
                }
            }

            // ajoute le serveur a l'interserveur
            try{
                await interaction.client.interserversdb.bulkWrite([
                    interaction.client.bulkutility.pushInArray({
                        'name': nom
                    }, {
                        'servers': {
                            id: interaction.guild.id,
                            channel: channel.id,
                            webhook: {
                                id: webhook.id,
                                token: webhook.token
                            }
                        }
                    })
                ]);
            }catch(error){console.log(error)}

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Interserveur rejoint')
                .setDescription(`Vous avez rejoint l'interserveur ${nom} avec succès !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
            await interaction.editReply({ embeds: [embed] });

            // refresh l'interserveur
            interserver = await interaction.client.interserversdb.findOne({ name: nom });

            await interaction.client.modules.interserver.SendSystemMessage(
                interserver, // interserver
                `Le serveur ${interaction.guild.name} a rejoint l'interserveur !`, // nom du serveur
                interaction.guild.iconURL() // icone du serveur
            );
        }else if(type == 'leave'){
            // check si l'user est admin ou pas
            if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.editReply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });

            // retrouve les options
            var nom = interaction.options.getString('nom');

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // verifie si l'utilisateur est deja dans l'interserveur
            if(!interserver.servers.find(server => server.id == interaction.guild.id)){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Vous n'êtes pas dans l'interserveur ${nom} !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // supprime le serveur de l'interserveur
            try{
                await interaction.client.interserversdb.bulkWrite([
                    interaction.client.bulkutility.pullInArray({
                        'name': nom
                    }, {
                        'servers': {
                            id: interaction.guild.id
                        }
                    })
                ]);
            }catch(error){console.log(error)}

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Interserveur quitté')
                .setDescription(`Vous avez quitté l'interserveur ${nom} avec succès ! Pensez a supprimer le webhook !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
            await interaction.editReply({ embeds: [embed] });

            // refresh l'interserveur
            interserver = await interaction.client.interserversdb.findOne({ name: nom });
            
            await interaction.client.modules.interserver.SendSystemMessage(
                interserver, // interserver
                `Le serveur ${interaction.guild.name} a quitté l'interserveur !`, // nom du serveur
                interaction.guild.iconURL() // icone du serveur
            );
        } else if(type == 'ban') {
            // check si l'user est admin ou pas
            if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.editReply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });

            // retrouve les options
            var nom = interaction.options.getString('nom');
            var user = interaction.options.getUser('user');

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                    await interaction.editReply({ embeds: [embed] });
                    return;
            }

            // verifie si l'utilisateur est le propriétaire de l'interserveur
            if(interserver.owner != interaction.user.id){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Vous n'êtes pas le propriétaire de cet interserveur !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                    await interaction.editReply({ embeds: [embed] });
                    return;
            }

            // ban l'utilisateur
            try{
                await interaction.client.interserversdb.bulkWrite([
                    interaction.client.bulkutility.pushInArray({
                        'name': nom
                    }, {
                        'bannedusers': user.id
                    })
                ]);
            }catch(error){console.log(error)}

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Utilisateur banni')
                .setDescription(`L'utilisateur ${user.tag} a été banni de l'interserveur ${nom} avec succès !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Interserveur créé par ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
            
            await interaction.editReply({ embeds: [embed] });

            // refresh l'interserveur
            interserver = await interaction.client.interserversdb.findOne({ name: nom });

            await interaction.client.modules.interserver.SendSystemMessage(
                interserver, // interserver
                `L'utilisateur ${user.tag} a été banni de l'interserveur !`, // nom du serveur
                user.avatarURL() // icone du serveur
            );
        } else if(type == 'unban') {
            // check si l'user est admin ou pas
            if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.editReply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande !', ephemeral: true });

            // retrouve les options
            var nom = interaction.options.getString('nom');
            var user = interaction.options.getUser('user');

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                    await interaction.editReply({ embeds: [embed] });
                    return;
            }

            // verifie si l'utilisateur est le propriétaire de l'interserveur
            if(interserver.owner != interaction.user.id){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Vous n'êtes pas le propriétaire de cet interserveur !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                    await interaction.editReply({ embeds: [embed] });
                    return;
            }

            // unban l'utilisateur
            try{
                await interaction.client.interserversdb.bulkWrite([
                    interaction.client.bulkutility.pullInArray({
                        'name': nom
                    }, {
                        'bannedusers': user.id
                    })
                ]);
            }catch(error){console.log(error)}

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Utilisateur débanni')
                .setDescription(`L'utilisateur ${user.tag} a été débanni de l'interserveur ${nom} avec succès !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Interserveur créé par ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

            await interaction.editReply({ embeds: [embed] });
        } else if(type == 'remove-message') {
            // retrouve les options
            var nom = interaction.options.getString('nom');
            var message1 = interaction.options.getString('message');

            // verifie si il y a un interserveur avec ce nom
            let interserver = await interaction.client.interserversdb.findOne({ name: nom });
            if(!interserver){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Il n'y a pas d'interserveur avec ce nom !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                    await interaction.editReply({ embeds: [embed] });
                    return;
            }

            // cherchons le message parmis les serveurs channels de l'interserveur
            let message;
            for(let serveur of interserver.servers){
                let guild = interaction.client.guilds.cache.get(serveur.id);
                if(!guild) return;
                let channel = guild.channels.cache.get(serveur.channel);
                if(!channel) return;
                let msg;
                try{
                    msg = await channel.messages.fetch(message1);
                }catch(err){}
                if(msg) {
                    message = {
                        id: msg,
                        guild: guild,
                        channel: channel,
                        user: msg.author.id
                    };
                    break;
                }
            }
            if(!message) return interaction.editReply({ content: 'Le message n\'a pas été trouvé !', ephemeral: true });

            // verifie si l'utilisateur est le propriétaire de l'interserveur ou, celui qui a envoyé le message
            if(interserver.owner != interaction.user.id && message.user != interaction.user.id){
                // envois un gentil petit message en embed a l'utilisateur
                const embed = new EmbedBuilder()
                    .setTitle('Erreur')
                    .setDescription(`Vous n'êtes pas le propriétaire de cet interserveur, ni celui qui a envoyé le message !`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });
                    await interaction.editReply({ embeds: [embed] });
                    return;
            }

            // on va supprimer le message original
            message.id.delete();

            // puis on va parcourir les autres serveurs a la recherche d'un embed author name avec [id-du-message]
            for(let serveur of interserver.servers){
                let guild = interaction.client.guilds.cache.get(serveur.id);
                if(!guild) return;
                let channel = guild.channels.cache.get(serveur.channel);
                if(!channel) return;
                let messages = await channel.messages.fetch({ limit: 100 });
                for(let msg of messages){
                    msg = msg[1];
                    if(msg?.embeds[0]?.author?.name?.endsWith(`[${message.id.id}]`)) {
                        msg.delete();
                        break;
                    }
                }
            }

            // envois un gentil petit message en embed a l'utilisateur
            const embed = new EmbedBuilder()
                .setTitle('Message supprimé')
                .setDescription(`Le message ${message.id.id} a été supprimé de l'interserveur ${nom} avec succès !`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `OmegaBot is the best`, iconURL: interaction.user.avatarURL() });

            await interaction.editReply({ embeds: [embed] });
        }
    }
};