import dotenv from 'dotenv';
dotenv.config();

import TelegramBot from 'node-telegram-bot-api';
import https from 'https';
import fetch from 'node-fetch';

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY || '';
const WEATHER_API_KEY = process.env.OPM_API_KEY || '';

const getLocationUrl = (city: string, country?: string): string => `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json&limit=1`;
const getWeatherUrl = (lat: string, lng: string): string => `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&exclude=minutely,hourly,alerts&appid=${WEATHER_API_KEY}`;

const bot = new TelegramBot(TELEGRAM_API_KEY, {polling: true});

const getLocation = async (city: string, country?: string) => {
    const response = await fetch(getLocationUrl(city, country ?? ''));
    const location: any[] = await response.json();

    return location.length === 0 ? undefined : {lat: location[0].lat, lng: location[0].lon, place: location[0].display_name};
}

const getWeatherData = async (lat: string, lng: string) => {
    const response = await fetch(getWeatherUrl(lat, lng));
    const weather = await response.json();

    return {current: weather.current, week: weather.daily};
}

const getWeekWeatherMessage = (week: any[]) => {
    return week.reduce((acc, curr) => {
        console.log(curr);
        
        return `${acc}

<b>${new Date(curr.dt).toDateString()}</b>
${curr.temp.max}/${curr.temp.min}°C
<i>${curr.weather[0].main}</i>`;
    }, '');
}

const sendCityWeatherOptions = async (id: string, city: string, country?: string) => {
    const location = await getLocation(city, country);

    if (!location) {        
        return;
    }

    const {current, week} = await getWeatherData(location.lat, location.lng);

    
    bot.answerInlineQuery(id, [
            {
                type: 'article',
                id: `${location.place}--Now`,
                title: 'Weather -- Now',
                description: `Current weather`,
                input_message_content: {
                        message_text: `${location.place}
${'🌨'} - <b>${current.temp}°C</b>

<i>Feels like ${current.feels_like}°C. ${current.weather[0].description}</i>`,
                        parse_mode: 'HTML'
                    }
            },
            {
                type: 'article',
                id:`${location.place}--Week`,
                title: 'Weather -- Week',
                description: 'Weather in the next 7 days',
                input_message_content: {
                    message_text: getWeekWeatherMessage(week),
                    parse_mode: 'HTML',
                }
            },
        ]
    );
}

bot.on('inline_query', async ({id, query}) => {
    if (!query) {
        bot.answerInlineQuery(id, [
            {
                type: 'article',
                id: 'default_today_id',
                title: 'Weather -- Today',
                description: 'Placeholder',
                input_message_content: {
                    message_text: 'Placeholder',
                },
            },
            {
                type: 'article',
                id: 'default_week_id',
                title: 'Weather -- Week',
                description: 'Placeholder',
                input_message_content: {
                    message_text: 'Placeholder',
                },
            },
        ]);

        return;
    }

    await sendCityWeatherOptions(id, query);
});

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});
