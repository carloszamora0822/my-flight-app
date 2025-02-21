// server/vestaboard/autoUpdate.js

const { flights } = require('../data');
const { convertFlightsToMatrix } = require('./vestaConversion');
const { updateVestaBoard } = require('./vestaboard');

async function updateVestaboardFromData() {
  try {
    if (!Array.isArray(flights)) {
      throw new Error('Flights data is not an array');
    }
    
    const matrix = convertFlightsToMatrix(flights);
    if (!matrix || !Array.isArray(matrix)) {
      throw new Error('Invalid matrix generated');
    }
    
    console.log('Attempting to update Vestaboard with matrix:', matrix);
    return await updateVestaBoard(matrix);
  } catch (error) {
    console.error('Error in updateVestaboardFromData:', error);
    // Don't throw the error - let the app continue working even if Vestaboard fails
    return null;
  }
}

module.exports = { updateVestaboardFromData };
