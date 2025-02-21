const { watch } = require('fs');
const path = require('path');
const { flights } = require('../data');
const { createVestaMatrix } = require('./vestaConversion');
const { updateVestaboard } = require('./vestaboard');

let updateTimeout = null;

async function updateBoard() {
    console.log('Starting Vestaboard board update...');
    
    try {
        if (!flights || !Array.isArray(flights)) {
            console.error('Invalid flights data:', flights);
            throw new Error('Flights data is not valid');
        }

        console.log(`Processing ${flights.length} flights...`);
        const matrix = createVestaMatrix(flights);
        
        console.log('Matrix created successfully, updating Vestaboard...');
        await updateVestaboard(matrix);
        
        console.log('Vestaboard update completed successfully');
    } catch (error) {
        console.error('Vestaboard Update Failed:', {
            error: error.message,
            stack: error.stack,
            flights: flights
        });
    }
}

const debouncedUpdate = (...args) => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => updateBoard(...args), 1000);
};

function watchFlightsData() {
    const dataPath = path.resolve(__dirname, '../data.js');
    console.log('Setting up file watch for:', dataPath);

    try {
        watch(dataPath, (eventType) => {
            console.log(`File event detected: ${eventType}`);
            if (eventType === 'change') {
                console.log('Processing file change...');
                try {
                    delete require.cache[require.resolve('../data')];
                    console.log('Cleared module cache');
                    debouncedUpdate();
                    console.log('Triggered update');
                } catch (error) {
                    console.error('Error handling file change:', {
                        error: error.message,
                        path: dataPath
                    });
                }
            }
        });
        console.log('File watch setup complete');
    } catch (error) {
        console.error('Failed to setup file watch:', {
            error: error.message,
            path: dataPath
        });
    }
}

module.exports = { watchFlightsData, updateBoard };
