// info command module to be used in index.js

const { ButtonBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonStyle } = require('discord.js');

const mcapi = require("minecraft-lookup");

// node-fetch
const fetch = require('node-fetch');

const moment = require('moment');
const tunnel = require('tunnel');

async function fetchWithTimeout(resource, options = {}) {
    // default timeout 8s
    const { timeout = 8000 } = options;
    
    // create an abort controller
    const controller = new AbortController();
    // create a timeout
    const id = setTimeout(() => controller.abort(), timeout);
  
    // fetch with timeout
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });

    // clear timeout
    clearTimeout(id);
  
    // return response
    return response;
}

const dns = require('dns');
const http = require('http');
const https = require('https');

const statuslist = [
    "www.minecraft.net",
    "account.mojang.com",
    "session.minecraft.net",
    "auth.mojang.com",
    //"skins.minecraft.net",
    "authserver.mojang.com",
    "sessionserver.mojang.com",
    "api.mojang.com",
    "textures.minecraft.net",
];

module.exports = {
    data: new SlashCommandBuilder()
    .setName('mcinfo')
    .setDescription('Affiche des informations Minecraft')
    // add options radio required for the command
    .addSubcommand(
        subcommand => subcommand
        .setName('user')
        .setDescription('Affiche les informations a propos de l\'utilisateur')
        .addStringOption(option => option.setName('user').setDescription('Utilisateur a afficher').setRequired(true))
    )
    .addSubcommand(
        subcommand => subcommand
        .setName('server')
        .setDescription('Affiche les informations a propos du serveur')
        .addStringOption(option => option.setName('server').setDescription('Serveur a afficher').setRequired(true))
    )
    .addSubcommand(
        subcommand => subcommand
        .setName('status')
        .setDescription('Affiche les informations a propos du status des serveurs Mojang')
    ),
    category: 'basic',
    ratelimit: true,
    async execute(interaction){
        await interaction.deferReply();
        // check which subcommand is used
        const subcommand = interaction.options.getSubcommand();
        if(subcommand === 'user'){
            // get user
            const username = interaction.options.getString('user');

            // get user info
            let user = await mcapi.user(username);
            if(!user || !user?.id) return interaction.editReply({ content: 'Utilisateur introuvable', ephemeral: true });

            let namehistory = await mcapi.nameHistory("username", username);
            let ofCape = await mcapi.ofCape(username);
            let skin = await mcapi.skin(username);
            let skinhead = await mcapi.head(username);
            
            // create embed
            const embed = new EmbedBuilder()
            .setTitle('👤 ' + user.name)
            .setDescription(`[Voir le profil](https://fr.namemc.com/profile/${user?.name})`)
            .addFields(
                { name: '🔎 UUID', value: user?.id?.toString(), inline: true },
                { name: '🎨 Skin', value: `[Voir](${skin?.view}) | [Télécharger](${skin?.download}) | [3D](${skin?.sideview})`, inline: true },
                { name: '🎨 SkinHead', value: `[3D](${skinhead?.helmhead}) | [2D](${skinhead?.helmavatar})`, inline: true },
                { name: '🧢 Cape', value: ofCape?.cape ? `[Voir](${ofCape})` : 'Pas de cape', inline: true },
                { name: '🕒 Historique des noms', value: 
                (namehistory && !namehistory.error) ? (namehistory
                        .map(n => n.changedToAt ? n.name + ' (' + moment(n.changedToAt).format('DD/MM/YYYY à HH:mm:ss') + ')' : n.name)
                        .join(', ')) : 'Aucun historique ou erreur'
                    , inline: false 
                }
            )
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setFooter({ text: user.name, iconURL: skinhead?.helmhead })
            .setThumbnail(skin?.view)
            .setImage(skin?.sideview)
            .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'server'){
            // get the option value
            const servername = interaction.options.getString('server');

            // get server info
            let server = await mcapi.server(servername);
            if(!server || !server?.ip) return interaction.editReply({ content: 'Serveur introuvable', ephemeral: true });

            // create embed
            const embed = new EmbedBuilder()
            .setTitle('📡 ' + servername)
            .setDescription(server?.motd?.clean?.toString())
            .addFields(
                { name: '🔎 IP', value: server?.ip?.toString(), inline: true },
                { name: '🕒 Port', value: server?.port?.toString(), inline: true },
                { name: '👥 Joueurs', value: server?.players?.online + '/' + server?.players?.max, inline: true },
                { name: '🔋 Version', value: server?.version, inline: true },
                { name: '🟢 En ligne', value: server?.online ? 'Oui' : 'Non', inline: true },
                { name: '🔌 Protocol', value: server?.protocol?.toString(), inline: true },
                { name: '📜 Motd', value: server?.motd?.raw?.toString(), inline: false }
            )
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setFooter({ text: servername, iconURL: server?.servericon })
            .setThumbnail(server?.servericon)
            .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } else if(subcommand === 'status') {
            interaction.editReply({ content: 'Chargement... (Cela peut prendre quelques secondes (max 2s))' });
            const embed = new EmbedBuilder()
            .setTitle('📡 Status des serveurs Mojang')
            .setDescription('🟢 Online | 🔴 Offline | ⚠️ Erreur')
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setThumbnail('https://cdn.discordapp.com/attachments/909475569459163186/1125068088270913556/mojang-logo-988A631D5C-seeklogo.png')
            // get actual timestamp
            let date = new Date();
            await Promise.all(statuslist.map(async (key) => {
                let value = await fetchWithTimeout('https://' + key, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36'
                    },
                    redirect: 'follow',
                    follow: 20,
                    compress: true,
                    timeout: 2000,
                    primarydns: "1.1.1.1", // primarydns: Cloudflare
                    secondarydns: "8.8.8.8" // secondarydns: Google
                    // proxy: 'https://12.218.209.130:53281',
                })
                .catch(() => { return null; });

                let newdate = new Date();
                let diff = newdate - date;

                if(!value || !value?.status) embed.addFields({ name: key, value: "🔴", inline: true});
                else if(value?.status < 500) embed.addFields({ name: key, value: "🟢 " + diff + "ms", inline: true});
                else embed.addFields({ name: key, value: "🔴 " + value?.status, inline: true});
            }));
            await interaction.editReply({content:'', embeds: [embed] });
        }
    }
};