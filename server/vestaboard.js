// server/vestaboard.js

const axios = require('axios');
const { VESTA_API_KEY, VESTA_BOARD_ID } = require('./config');

async function updateVestaBoard(matrix) {
  // Format the matrix into a message string:
  // Each row (an array of numbers) is joined with spaces, and rows are joined with newlines.
  const message = matrix.map(row => row.join(' ')).join('\n');

  // Vestaboard API endpoint – update this URL if necessary.
  const url = `https://platform.vestaboard.com/v1/boards/${VESTA_BOARD_ID}/display`;

  try {
    const response = await axios.post(
      url,
      { message },
      {
        headers: {
          'Authorization': VESTA_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Vestaboard update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating Vestaboard:', error);
    throw error;
  }
}

module.exports = { updateVestaBoard };
