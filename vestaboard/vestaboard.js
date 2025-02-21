require('dotenv').config();
const axios = require('axios');

async function updateVestaboard(matrix) {
    console.log('Starting Vestaboard update...');

    // Environment variable validation
    const requiredEnvVars = {
        'VESTABOARD_API_KEY': process.env.VESTABOARD_API_KEY,
        'VESTABOARD_API_SECRET': process.env.VESTABOARD_API_SECRET,
    };

    Object.entries(requiredEnvVars).forEach(([key, value]) => {
        if (!value) {
            console.error(`Missing environment variable: ${key}`);
        } else {
            console.log(`${key} is configured`);
        }
    });

    // Matrix validation
    console.log('Validating matrix format...');
    if (!Array.isArray(matrix)) {
        console.error('Matrix is not an array:', typeof matrix);
        throw new Error('Invalid matrix format');
    }

    if (matrix.length !== 6) {
        console.error('Invalid matrix row count:', matrix.length);
        throw new Error('Matrix must have exactly 6 rows');
    }

    matrix.forEach((row, i) => {
        if (!Array.isArray(row) || row.length !== 22) {
            console.error(`Invalid row ${i} length:`, row?.length);
            throw new Error(`Row ${i} must have exactly 22 characters`);
        }
    });

    try {
        console.log('Sending to Vestaboard API...');
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

        console.log('Vestaboard API response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });

        return response.data;
    } catch (error) {
        console.error('Vestaboard API Error:', {
            message: error.message,
            response: {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            }
        });
        throw new Error(`Vestaboard API Error: ${error.message}`);
    }
}

module.exports = { updateVestaboard };
