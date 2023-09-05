// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const fetch = require('node-fetch');
const os = require('os');
var pidusage = require('pidusage')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    category: 'basic',
    async execute(interaction){
        await interaction.deferReply();
        // get the telegram bot ping
        let teltime = moment().valueOf();
        await interaction.client.telegram.telegram.getMe().then(async (result) => {
            teltime = moment().valueOf() - teltime;
        }).catch(async () => {
            teltime = '❌';
        });
        teltime = Math.round(teltime);
        // get the Discord bot ping
        let discordtime = moment().valueOf();
        await interaction.client.users.fetch(interaction.client.user.id, { force: true }).then(async (result) => {
            discordtime = moment().valueOf() - discordtime;
        }).catch(async () => {
            discordtime = '❌';
        });
        discordtime = Math.round(discordtime);
        // get my internet connection ping
        let mytime = moment().valueOf();
        await fetch('https://google.com').then(async () => {
            mytime = moment().valueOf() - mytime;
        }).catch(async () => {
            mytime = '❌';
        });
        mytime = Math.round(mytime);
        // get the cpu usage in ms of the user and system of the process
        var pid = process.pid
        var use = await pidusage(pid);
        // edit the reply
        await interaction.editReply({ embeds: [
            new EmbedBuilder()
            .setTitle('🏓 Pong !')
            .setDescription(
                '> 💬 Discord - Websocket : **' + interaction.client.ws.ping + 'ms** - Fetch : **' + discordtime + 'ms**\n' +
                '> ✈ Telegram : **' + teltime + 'ms**\n' +
                '> 🌐 Internet : **' + mytime + 'ms**\n' +
                '> 📡 Database / Données : **' + await interaction.client.serversdb.ping() + 'ms**\n' +
                // use.memory is in bytes
                `> 🧳 Util. Mem. : ${Math.round(use.memory / 1024 / 1024)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB (${Math.round((use.memory / os.totalmem()) * 100)}%)\n` +
                `> 🖥️ Util. Proc. : ${Math.round(use.cpu)}%`
            )
            .setThumbnail('https://media.discordapp.net/attachments/909475569459163186/1077673171077046312/ping.png')
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp()
        ]})
    }
};