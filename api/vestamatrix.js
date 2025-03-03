import { connectToDatabase } from '../lib/mongodb';
import { createVestaMatrix } from '../vestaboard/vestaConversion';
import { createEventMatrix } from '../vestaboard/eventConversion';
import { format, utcToZonedTime } from 'date-fns-tz';

/**
 * API endpoint to fetch flight or event data in Vestaboard matrix format
 * Enhanced for Power Automate integration - supports matrix or text format
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization,x-api-key');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        // Check if this is a formatted text request for Vestaboard Read-Write API
        const useTextFormat = req.query.format === 'text';

        // Check if this is a Power Automate request (will return raw matrix)
        const isPowerAutomate = req.query.powerautomate === 'true';
        
        // API key validation - not required for Power Automate requests
        if (!isPowerAutomate && !useTextFormat) {
            const apiKey = req.query.apiKey || req.headers['x-api-key'];
            const validApiKey = process.env.EXTERNAL_API_KEY || 'flight-app-default-key';
            
            // If apiKey is not provided or doesn't match, return 401
            if (!apiKey || apiKey !== validApiKey) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - Invalid or missing API key'
                });
            }
        }
        
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
        
        // For text format (Vestaboard Read-Write API)
        if (useTextFormat) {
            let resultText = '';
            
            if (type === 'flights') {
                // Get the current date in Central Time (Chicago)
                const now = new Date();
                
                // Force timezone to be Central Time
                const tz = 'America/Chicago';
                const centralTimeNow = utcToZonedTime(now, tz);
                
                // Format as MM/DD
                const dateStr = format(centralTimeNow, 'MM/dd', { timeZone: tz });
                
                // Log for debugging
                console.log(`Server date: ${now.toISOString()}`);
                console.log(`Converted to Central time: ${dateStr}`);
                
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
        }
        
        // Matrix format (Vestaboard Subscription API or display)
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
            
            // Sort by date and time
            const sortedEvents = [...events].sort((a, b) => {
                // First compare by date
                const dateComparison = a.date.localeCompare(b.date);
                if (dateComparison !== 0) return dateComparison;
                
                // If dates are same, compare by time
                if (a.time && b.time) {
                    return a.time.localeCompare(b.time);
                }
                return 0;
            });
            
            // Convert to Vestaboard matrix
            matrix = createEventMatrix(sortedEvents);
        }
        
        // For Power Automate, return only the matrix
        if (isPowerAutomate) {
            return res.status(200).json(matrix);
        }
        
        // For normal API calls, return the matrix with metadata
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
