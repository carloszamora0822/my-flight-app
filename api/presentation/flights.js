import { connectToDatabase } from '../../lib/mongodb';
import { createFlightMatrix } from '../../vestaboard/flightConversion';
import { updateVestaboard } from '../../vestaboard/vestaboardApi';

/**
 * API endpoint to fetch flight data formatted for presentation slides
 * Can also update the Vestaboard if requested via query parameter
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        // Connect to database
        const { db } = await connectToDatabase();
        
        // Get all flights
        const flights = await db.collection('flights').find({}).toArray();
        
        // Sort by time
        const sortedFlights = [...flights].sort((a, b) => {
            return parseInt(a.time) - parseInt(b.time);
        });
        
        // Check if we should update the Vestaboard
        const updateVesta = req.query.updateVesta === 'true';
        let vestaUpdated = false;
        
        if (updateVesta) {
            try {
                const matrix = createFlightMatrix(sortedFlights);
                await updateVestaboard(matrix);
                vestaUpdated = true;
                console.log('Vestaboard updated with flights from presentation API');
            } catch (vestaError) {
                console.error('Error updating Vestaboard from presentation API:', vestaError);
                // Continue even if Vestaboard update fails
            }
        }
        
        // Format for presentation
        const formattedData = {
            title: "Flight Schedule",
            subtitle: `Updated: ${new Date().toLocaleString()}`,
            tableHeaders: ["Time", "Name", "Type", "Flight #"],
            tableData: sortedFlights.map(flight => {
                // Format time to be more readable (e.g., 1230 -> 12:30)
                const timeStr = flight.time || '0000';
                const formattedTime = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
                
                return [
                    formattedTime,
                    flight.callsign || '',
                    flight.type || 'PPL',
                    flight.destination || ''
                ];
            }),
            // Add additional metadata your presentation might need
            totalCount: sortedFlights.length,
            updateTimestamp: new Date().toISOString(),
            vestaboardUpdated: vestaUpdated
        };
        
        // Return the formatted data
        return res.status(200).json(formattedData);
        
    } catch (error) {
        console.error('Error fetching flight presentation data:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching flight data',
            error: error.message
        });
    }
}
