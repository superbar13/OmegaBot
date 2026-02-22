// level command module to be used in index.js
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Affiche la météo')
        .addStringOption(option => option.setName('ville').setDescription('Ville dont vous voulez voir la météo')),
    category: 'basic',
    ratelimit: true,
    async execute(interaction) {
        await interaction.deferReply();
        // get the city
        let city = interaction.options.getString('ville') || 'Marseille';

        // get the location lattitude and longitude
        let location = await fetch(`https://geocode.maps.co/search?q=${city}`).then(res => res.json()).catch(err => null);
        if (!location) return interaction.editReply('> ❌ Une erreur est survenue, la ville est peut-être introuvable');
        location = location[0];

        // get the weather
        let weather = await fetch(`http://www.7timer.info/bin/api.pl?lon=${location.lon}&lat=${location.lat}&product=civil&output=json`).then(res => res.json()).catch(err => null);
        if (!weather) return interaction.editReply('> ❌ Une erreur est survenue, la météo est peut-être introuvable mais pour maintenant et les heures suivantes');
        let weatherLight = await fetch(`http://www.7timer.info/bin/api.pl?lon=${location.lon}&lat=${location.lat}&product=civillight&output=json`).then(res => res.json());
        if (!weatherLight) return interaction.editReply('> ❌ Une erreur est survenue, la météo est peut-être introuvable mais pour les jours suivants');

        // get now hour
        let nowHour = new Date().getHours();
        // get NowWeather using .timepoint and nowHour nearest value
        let nowWeather = weather.dataseries.find(data => data.timepoint === weather.dataseries.map(data => data.timepoint).reduce((prev, curr) => Math.abs(curr - nowHour) < Math.abs(prev - nowHour) ? curr : prev));

        // get now day in light weather
        let nowWeatherLight = weatherLight.dataseries[0];

        // get the weather icon
        let weathericon = `https://www.7timer.info/img/misc/about_civil_${nowWeather.weather.replace('day', '').replace('night', '')}.png`;

        // create the embed
        const embed = new EmbedBuilder()
            .setTitle(`🔆 Météo a : ${city} ☁`)
            .setDescription(`Météo a ${city} a ${nowWeather.timepoint}h`)
            .addFields(
                { name: '🌡️ Température', value: nowWeather.temp2m + '°C', inline: true },
                { name: '🧊 Température minimale', value: nowWeatherLight.temp2m.min + '°C', inline: true },
                { name: '🔥 Température maximale', value: nowWeatherLight.temp2m.max + '°C', inline: true },
                { name: '💧 Humidité', value: nowWeather.rh2m + '%', inline: true },
                { name: '💨 Vitesse du vent', value: nowWeather.wind10m.speed + 'km/h', inline: true },
                { name: '🌬️ Direction du vent', value: nowWeather.wind10m.direction + '°', inline: true },
                { name: '🌫️ Nébulosité', value: nowWeather.cloudcover + '%', inline: true },
                { name: '🌈 Précipitations', value: nowWeather.prec_type + ' (' + nowWeather.prec_amount + 'mm)', inline: true },
                {
                    name: '🥁 Heures suivantes',
                    value: weather.dataseries
                        .filter(data => data.timepoint > nowWeather.timepoint && data.timepoint < nowWeather.timepoint + 6)
                        .map(data =>
                            `**${data.timepoint}h** : ${data.weather} (${data.temp2m}°C)`
                        ).join('\n').toString().slice(0, 1024),
                    inline: false
                },
                {
                    name: '🪄 Jours suivants',
                    value: (weatherLight.dataseries
                        .filter(data => data.date > nowWeatherLight.date && data.date < nowWeatherLight.date + 7)
                        .map(data =>
                            `**${data.date}** : ${data.weather} (${data.temp2m.min}°C - ${data.temp2m.max}°C)`
                        ).join('\n')).toString().slice(0, 1024),
                    inline: false
                }
            )
            .setFooter({ text: '7timer.info', iconURL: 'https://www.7timer.info/icon_mini.gif' })
            .setURL('https://www.7timer.info/')
            .setColor(interaction.client.modules.randomcolor.getRandomColor())
            .setTimestamp()
            .setThumbnail(weathericon);
        await interaction.editReply({ embeds: [embed] });
    }
}