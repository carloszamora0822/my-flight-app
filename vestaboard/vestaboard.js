require('dotenv').config();
const axios = require('axios');

async function updateVestaboard(matrix) {
    // Validate environment variables
    const requiredEnvVars = {
        'VESTABOARD_API_KEY': process.env.VESTABOARD_API_KEY,
        'VESTABOARD_API_SECRET': process.env.VESTABOARD_API_SECRET,
    };

    const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        console.error('Missing environment variables:', missingVars.join(', '));
        throw new Error('Missing required Vestaboard environment variables');
    }

    // Validate matrix format
    if (!Array.isArray(matrix) || matrix.length !== 6 || 
        !matrix.every(row => Array.isArray(row) && row.length === 22)) {
        console.error('Invalid matrix format:', matrix);
        throw new Error('Matrix must be 6x22 array of numbers');
    }

    // Validate matrix values
    const invalidValues = matrix.flat().filter(val => typeof val !== 'number' || val < 0 || val > 70);
    if (invalidValues.length > 0) {
        console.error('Invalid character codes found:', invalidValues);
        throw new Error('Matrix contains invalid Vestaboard character codes');
    }

    try {
        console.log('Sending update to Vestaboard...');
        console.log('Matrix data:', matrix);

        const response = await axios({
            method: 'post',
            url: `https://platform.vestaboard.com/subscriptions/${process.env.VESTABOARD_SUBSCRIBER_ID}/message`,
            headers: {
                'X-Vestaboard-Api-Key': process.env.VESTABOARD_API_KEY,
                'X-Vestaboard-Api-Secret': process.env.VESTABOARD_API_SECRET,
                'Content-Type': 'application/json'
            },
            data: { characters: matrix }
        });

        console.log('Vestaboard response:', response.status, response.statusText);
        console.log('Update successful');
        return response.data;
    } catch (error) {
        console.error('Vestaboard API error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data
        });
        throw error;
    }
}

module.exports = { updateVestaboard };
