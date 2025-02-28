import { connectToDatabase } from '../../lib/mongodb';
import { createFlightMatrix } from '../../vestaboard/flightConversion';
import { createEventMatrix } from '../../vestaboard/eventConversion';

/**
 * API endpoint to fetch flight or event data in Vestaboard matrix format
 * This makes it easier to integrate with Power Automate
 * Now supports API key authentication for external access
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
        // Simple API key validation - check the query parameter or header
        const apiKey = req.query.apiKey || req.headers['x-api-key'];
        const validApiKey = process.env.EXTERNAL_API_KEY || 'flight-app-default-key';
        
        // If apiKey is not provided or doesn't match, return 401
        if (!apiKey || apiKey !== validApiKey) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Invalid or missing API key'
            });
        }
        
        // Get type from query parameter - 'flights' or 'events'
        const type = req.query.type || '';
        
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
            matrix = createFlightMatrix(sortedFlights);
        } else {
            // Get all events
            const events = await db.collection('events').find({}).toArray();
            
            // Sort by date and time
            const sortedEvents = [...events].sort((a, b) => {
                // First compare by date
                const dateComparison = a.date.localeCompare(b.date);
                if (dateComparison !== 0) return dateComparison;
                
                // If dates are same, compare by time
                return a.time.localeCompare(b.time);
            });
            
            // Convert to Vestaboard matrix
            matrix = createEventMatrix(sortedEvents);
        }
        
        // Return the matrix directly - this is the format Power Automate needs
        return res.status(200).json(matrix);
        
    } catch (error) {
        console.error('Error generating Vestaboard matrix:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error generating Vestaboard matrix',
            error: error.message
        });
    }
}
