const { watch } = require('fs');
const path = require('path');
const { flights } = require('../data');
const { createVestaMatrix } = require('./vestaConversion');
const { updateVestaboard } = require('./vestaboard');

let updateTimeout = null;

async function updateBoard() {
    try {
        const matrix = createVestaMatrix(flights);
        await updateVestaboard(matrix);
    } catch (error) {
        console.error('Failed to update Vestaboard:', error);
    }
}

const debouncedUpdate = (...args) => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => updateBoard(...args), 1000);
};

function watchFlightsData() {
    const dataPath = path.resolve(__dirname, '../data.js');
    try {
        watch(dataPath, (eventType) => {
            if (eventType === 'change') {
                console.log('Detected flights data change');
                delete require.cache[require.resolve('../data')];
                debouncedUpdate();
            }
        });
        console.log('Watching flights data file');
    } catch (error) {
        console.error('Error setting up file watch:', error);
    }
}

module.exports = { watchFlightsData, updateBoard };
