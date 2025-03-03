import { connectToDatabase } from '../lib/mongodb';

/**
 * API endpoint that returns flight or event data as a simple text string
 * Optimized for Vestaboard Read-Write API
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
    
    let resultText = '';
    
    if (type === 'flights') {
      // Get current date in MM/DD format
      const today = new Date();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const dateStr = `${month}/${day}`;
      
      // Get all flights
      const flights = await db.collection('flights').find({}).toArray();
      
      // Sort by time
      const sortedFlights = [...flights].sort((a, b) => {
        return parseInt(a.time) - parseInt(b.time);
      });
      
      // Create a header
      resultText = `CHECKLIST: ${dateStr} FLIGHTS `;
      
      // Add each flight
      for (const flight of sortedFlights) {
        if (resultText.length > 0) resultText += ' ';
        resultText += `${flight.name.toUpperCase()} ${flight.id} ${flight.dest.toUpperCase()}`;
        
        // Don't make the text too long
        if (resultText.length > 120) break;
      }
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
      
      // Create a header
      resultText = 'UPCOMING EVENTS: ';
      
      // Add each event
      for (const event of sortedEvents) {
        if (resultText.length > 0) resultText += ' ';
        
        // Format date for display
        const dateParts = event.date.split('-');
        const month = dateParts[1];
        const day = dateParts[2];
        
        resultText += `${month}/${day} ${event.title.toUpperCase()}`;
        
        // Don't make the text too long
        if (resultText.length > 120) break;
      }
    }
    
    // Return data in format for Vestaboard Read-Write API
    return res.status(200).json({
      text: resultText
    });
    
  } catch (error) {
    console.error('Error generating text for Vestaboard:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
