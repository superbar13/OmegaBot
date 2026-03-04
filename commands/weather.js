// level command module to be used in index.js
const { EmbedBuilder } = require('discord.js');
const { StringSelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder } = require('@discordjs/builders');
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

        try {
            // Get coordinates using Open-Meteo Geocoding API
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);

            if (!geoRes.ok) {
                console.error(`Geocoding API error: ${geoRes.status}`);
                return interaction.editReply('> ❌ Une erreur est survenue lors de la recherche de la ville.');
            }

            const geoResponse = await geoRes.json();

            if (!geoResponse.results || geoResponse.results.length === 0)
                return interaction.editReply('> ❌ Ville introuvable.');

            const locationInfo = mapLocationData(geoResponse);
            const { latitude: lat, longitude: lon } = locationInfo.coordinates;

            // Fetch weather using the coordinates
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
            const weatherRes = await fetch(weatherUrl);

            if (!weatherRes.ok) {
                console.error(`Weather API error: ${weatherRes.status}`);
                return interaction.editReply('> ❌ Une erreur est survenue lors de la récupération de la météo.');
            }

            const weatherResponse = await weatherRes.json();

            if (!weatherResponse.current)
                return interaction.editReply('> ❌ Impossible de récupérer la météo.');

            const weatherData = remapWeatherData(weatherResponse);
            const weatherIcon = getWeatherIcon(weatherData.current_weather.weathercode.value);

            // create the embed
            const embed = new EmbedBuilder()
                .setTitle(`🔆 Météo à : ${locationInfo.name} ☁`)
                .setDescription(`Météo à ${locationInfo.name} à ${moment(weatherData.current_weather.time).format('HH')}h`)
                .addFields(
                    { name: '🌡️ Température', value: `${weatherData.current_weather.temperature.value}${weatherData.current_weather.temperature.unit}`, inline: true },
                    { name: '🧊 Température minimale', value: `${weatherData.daily[0].temp_min}°C`, inline: true },
                    { name: '🔥 Température maximale', value: `${weatherData.daily[0].temp_max}°C`, inline: true },
                    { name: '💧 Humidité', value: `${weatherData.current_weather.humidity}%`, inline: true },
                    { name: '💨 Vitesse du vent', value: `${weatherData.current_weather.windspeed.value} ${weatherData.current_weather.windspeed.unit}`, inline: true },
                    { name: '🌬️ Direction du vent', value: `${weatherData.current_weather.winddirection.value}° (${weatherData.current_weather.winddirection.description})`, inline: true },
                    { name: '🌫️ Nébulosité', value: `${weatherData.current_weather.cloud_cover}%`, inline: true },
                    { name: '🌈 Précipitations', value: `${weatherData.current_weather.precipitation}mm (${weatherData.current_weather.weathercode.description})`, inline: true },
                    {
                        name: '🥁 Heures suivantes',
                        value: weatherData.hourly
                            .slice(1, 4) // Next few hours like before
                            .map(data => `**${moment(data.time).format('HH')}h** : ${data.description} (${data.temp}°C)`)
                            .join('\n').toString().slice(0, 1024),
                        inline: false
                    },
                    {
                        name: '🪄 Jours suivants',
                        value: weatherData.daily
                            .slice(1, 8) // Next 7 days
                            .map(data => `**${moment(data.date).format('DD/MM')}** : ${data.description} (${data.temp_min}°C - ${data.temp_max}°C)`)
                            .join('\n').toString().slice(0, 1024),
                        inline: false
                    }
                )
                .setFooter({ text: 'Open-Meteo', iconURL: 'https://open-meteo.com/favicon.ico' })
                .setURL(`https://open-meteo.com/`)
                .setColor(interaction.client.modules.randomcolor.getRandomColor())
                .setThumbnail(weatherIcon)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error('Error fetching weather data:', err);
            await interaction.editReply('> ❌ Une erreur est survenue lors de la récupération de la météo.');
        }
    }
}

