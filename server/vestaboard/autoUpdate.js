// server/vestaboard/autoUpdate.js

const { flights } = require('../data');
const { convertFlightsToMatrix } = require('./vestaConversion');
const { updateVestaBoard } = require('./vestaboard');

function updateVestaboardFromData() {
  const matrix = convertFlightsToMatrix(flights);
  return updateVestaBoard(matrix);
}

module.exports = { updateVestaboardFromData };
