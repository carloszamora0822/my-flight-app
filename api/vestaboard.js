import { createVestaMatrix } from '../vestaboard/vestaConversion';
import { createEventMatrix } from '../vestaboard/eventConversion';

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Get type from query parameter or default to "flights"
    const type = req.query.type || 'flights';
    
    // Get data from request body or use empty array
    const data = req.body || [];
    
    // Convert data to matrix
    let matrix;
    if (type === 'flights') {
      matrix = createVestaMatrix(data);
    } else if (type === 'events') {
      matrix = createEventMatrix(data);
    } else {
      return res.status(400).json({ 
        error: 'Invalid type. Must be "flights" or "events".'
      });
    }
    
    // Return matrix
    res.status(200).json(matrix);
  } catch (error) {
    console.error('Error creating matrix:', error);
    res.status(500).json({ 
      error: 'Failed to create matrix',
      message: error.message
    });
  }
}
