import dotenv from 'dotenv';
dotenv.config();

import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY || '';
const WEATHER_API_KEY = process.env.OPM_API_KEY || '';

const LOCATION_URL = (city: string): string => `https://nominatim.openstreetmap.org/search?city=${city}&format=json&limit=1`;

const bot = new TelegramBot(TELEGRAM_API_KEY, {polling: true});

const getLocation = async (city: string) => {
    const response = await fetch(LOCATION_URL(city));
    const locations: any[] = await response.json();

    console.log(locations);

    return locations.length === 0 ? {lat: 0, lng: 0} : {lat: locations[0].lat, lng: locations[0].lon};
}

bot.on('message', (msg) => {
    console.log(msg, 'hello there');
});

bot.on('inline_query', async ({id, query}) => {
    console.log(query);
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

    bot.answerInlineQuery(id, [
        {
            type: 'article',
            id: 'eeoo',
            title: 'Weather',
            description: 'Placeholder',
            input_message_content: {
                    message_text: 'the test worked'
                }
            }
        ]
    );
});

process.on('unhandledRejection', (err) => {
    process.exit(1);
});
