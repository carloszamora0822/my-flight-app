const { flights, safeGet } = require('../data');
const { convertFlightsToMatrix } = require('./vestaConversion');
const { updateVestaBoard } = require('./vestaboard');

async function updateVestaboardFromData() {
  try {
    const currentFlights = safeGet();
    const matrix = convertFlightsToMatrix(currentFlights);
    
    // Make the update completely optional
    return await updateVestaBoard(matrix).catch(err => {
      console.warn('Non-critical Vestaboard update error:', err);
      return null;
    });
  } catch (error) {
    console.warn('Non-critical error in updateVestaboardFromData:', error);
    return null;
  }
}

module.exports = { updateVestaboardFromData };
