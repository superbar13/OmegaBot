// ping command module to be used in index.js

const { StringSelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VoiceConnectionStatus, getVoiceConnection, demuxProbe, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fetch = require('node-fetch');
var internetradio = require('node-internet-radio');
const { countryCodeEmoji, emojiCountryCode } = require('country-code-emoji');
const {PermissionsBitField} = require('discord.js');
var Deezer = require("deezer-web-api");
var DeezerClient = new Deezer();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Joue la radio de votre choix')
        // add options radio required for the command
        .addSubcommand(subcommand => 
            subcommand.setName('radio')
            .setDescription('Joue la radio de votre choix')
            .addStringOption(option => option.setName('radio').setDescription('Nom de la radio').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('music')
            .setDescription('Joue la musique de votre choix')
            .addStringOption(option => option.setName('music').setDescription('Nom de la musique').setRequired(true))
        )
        .setDMPermission(false),
    category: 'music',
    async execute(interaction){
        const { ImageUrl, SongAsset, SongLegacyFormat  } = interaction.client.diezel.content;

        // check if subcommand is radio
        if(interaction.options.getSubcommand() == 'radio'){
            if(!interaction.client.config.modules['radio'].enabled) return interaction.reply({ content: '> ❌ Le module radio est désactivé.'});
            await interaction.deferReply();
            // check in the db if only admin can use the command
            var voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig'); // get the voiceconfig from the database
            voiceconfig = voiceconfig?.voiceconfig;
            if ((voiceconfig?.adminonly || false) == true && !interaction?.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
                interaction.editReply({ content: '> ❌ Seul un administrateur peut utiliser cette commande.', ephemeral: true });
                return;
            }
            if(!interaction?.member?.voice?.channel?.id){
                await interaction.editReply('> ❌ Vous devez être dans un salon vocal');
                return;
            }
            const connection = getVoiceConnection(interaction.guild.id);
            if(connection) {
                // verifie que le bot est dans le meme salon vocal que l'utilisateur
                if(connection.joinConfig.channelId != interaction.member.voice.channel.id){
                    try{
                        const connection = getVoiceConnection(interaction.guild.id);
                        if(!connection){
                            await interaction.editReply('> ❌ Je ne suis pas dans un salon vocal');
                            // get the player from the players map
                            const player = interaction.client.players.get(interaction.guild.id);
                            const response = interaction.client.responses.get(interaction.guild.id);
                            // stop the player
                            if(player){
                                player.removeAllListeners();
                                player.stop();
                                client.players.delete(interaction.guild.id);
                            }
                            if(response){
                                response.abort();
                                interaction.client.responses.delete(interaction.guild.id);
                            }
                        } else {
                            connection.destroy();
                            // stop discord player and delete the queue
                            await interaction.editReply('> ✅ La radio a été arrêtée');
                            // get the player from the players map
                            const player = interaction.client.players.get(interaction.guild.id);
                            const response = interaction.client.responses.get(interaction.guild.id);
                            // stop the player
                            if(player){$
                                player.removeAllListeners();
                                player.stop();
                                interaction.client.players.delete(interaction.guild.id);
                            }
                            if(response){
                                response.abort();
                                interaction.client.responses.delete(interaction.guild.id);
                            }
                        }
                    } catch (error){
                        await interaction.editReply('> ❌ Une erreur est survenue');
                        console.log(error);
                    }
                }
            }
            try{
                const avatar = interaction.client.user.displayAvatarURL();
                const botname = interaction.client.user.username;

                //////////// CHOIX DE LA RADIO ////////////

                // get command radio args
                let radio123 = interaction.options.getString('radio');

                let radio = {};
                // check if the argument is a url
                if(radio123.includes('http')) {
                    radio.url = radio123;
                    radio.name = 'Radio personnalisée';
                    radio.id = 'custom';
                    radio.logo = avatar;
                    radio.website = radio123;
                    radio.description = 'Cette radio est une radio personnalisée, c\'est fou non ?';
                    radio.genres = 'Aucun genre';
                    radio.country = 'InconnuLand';
                    radio.state = 'Perpète-les-Olivettes';
                    radio.language = 'Terrien';
                    radio.votes = '123456789';
                    try{
                        await interaction.client.serversdb.bulkWrite([
                            interaction.client.bulkutility.setField({
                                'id': interaction.guild.id
                            }, {
                                'radio': radio,
                                'voiceconfig.channelId': interaction.member.voice.channel.id,
                                'voiceconfig.guildId': interaction.guild.id
                            })
                        ])
                    }catch(err){
                        console.log(err);
                    }
                } else {
                    // use nodejs to search for the radio via radio.fr api ex : https://www.radio.fr/_next/data/Bhm34Nevnn5cxe6kgyzOA/fr-FR/search.json?q=${QUERY}
                    let options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: radio123,
                            limit: 25,
                            order: "clickcount",
                            hidebroken: "true",
                            reverse: "true",
                        })
                    }
                    let result = await fetch(`https://nl1.api.radio-browser.info/json/stations/search`, options).then(res => res.json());

                    // get the first result ex : x.pageProps.data.stations.playables[0].id (id of the radio)
                    // check if there are results
                    if(result.length > 0){
                        // list of radios to choose from discord list interaction
                        let radios = [];
                        // loop through the results to get the radios name and id
                        result.forEach(radio => {
                            if(radios.length < 25){
                                // get flag of the country
                                let description = `Langue : ${radio?.language} | Votes : ${radio?.votes} | Genres : ${radio?.tags}`;
                                // if description is too long (max 100 characters)
                                if(description.length > 90){
                                    description = description.substring(0, 90) + '...';
                                }
                                let label = radio.name + ' -> ' + radio?.country + ` (${radio?.state})`;
                                // if label is too long (max 100 characters)
                                if(label.length > 90){
                                    label = label.substring(0, 90) + '...';
                                }
                                // flag unicode with country code
                                let flag;
                                try{
                                    flag = countryCodeEmoji(radio?.countrycode);
                                } catch (e) {
                                    flag = '🌐';
                                }
                                // if flag is not found
                                if(!flag || flag.length == 0) flag = '🌐';

                                radios.push({
                                    label: label,
                                    description: description,
                                    value: radio.stationuuid,
                                    emoji: {
                                        name: flag,
                                    }
                                })
                            } else return;
                        });

                        // create a list of radios to choose from
                        compoment = new StringSelectMenuBuilder()
                            .setCustomId('select')
                            .setPlaceholder('Clique ici pour choisir !');
                        
                        for(let i = 0; i < radios.length; i++){
                            try{
                                compoment.addOptions(radios[i]);
                            } catch(e){
                                console.log(e);
                                let corrected = radio[i].emoji = {
                                    name: '🌐',
                                }
                                compoment.addOptions(corrected);
                            }
                        }
                        
                        const row = new ActionRowBuilder()
                            .addComponents(
                                compoment
                            );

                        // send the list of radios to choose from
                        await interaction.editReply({ content: '> ✅ Choisissez une radio parmis les résultats pour la recherche : ' + radio123, components: [row] });

                        // wait for the user to choose a radio
                        const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
                        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
                        // get the user choice in variable radio and get the radio infos

                        let collectorfinished = false;
                        let resultcollector = null;
                        collector.on('collect', async i => {
                            if (i.customId === 'select') {
                                resultcollector = result.find(radio => radio.stationuuid === i.values[0]);
                                collectorfinished = true;
                                await interaction.editReply({ content: '> ✅ Vous avez choisi la radio ' + resultcollector.name + ', Chargement en cours...', components: [] });
                            }
                        });
                        // if the user doesn't choose a radio in 15 seconds
                        collector.on('end', async collected => {
                            // if the user didn't choose a radio
                            if(!radio.id){
                                // send a message to the user
                                await interaction.editReply({ content: '> ❌ Vous n\'avez pas choisi de radio', components: [] });
                                return;
                            }
                            collectorfinished = true;
                        });
                        
                        // wait until the user choose a radio
                        while(!collectorfinished){
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                        // filter the radio infos to get the selected radio infos (collector result)
                        const toTitleCase = (phrase) => {
                            return phrase
                                .toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                        };
                        // but in format like 'text'.toTitleCase()
                        String.prototype.toTitleCase = function () {
                            return toTitleCase(this);
                        };
                        radio200 = resultcollector;
                        radio.name = radio200.name;
                        radio.id = radio200.stationuuid;
                        // test radio.logo
                        if(radio200.favicon)radio.logo = radio200.favicon;
                        else radio.logo = avatar;
                        // get radio genres and parse it to a string
                        genres = radio200.tags
                        if(genres && genres.length > 0) radio.genres = genres.split(',').join(', ').toTitleCase();
                        else radio.genres = 'Aucun genre';

                        let result2 = resultcollector;
                        if(result2) {
                            // get the stream url ex : x.pageProps.data.broadcast.streams[0].url
                            radio.url = result2.url_resolved
                            if(radio.website) {
                                radio.website = result2.homepage
                            } else {
                                radio.website = radio.url;
                            }
                            radio.country = result2.country;
                            radio.state = result2.state;
                            radio.language = result2.language.toTitleCase();
                            radio.votes = result2.votes;
                            // save the radio in the database
                            try{
                                await interaction.client.serversdb.bulkWrite([
                                    interaction.client.bulkutility.setField({
                                        'id': interaction.guild.id
                                    }, {
                                        'radio': radio,
                                        'voiceconfig.channelId': interaction.member.voice.channel.id,
                                        'voiceconfig.guildId': interaction.guild.id,
                                    })
                                ])
                            }catch(err){console.log(err);}
                        } else {
                            // if the radio doesn't have a stream url
                            await interaction.editReply({ content: '> ❌ La radio ' + radio.name + ' n\'a pas de flux audio ?!', components: [] });
                            return;
                        }
                    } else return await interaction.editReply('> ❌ Aucune radio trouvée');
                }

                // guild, info, client
                let info = {
                    radio: radio,
                }

                //////////////////////////////// PLAY THE RADIO ////////////////////////////////
                let playing = interaction.client.modules.radio.radioLoad(interaction.guild, info);
                if(!playing && interaction) await interaction.editReply('> ❌ Une erreur est survenue lors de la lecture de la radio ' + radio.name);
                ///////////////////////////////////////////////////////////////////////////////////

                let embed = new EmbedBuilder()
                    .setAuthor({ name: botname, iconURL: avatar })
                    .setTitle('📻 ' + radio.name)
                    .setURL(radio.website)
                    .setDescription(`Radio Lancée !\n[[🎵 Flux](${radio.url})] | [[📻 Site web](${radio.website})]${radio?.description ? ' | ' + radio.description : ''}`)
                    .addFields(
                        { name: '🌍 Pays', value: `${radio.country}${radio.state ? ` (${radio.state})` : ''}`, inline: true },
                        { name: '🗣️ Langue', value: radio.language, inline: true },
                        { name: '👍 Votes', value: radio.votes.toString(), inline: true },
                        { name: '🎶 Genres', value: radio.genres, inline: true }
                    )
                    .setThumbnail(radio.logo)
                    .setTimestamp()
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setFooter({ text: botname, iconURL: avatar });
                // show in a embed message that the bot is playing
                await interaction.editReply({ embeds: [embed] });
                try{
                    // get the stream metadata with the stream url
                    console.log('[INFO] Searching for metadata on the radio ' + radio.name)
                    internetradio.getStationInfo(radio.url, async function(err, stationInfo) {
                        if(err) {
                            console.log('[ERROR] Impossible to get the title and the artist of the song on the radio ' + radio.name)
                            console.log(err)
                            console.log('--------------------------------')
                        } else {
                            console.log(stationInfo);
                            var radio1 = {};
                            // get the title and separate the title and the artist
                            if(stationInfo?.title) {
                                if(stationInfo?.title?.includes(' - ')) {
                                    radio1.title = stationInfo?.title.split(' - ')[1];
                                    radio1.artist = stationInfo?.title.split(' - ')[0];
                                } else {
                                    radio1.title = stationInfo?.title;
                                    radio1.artist = 'Inconnu';
                                }
                            }
                            let updated = false;
                            if(stationInfo?.headers) {
                                if(radio.name == "Radio personnalisée") {
                                    console.log('[INFO] Searching for the radio name and the genres in the headers')
                                    if(stationInfo.headers['icy-name']) {
                                        radio.name = stationInfo.headers['icy-name'];
                                        console.log(`[INFO] Found the radio name : ${radio.name}`)
                                        embed.setTitle('📻 ' + radio.name);
                                        updated = true;
                                        try{
                                            await interaction.client.serversdb.bulkWrite([
                                                interaction.client.bulkutility.setField({
                                                    'id': interaction.guild.id
                                                }, {
                                                    'radio.name': radio.name
                                                })
                                            ])
                                        }catch(err){
                                            console.log(err);
                                        }
                                    }
                                }
                                if(radio?.genres?.length == 0 || !radio?.genres || radio?.genres == 'Aucun genre') {
                                    if(stationInfo.headers['icy-genre']) {
                                        radio.genres = stationInfo.headers['icy-genre'];
                                        console.log(`[INFO] Found the radio genres : ${radio.genres}`)
                                        embed.data.fields[3].value = radio.genres;
                                        updated = true;
                                        try{
                                            await interaction.client.serversdb.bulkWrite([
                                                interaction.client.bulkutility.setField({
                                                    'id': interaction.guild.id
                                                }, {
                                                    'radio.genres': radio.genres
                                                })
                                            ])
                                        }catch(err){
                                            console.log(err);
                                        }
                                    }
                                }
                                if(stationInfo.headers['icy-description']) {
                                    radio.description = stationInfo.headers['icy-description'];
                                    console.log(`[INFO] Found the radio description : ${radio.description}`)
                                    embed.setDescription(`Radio Lancée !\n[[🎵 Flux](${radio.url})] | [[📻 Site web](${radio.website})]${radio?.description ? ' | ' + radio.description : ''}`);
                                    updated = true;
                                    try{
                                        await interaction.client.serversdb.bulkWrite([
                                            interaction.client.bulkutility.setField({
                                                'id': interaction.guild.id
                                            }, {
                                                'radio.description': radio.description
                                            })
                                        ])
                                    }catch(err){
                                        console.log(err);
                                    }
                                }
                                if(radio?.website == radio?.url) {
                                    if(stationInfo.headers['icy-url']) {
                                        radio.website = stationInfo.headers['icy-url'];
                                        if(!radio.website.startsWith('http') && !radio.website.startsWith('https')) radio.website = 'http://' + radio.website;
                                        console.log(`[INFO] Found the radio website : ${radio.website}`)
                                        embed.setDescription(`Radio Lancée !\n[[🎵 Flux](${radio.url})] | [[📻 Site web](${radio.website})]${radio?.description ? ' | ' + radio.description : ''}`);
                                        updated = true;
                                        try{
                                            await interaction.client.serversdb.bulkWrite([
                                                interaction.client.bulkutility.setField({
                                                    'id': interaction.guild.id
                                                }, {
                                                    'radio.website': radio.website
                                                })
                                            ])
                                        }catch(err){
                                            console.log(err);
                                        }
                                    }
                                }
                            }
                            if((!radio1?.title || radio1?.title?.length == 0) && (!radio1?.artist || radio1?.artist?.length == 0)) {
                                console.log('[INFO] Impossible to get the title and the artist of the song on the radio ' + radio.name)
                            } else {
                                if(!radio1?.title || radio1?.title?.length == 0) radio1.title = 'Inconnu';
                                if(!radio1?.artist || radio1?.artist?.length == 0) radio1.artist = 'Inconnu';

                                console.log(`[INFO] Now playing on ${radio.name} : ${radio1.title} by ${radio1.artist}`);
                                // Modify the embed message to show the title and the artist
                                embed
                                    .addFields(
                                        { name: '🎵 Titre', value: radio1.title, inline: true },
                                        { name: '😀 Artiste', value: radio1.artist, inline: true },
                                    );
                                updated = true;
                            }
                            if(updated) await interaction.editReply({ embeds: [embed] });
                            if(radio1?.title != "Inconnu" && radio1?.artist != "Inconnu"){
                                // search the cover of the song
                                // `https://musicbrainz.org/ws/2/recording/?query=recording:"${radio1.title}"%20AND%20artist:"${radio1.artist}"%20AND%20status:official&fmt=json&limit=1`
                                // with headers : { 'User-Agent': 'OmegaBot/5.0' }
                                let ids = [];
                                try{
                                    console.log('[INFO] Searching for the cover of the song on the radio ' + radio.name)
                                    const response = await fetch(`https://musicbrainz.org/ws/2/recording/?query=recording:"${radio1.title}"%20AND%20artist:"${radio1.artist}"%20AND%20status:official&fmt=json`, { headers: { 'User-Agent': 'OmegaBot/5.0' } });
                                    const data = await response.json();
                                    if(data?.recordings?.length > 0){
                                        for(const recording of data?.recordings){
                                            if(recording?.releases?.length > 0){
                                                for(const release of recording.releases){
                                                    if(release?.title == recording.title) ids.push(release.id);
                                                }
                                            }
                                        }
                                    }
                                } catch (error){
                                    console.log('[ERROR] Impossible to get the cover of the song on the radio ' + radio.name)
                                    console.log(error)
                                    console.log('--------------------------------')
                                }
                                if(ids.length > 0) console.log('[INFO] Found ' + ids.length + ' id(s) to get the cover of the song on the radio ' + radio.name)
                                else console.log('[INFO] No id found to get the cover of the song on the radio ' + radio.name);
                                let cover = false;
                                if(ids.length > 0){
                                    for(const id of ids){
                                        try{
                                            console.log('[INFO] Searching for the cover of the song on the radio ' + radio.name)
                                            // https://coverartarchive.org/release/${id}
                                            const response = await fetch(`https://coverartarchive.org/release/${id}`);
                                            const data = await response.json();
                                            if(data?.images?.length > 0){
                                                const image = data.images[0];
                                                if(image?.thumbnails?.large) cover = image.thumbnails.large;
                                                else if(image?.thumbnails?.small) cover = image.thumbnails.small;
                                            }
                                        } catch (error){
                                            console.log('[ERROR] Impossible to get the cover of the song on the radio ' + radio.name)
                                            console.log(error)
                                            console.log('--------------------------------')
                                        }
                                        if(cover) break;
                                    }
                                }
                                if(cover){
                                    console.log('[INFO] Cover of the song found on the radio ' + radio.name);
                                    embed
                                    .setThumbnail(cover)
                                    .setAuthor({ name: botname, iconURL: radio.logo })
                                    await interaction.editReply({ embeds: [embed] });
                                }
                                if(!cover){
                                    console.log('[INFO] Impossible to get the cover of the song on the radio ' + radio.name)
                                }
                            }
                        }
                    });
                } catch (error){
                    console.log('[INFO] Impossible to get the title and the artist of the song on the radio ' + radio.name)
                    console.log(error)
                    console.log('--------------------------------')
                }
            } catch (error){
                //stream.destroy();
                console.log('Audio player is stopped');
                await interaction.editReply('> ❌ Une erreur est survenue, veuillez réessayer');
                console.log(error);
                try{
                    await interaction.client.serversdb.bulkWrite([
                        interaction.client.bulkutility.setField({
                            'id': interaction.guild.id
                        }, {
                            'voiceconfig.playing': false,
                            'voiceconfig.type': 'none'
                        })
                    ])
                } catch(err) {console.log(err);}
            }
        } else if(interaction.options.getSubcommand() == 'music') {
            await interaction.deferReply();
            await interaction.editReply('> ⏳ Veuillez patienter...');
            const music = interaction.options.getString('music');
            if(!music) return await interaction.editReply('> ❌ Vous devez spécifier une musique');
            const voicechannel = interaction.member.voice.channel;
            if(!voicechannel) return await interaction.editReply('> ❌ Vous devez être dans un salon vocal');
            const permissions = voicechannel.permissionsFor(interaction.client.user);
            if(!permissions.has('CONNECT')) return await interaction.editReply('> ❌ Je n\'ai pas la permission de me connecter à ce salon vocal');
            if(!permissions.has('SPEAK')) return await interaction.editReply('> ❌ Je n\'ai pas la permission de parler dans ce salon vocal');
            
            // get the music with the deezer api
            let result;
            try{
                result = await DeezerClient.infos.search("track", music);
            } catch(err) {console.log(err);}

            let selectedmusic;

            // if the music is not found
            if(!result) return await interaction.editReply('> ❌ Musique introuvable');
            else result = result.data;

            // show result if there is more than one result
            if(result?.length > 1){
                let embed = new EmbedBuilder()
                    .setColor(interaction.client.modules.randomcolor.getRandomColor())
                    .setTitle('Choisissez une musique')
                    .setDescription('Veuillez choisir une musique en cliquant sur le bouton correspondant, vous avez 30 secondes pour choisir')
                    .setFooter({ text: "Omega Music", iconURL: interaction.client.user.avatarURL() })
                let i = 0;
                // a select menu with all the results
                let select = new StringSelectMenuBuilder()
                    .setCustomId('music')
                    .setPlaceholder('Choisissez une musique')
                for(const music of result){
                    if(i < 25){
                        select.addOptions([
                            {
                                label: music.title + ' - ' + music.artist.name,
                                value: music.id.toString(),
                                description: music.album.title,
                                emoji: { name: '🎵' }
                            }
                        ])
                    }
                    i++;
                }
                embed.addFields({ name: 'Résultats', value:'```' + result.map((music, i) => `${i + 1}. ${music.title} - ${music.artist.name}`).join('\n') + '```' })
                await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents([select])] });
                
                const filter = (interaction) => interaction.user.id == interaction.member.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });
                collector.on('collect', async (interaction) => {
                    if(interaction.customId == 'music'){
                        selectedmusic = interaction.values[0];
                        collector.stop();
                    }
                });
                collector.on('end', async (collected, reason) => {
                    if(reason == 'time') return await interaction.editReply('> ❌ Vous avez mis trop de temps à choisir une musique');
                    if(!selectedmusic) return await interaction.editReply('> ❌ Vous n\'avez pas choisi de musique, vous devez réexecuter la commande');
                    await continueMusic();
                });
            } else if(result?.length == 1) selectedmusic = result[0].id;
            else return await interaction.editReply('> ❌ Musique introuvable');

            async function continueMusic(){

                // get the music
                let stream;
                try{
                    stream = await SongAsset.forLegacyStream(selectedmusic, SongLegacyFormat.MP3_128).getDecryptedStream();
                } catch(err) {console.log(err);}

                // if the music is not found
                if(!stream) return await interaction.editReply('> ❌ Erreur lors de la récupération de la musique');
                else return await interaction.editReply('> ✅ Musique trouvée, connexion au salon vocal...');

                return;
                try{
                    await interaction.client.serversdb.bulkWrite([
                        interaction.client.bulkutility.setField({
                            'id': interaction.guild.id
                        }, {
                            'voiceconfig.playing': true,
                            'voiceconfig.type': 'music',
                            'voiceconfig.music': music1
                        })
                    ])
                } catch(err) {console.log(err);}
            }
        }
    }
};