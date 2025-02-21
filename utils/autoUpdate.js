const { watch } = require('fs');
const path = require('path');
const { flights } = require('../data');
const { createVestaMatrix } = require('./vestaConversion');
const { updateVestaboard } = require('../services/vestaboard');

let updateTimeout = null;

function debounce(func, wait) {
    return function executedFunction(...args) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const updateBoard = async () => {
    try {
        const matrix = createVestaMatrix(flights);
        await updateVestaboard(matrix);
        console.log('Vestaboard updated successfully');
    } catch (error) {
        console.error('Failed to update Vestaboard:', error);
    }
};

const debouncedUpdate = debounce(updateBoard, 1000);

function watchFlightsData() {
    const dataPath = path.resolve(__dirname, '../data.js');
    try {
        watch(dataPath, (eventType) => {
            if (eventType === 'change') {
                console.log('Detected change in flights data');
                delete require.cache[require.resolve('../data')];
                debouncedUpdate();
            }
        });
        console.log('Watching flights data file for changes');
    } catch (error) {
        console.error('Error setting up file watch:', error);
    }
}

module.exports = { watchFlightsData, updateBoard };
