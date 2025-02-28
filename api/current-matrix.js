import { connectToDatabase } from '../lib/mongodb';
import { createVestaMatrix } from '../vestaboard/vestaConversion';
import { createEventMatrix } from '../vestaboard/eventConversion';

/**
 * Simple API endpoint that returns the current Vestaboard matrix directly
 * No authentication required - designed for direct use with Power Automate
 */
export default async function handler(req, res) {
  // CORS headers - allow any origin to access this API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get type from query parameter - defaults to 'flights'
    const type = req.query.type || 'flights';

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get data based on type
    let matrix;
    
    if (type === 'events') {
      // Get all events
      const events = await db.collection('events').find({}).toArray();
      
      // Convert to Vestaboard matrix
      matrix = createEventMatrix(events);
    } else {
      // Get all flights
      const flights = await db.collection('flights').find({}).toArray();
      
      // Convert to Vestaboard matrix
      matrix = createVestaMatrix(flights);
    }
    
    // Return the matrix in Vestaboard API format
    return res.status(200).json({
      characters: matrix
    });
    
  } catch (error) {
    console.error('Error generating matrix:', error);
    
    // Return a default matrix in case of error
    const defaultMatrix = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    return res.status(200).json({
      characters: defaultMatrix
    });
  }
}
