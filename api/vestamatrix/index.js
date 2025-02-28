import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { createEventMatrix } from '../../vestaboard/eventConversion';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Get type from query parameter - 'flights' or 'events'
        const type = req.query.type || 'flights';
        
        // Get test data to bypass database issues during testing
        // In real use, we would fetch from the database
        let matrix;
        
        if (type === 'flights') {
            // Hardcoded test flights
            const flights = [
                { time: "1230", callsign: "DavidF", type: "PPL", destination: "N38930" },
                { time: "1212", callsign: "sdljkj", type: "PPL", destination: "sdmnsa" }
            ];
            
            // Convert to Vestaboard matrix
            matrix = createVestaMatrix(flights);
        } else {
            // Hardcoded test events
            const events = [
                { date: "31/22", time: "1230", description: "dflkjsdljk" },
                { date: "12/33", time: "1230", description: "sdlksdljks" }
            ];
            
            // Convert to Vestaboard matrix
            matrix = createEventMatrix(events);
        }
        
        // Return the matrix directly
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
