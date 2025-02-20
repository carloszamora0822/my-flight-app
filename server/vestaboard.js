// server/vestaboard.js

const axios = require('axios');
const { VESTA_API_KEY, VESTA_BOARD_ID } = require('./config');

async function updateVestaBoard(matrix) {
  // Convert each row (an array of numbers) to a string with codes separated by spaces.
  // Then join rows with newline characters.
  const message = matrix.map(row => row.join(' ')).join('\n');

  // Vestaboard API endpoint – update this URL if needed.
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
