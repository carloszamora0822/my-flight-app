import { connectToDatabase } from '../lib/mongodb';
import { createVestaMatrix } from '../vestaboard/vestaConversion';
import { createEventMatrix } from '../vestaboard/eventConversion';

/**
 * Dedicated API endpoint for Power Automate integration with Vestaboard
 * Returns the data in exactly the format Vestaboard expects
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get type from query parameter
    const type = req.query.type || 'flights';
    
    // Validate type
    if (type !== 'flights' && type !== 'events') {
      return res.status(400).json({ error: "Parameter 'type' must be 'flights' or 'events'" });
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get the data based on type
    let matrix;
    
    if (type === 'flights') {
      // Get all flights
      const flights = await db.collection('flights').find({}).toArray();
      
      // Sort by time
      const sortedFlights = [...flights].sort((a, b) => {
        return parseInt(a.time) - parseInt(b.time);
      });
      
      // Create the matrix
      matrix = createVestaMatrix(sortedFlights);
    } else {
      // Get all events
      const events = await db.collection('events').find({}).toArray();
      
      // Sort by date
      const sortedEvents = [...events].sort((a, b) => {
        // First sort by date
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        
        // Then by time if date is the same and time exists
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
      
      // Create the matrix
      matrix = createEventMatrix(sortedEvents);
    }
    
    // Return data in the exact format the Vestaboard API expects
    return res.status(200).json({
      characters: matrix
    });
    
  } catch (error) {
    console.error('Error generating Vestaboard data:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
