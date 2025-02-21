// server/vestaboard/vestaboard.js

const axios = require('axios');
const { VESTA_API_KEY, VESTA_BOARD_ID } = require('./config');

async function updateVestaBoard(matrix) {
  // Skip Vestaboard update if credentials are missing
  if (!VESTA_API_KEY || !VESTA_BOARD_ID) {
    console.warn('Vestaboard credentials not configured - skipping update');
    return null;
  }

  try {
    const message = matrix.map(row => row.join(' ')).join('\n');
    console.log('Message to be sent to Vestaboard:', message);

    const url = `https://platform.vestaboard.com/v1/boards/${VESTA_BOARD_ID}/display`;

    const response = await axios.post(
      url,
      { message },
      {
        headers: {
          'Authorization': `Bearer ${VESTA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Vestaboard update response:', response.data);
    return response.data;
  } catch (error) {
    console.warn('Non-critical Vestaboard error:', error.message);
    return null;
  }
}

module.exports = { updateVestaBoard };
