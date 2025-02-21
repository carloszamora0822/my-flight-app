const axios = require('axios');
const { 
    VESTABOARD_API_KEY, 
    VESTABOARD_API_SECRET, 
    VESTABOARD_SUBSCRIBER_ID 
} = require('../config/vestaboard');

async function updateVestaboard(matrix) {
    try {
        const response = await axios({
            method: 'post',
            url: `https://platform.vestaboard.com/subscriptions/${VESTABOARD_SUBSCRIBER_ID}/message`,
            headers: {
                'X-Vestaboard-Api-Key': VESTABOARD_API_KEY,
                'X-Vestaboard-Api-Secret': VESTABOARD_API_SECRET,
            },
            data: {
                characters: matrix
            }
        });
        return response.data;
    } catch (error) {
        console.error('Vestaboard update failed:', error.message);
        throw error;
    }
}

module.exports = { updateVestaboard };
