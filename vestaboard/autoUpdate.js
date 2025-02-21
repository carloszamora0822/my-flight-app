const { watch } = require('fs');
const path = require('path');
const { flights } = require('../data');
const { createVestaMatrix } = require('./vestaConversion');
const { updateVestaboard } = require('./vestaboard');

let updateTimeout = null;

async function updateBoard() {
    try {
        console.log('Creating Vestaboard matrix from flights:', flights);
        const matrix = createVestaMatrix(flights);
        console.log('Generated matrix:', matrix);
        
        await updateVestaboard(matrix);
        console.log('Vestaboard update completed successfully');
    } catch (error) {
        console.error('Failed to update Vestaboard:', {
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
    try {
        console.log('Starting flight data watch on:', dataPath);
        watch(dataPath, (eventType) => {
            if (eventType === 'change') {
                console.log('Detected change in flights data file');
                try {
                    delete require.cache[require.resolve('../data')];
                    console.log('Cleared require cache for data.js');
                    debouncedUpdate();
                } catch (error) {
                    console.error('Error processing file change:', error);
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
