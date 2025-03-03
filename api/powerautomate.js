import { connectToDatabase } from '../lib/mongodb';
import { createVestaMatrix } from '../vestaboard/vestaConversion';
import { createEventMatrix } from '../vestaboard/eventConversion';

/**
 * API endpoint specifically for Power Automate integration
 * Returns the latest flight or event matrices in raw Vestaboard format
 * No authentication required for simplicity
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get type from query parameter - 'flights' or 'events'
    const type = req.query.type || 'flights';
    
    // Validate type
    if (type !== 'flights' && type !== 'events') {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'type' must be either 'flights' or 'events'"
      });
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get data based on type
    let matrix;
    
    if (type === 'flights') {
      // Get all flights
      const flights = await db.collection('flights').find({}).toArray();
      
      // Sort by time
      const sortedFlights = [...flights].sort((a, b) => {
        return parseInt(a.time) - parseInt(b.time);
      });
      
      // Convert to Vestaboard matrix
      matrix = createVestaMatrix(sortedFlights);
    } else {
      // Get all events
      const events = await db.collection('events').find({}).toArray();
      
      // Sort by date
      const sortedEvents = [...events].sort((a, b) => {
        return a.date.localeCompare(b.date);
      });
      
      // Convert to Vestaboard matrix
      matrix = createEventMatrix(sortedEvents);
    }
    
    // Return the matrix directly - this is the format Power Automate needs
    return res.status(200).json({
      success: true,
      matrix: matrix,
      message: `Successfully generated ${type} matrix for Vestaboard`
    });
    
  } catch (error) {
    console.error('Error generating Vestaboard matrix:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating Vestaboard matrix',
      error: error.message
    });
  }
}
