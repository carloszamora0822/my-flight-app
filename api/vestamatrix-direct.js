import { connectToDatabase } from '../lib/mongodb';
import { createVestaMatrix } from '../vestaboard/vestaConversion';
import { createEventMatrix } from '../vestaboard/eventConversion';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Get type from query parameter
    const type = req.query.type || 'flights';
    
    if (type !== 'flights' && type !== 'events') {
      return res.status(400).json({
        error: 'Invalid type parameter. Must be "flights" or "events".'
      });
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    let matrix;
    
    if (type === 'flights') {
      // Get flights from database
      const flights = await db.collection('flights').find({}).sort({ time: 1 }).toArray();
      
      // Convert to matrix
      matrix = createVestaMatrix(flights);
    } else {
      // Get events from database
      const events = await db.collection('events').find({}).sort({ date: 1, time: 1 }).toArray();
      
      // Convert to matrix
      matrix = createEventMatrix(events);
    }
    
    // Return matrix
    res.status(200).json(matrix);
  } catch (error) {
    console.error('Error getting Vestaboard matrix:', error);
    res.status(500).json({ 
      error: 'Failed to generate Vestaboard matrix',
      message: error.message
    });
  }
}