function mapLocationData(data) {
    const result = data.results[0];
    return {
        id: result.id,
        name: result.name,
        coordinates: {
            latitude: result.latitude,
            longitude: result.longitude,
            elevation: result.elevation,
        },
        country: {
            id: result.country_id,
            name: result.country,
            code: result.country_code,
        },
        timezone: result.timezone,
        population: result.population,
        administrative_divisions: {
            admin1: {
                id: result.admin1_id,
                name: result.admin1,
            },
            admin2: {
                id: result.admin2_id,
                name: result.admin2,
            },
            admin3: {
                id: result.admin3_id,
                name: result.admin3,
            },
            admin4: {
                id: result.admin4_id,
                name: result.admin4,
            },
        },
    };
}

function remapWeatherData(data) {
    return {
        location: {
            latitude: data.latitude,
            longitude: data.longitude,
            elevation: data.elevation,
            timezone: {
                name: data.timezone,
                abbreviation: data.timezone_abbreviation
            }
        },
        current_weather: {
            time: data.current.time,
            temperature: {
                value: data.current.temperature_2m,
                unit: '°C',
            },
            humidity: data.current.relative_humidity_2m,
            cloud_cover: data.current.cloud_cover,
            precipitation: data.current.precipitation,
            windspeed: {
                value: data.current.wind_speed_10m,
                unit: 'km/h',
            },
            winddirection: {
                value: data.current.wind_direction_10m,
                unit: "°",
                description: getWindDirection(data.current.wind_direction_10m)
            },
            weathercode: {
                value: data.current.weather_code,
                description: getWeatherDescription(data.current.weather_code)
            }
        },
        hourly: data.hourly.time.map((time, index) => ({
            time: time,
            temp: data.hourly.temperature_2m[index],
            description: getWeatherDescription(data.hourly.weather_code[index])
        })),
        daily: data.daily.time.map((date, index) => ({
            date: date,
            temp_max: data.daily.temperature_2m_max[index],
            temp_min: data.daily.temperature_2m_min[index],
            description: getWeatherDescription(data.daily.weather_code[index]),
            sunrise: data.daily.sunrise[index],
            sunset: data.daily.sunset[index]
        }))
    };
}


function getWindDirection(degree) {
    const directions = ["Nord", "Nord-Est", "Est", "Sud-Est", "Sud", "Sud-Ouest", "Ouest", "Nord-Ouest"];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Ciel dégagé",
        1: "Principalement dégagé",
        2: "Partiellement nuageux",
        3: "Couvert",
        45: "Brouillard",
        48: "Brouillard givrant",
        51: "Bruine légère",
        53: "Bruine modérée",
        55: "Bruine dense",
        61: "Pluie légère",
        63: "Pluie modérée",
        65: "Pluie forte",
        71: "Neige légère",
        73: "Neige modérée",
        75: "Neige forte",
        77: "Grains de neige",
        80: "Averses de pluie légères",
        81: "Averses de pluie modérées",
        82: "Averses de pluie violentes",
        85: "Averses de neige légères",
        86: "Averses de neige fortes",
        95: "Orage léger ou modéré",
        96: "Orage avec grêle légère",
        99: "Orage avec grêle forte",
    };
    return weatherCodes[code] || "Météo inconnue";
}

function getWeatherIcon(code) {
    // Map WMO codes to OpenWeather-style icons for a more modern look
    const iconMap = {
        0: '01d', // Clear sky
        1: '01d', // Mainly clear
        2: '02d', // Partly cloudy
        3: '03d', // Overcast
        45: '50d', // Fog
        48: '50d', // Fog
        51: '09d', // Drizzle
        53: '09d', // Drizzle
        55: '09d', // Drizzle
        61: '10d', // Rain
        63: '10d', // Rain
        65: '10d', // Rain
        71: '13d', // Snow
        73: '13d', // Snow
        75: '13d', // Snow
        77: '13d', // Snow
        80: '10d', // Rain showers
        81: '10d', // Rain showers
        82: '10d', // Rain showers
        85: '13d', // Snow showers
        86: '13d', // Snow showers
        95: '11d', // Thunderstorm
        96: '11d', // Thunderstorm
        99: '11d', // Thunderstorm
    };
    const iconName = iconMap[code] || '01d';
    return `https://openweathermap.org/img/wn/${iconName}@4x.png`;
}
