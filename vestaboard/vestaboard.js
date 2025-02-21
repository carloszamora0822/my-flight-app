require('dotenv').config();
const axios = require('axios');

async function updateVestaboard(matrix) {
    if (!process.env.VESTABOARD_API_KEY || !process.env.VESTABOARD_API_SECRET || !process.env.VESTABOARD_SUBSCRIBER_ID) {
        throw new Error('Missing required Vestaboard environment variables');
    }

    try {
        await axios({
            method: 'post',
            url: `https://platform.vestaboard.com/subscriptions/${process.env.VESTABOARD_SUBSCRIBER_ID}/message`,
            headers: {
                'X-Vestaboard-Api-Key': process.env.VESTABOARD_API_KEY,
                'X-Vestaboard-Api-Secret': process.env.VESTABOARD_API_SECRET,
            },
            data: { characters: matrix }
        });
        console.log('Vestaboard update successful');
    } catch (error) {
        console.error('Vestaboard update failed:', error.message);
        throw error;
    }
}

module.exports = { updateVestaboard };
